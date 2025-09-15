import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import type { Daviz } from '../daviz';
import idl from '../idl/daviz.json';

export const PROGRAM_ID = new PublicKey('B1EzQtkQo1o3dthdo1XHfc3R8qa4zLwxEwp8ATAW2sDS');

export class DavizClient {
  program: anchor.Program<Daviz>;
  provider: anchor.AnchorProvider;

  constructor(connection: Connection, wallet: anchor.Wallet) {
    this.provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    anchor.setProvider(this.provider);
    // this.program = new anchor.Program(idl as Daviz, PROGRAM_ID, this.provider);
    this.program = new anchor.Program(idl as Daviz, this.provider);
  }

  // A3 - Create Asset Profile (needed for marketplace)
  async createAssetProfile(
    assetId: number,
    name: string,
    description: string,
    assetType: any,
    metadataUri?: string
  ) {
    const owner = this.provider.wallet.publicKey;

    const [assetProfilePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('asset_profile'),
        owner.toBuffer(),
        new anchor.BN(assetId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .createAssetProfile(
        new anchor.BN(assetId),
        name,
        description,
        assetType,
        metadataUri || null
      )
      .accounts({
        assetProfile: assetProfilePda,
        owner: owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return { signature: tx, assetProfilePda };
  }

  // Fetch Trust Frameworks
  async getTrustFrameworks(authority?: PublicKey) {
    const filters = authority
      ? [
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: authority.toBase58(),
            },
          },
        ]
      : [];

    return this.program.account.trustFramework.all(filters);
  }

  // Fetch Asset Profiles with Trust Data
  async getAssetProfiles(owner?: PublicKey) {
    const filters = owner
      ? [
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: owner.toBase58(),
            },
          },
        ]
      : [];

    return this.program.account.assetProfile.all(filters);
  }

  // Fetch Trust Records for an asset
  async getTrustRecordsForAsset(assetPda: PublicKey) {
    const filters = [
      {
        memcmp: {
          offset: 72, // Skip discriminator + framework + issuer
          bytes: assetPda.toBase58(),
        },
      },
    ];

    return this.program.account.trustRecord.all(filters);
  }

  // Get all trust records with framework and asset details
  async getAllTrustRecordsWithDetails() {
    const [trustRecords, frameworks, assets] = await Promise.all([
      this.program.account.trustRecord.all(),
      this.program.account.trustFramework.all(),
      this.program.account.assetProfile.all(),
    ]);

    // Create lookup maps
    const frameworkMap = new Map(
      frameworks.map(f => [f.publicKey.toString(), f])
    );
    const assetMap = new Map(
      assets.map(a => [a.publicKey.toString(), a])
    );

    // Combine data
    return trustRecords.map(record => ({
      ...record,
      framework: frameworkMap.get(record.account.framework.toString()),
      asset: assetMap.get(record.account.targetAsset.toString()),
    }));
  }

  // Search assets by trust score range
  async searchAssetsByTrustScore(minScore?: number, maxScore?: number) {
    const allRecordsWithDetails = await this.getAllTrustRecordsWithDetails();

    return allRecordsWithDetails.filter(record => {
      const score = record.account.trustScore;
      const matchesMin = minScore === undefined || score >= minScore;
      const matchesMax = maxScore === undefined || score <= maxScore;
      return matchesMin && matchesMax && record.account.isActive;
    });
  }

  // Search assets by framework
  async searchAssetsByFramework(frameworkPda: PublicKey) {
    const filters = [
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: frameworkPda.toBase58(),
        },
      },
    ];

    const trustRecords = await this.program.account.trustRecord.all(filters);

    // Get asset details for each trust record
    const assetsWithTrust = await Promise.all(
      trustRecords.map(async (record) => {
        const asset = await this.program.account.assetProfile.fetch(
          record.account.targetAsset
        );
        return {
          trustRecord: record,
          asset: { publicKey: record.account.targetAsset, account: asset },
        };
      })
    );

    return assetsWithTrust.filter(item =>
      item.trustRecord.account.isActive && item.asset.account.isActive
    );
  }
}

// Types for marketplace
export interface AssetWithTrust {
  publicKey: PublicKey;
  account: {
    owner: PublicKey;
    assetId: any;
    name: string;
    description: string;
    assetType: any;
    metadataUri?: string;
    isActive: boolean;
    createdAt: any;
  };
  trustRecords: Array<{
    publicKey: PublicKey;
    account: {
      framework: PublicKey;
      issuer: PublicKey;
      trustScore: number;
      evidence: string;
      isActive: boolean;
      issuedAt: any;
      expiresAt?: any;
    };
    framework?: {
      publicKey: PublicKey;
      account: {
        name: string;
        description: string;
        criteria: string[];
      };
    };
  }>;
}

export interface InterestOrder {
  id: string;
  buyerAddress: string;
  assetPda: string;
  message: string;
  contactInfo: string;
  budget?: string;
  timeline?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

// Mock data storage (in real app, this would be off-chain database)
export class OrderManager {
  private orders: InterestOrder[] = [];
  private storageKey = 'daviz-orders';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.orders = JSON.parse(stored);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    }
  }

  createOrder(order: Omit<InterestOrder, 'id' | 'createdAt' | 'status'>): InterestOrder {
    const newOrder: InterestOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending',
    };

    this.orders.push(newOrder);
    this.saveToStorage();
    return newOrder;
  }

  getOrdersForAsset(assetPda: string): InterestOrder[] {
    return this.orders.filter(order => order.assetPda === assetPda);
  }

  getAllOrders(): InterestOrder[] {
    return [...this.orders];
  }

  updateOrderStatus(orderId: string, status: InterestOrder['status']) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      this.saveToStorage();
    }
  }
}