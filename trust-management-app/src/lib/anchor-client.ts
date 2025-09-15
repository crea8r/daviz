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
    // 
    this.program = new anchor.Program(idl as Daviz, this.provider);
  }

  // A1 - Create Trust Framework
  async createTrustFramework(
    frameworkId: number,
    name: string,
    description: string,
    criteria: string[]
  ) {
    const authority = this.provider.wallet.publicKey;

    const [trustFrameworkPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('trust_framework'),
        authority.toBuffer(),
        new anchor.BN(frameworkId).toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .createTrustFramework(
        new anchor.BN(frameworkId),
        name,
        description,
        criteria
      )
      .accounts({
        trustFramework: trustFrameworkPda,
        authority: authority,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    return { signature: tx, trustFrameworkPda };
  }

  // A2 - Issue Trust Certificate
  async issueTrust(
    frameworkPda: PublicKey,
    assetPda: PublicKey,
    trustScore: number,
    evidence: string,
    expiresAt?: number
  ) {
    const issuer = this.provider.wallet.publicKey;

    const [trustRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('trust_record'),
        frameworkPda.toBuffer(),
        issuer.toBuffer(),
        assetPda.toBuffer(),
      ],
      this.program.programId
    );

    const tx = await this.program.methods
      .issueTrust(
        frameworkPda,
        assetPda,
        trustScore,
        evidence,
        expiresAt ? new anchor.BN(expiresAt) : null
      )
      .accounts({
        trustRecord: trustRecordPda,
        trustFramework: frameworkPda,
        assetProfile: assetPda,
        issuer: issuer,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    return { signature: tx, trustRecordPda };
  }

  // A3 - Create Asset Profile
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
      } as any)
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

  // Fetch Asset Profiles
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

  // Fetch Trust Records
  async getTrustRecords(frameworkPda?: PublicKey, issuer?: PublicKey) {
    let filters = [];

    if (frameworkPda) {
      filters.push({
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: frameworkPda.toBase58(),
        },
      });
    }

    if (issuer) {
      filters.push({
        memcmp: {
          offset: 40, // Skip discriminator + framework pubkey
          bytes: issuer.toBase58(),
        },
      });
    }

    return this.program.account.trustRecord.all(filters);
  }
}