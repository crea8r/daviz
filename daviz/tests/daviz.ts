import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Daviz } from "../target/types/daviz";
import { expect } from "chai";

describe("daviz", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.daviz as Program<Daviz>;
  const provider = anchor.getProvider();

  // Test keypairs
  const a1Authority = anchor.web3.Keypair.generate(); // A1 - Framework issuer
  const a2Issuer = anchor.web3.Keypair.generate();    // A2 - Trust issuer
  const a3Owner = anchor.web3.Keypair.generate();     // A3 - Asset owner

  let trustFrameworkPda: anchor.web3.PublicKey;
  let assetProfilePda: anchor.web3.PublicKey;
  let trustRecordPda: anchor.web3.PublicKey;

  const frameworkId = new anchor.BN(1);
  const assetId = new anchor.BN(1);

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(a1Authority.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(a2Issuer.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(a3Owner.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Derive PDAs
    [trustFrameworkPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("trust_framework"),
        a1Authority.publicKey.toBuffer(),
        frameworkId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    [assetProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("asset_profile"),
        a3Owner.publicKey.toBuffer(),
        assetId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    [trustRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("trust_record"),
        trustFrameworkPda.toBuffer(),
        a2Issuer.publicKey.toBuffer(),
        assetProfilePda.toBuffer(),
      ],
      program.programId
    );
  });

  it("Should initialize the program", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Initialization transaction signature", tx);
  });

  it("A1 should create a trust framework", async () => {
    const tx = await program.methods
      .createTrustFramework(
        frameworkId,
        "Business Verification Framework",
        "Framework for verifying business legitimacy and operations",
        ["Valid business registration", "Financial transparency", "Customer reviews"]
      )
      .accounts({
        trustFramework: trustFrameworkPda,
        authority: a1Authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([a1Authority])
      .rpc();

    console.log("Trust framework creation transaction", tx);

    // Verify the trust framework was created correctly
    const trustFramework = await program.account.trustFramework.fetch(trustFrameworkPda);
    expect(trustFramework.authority.toString()).to.equal(a1Authority.publicKey.toString());
    expect(trustFramework.frameworkId.toString()).to.equal(frameworkId.toString());
    expect(trustFramework.name).to.equal("Business Verification Framework");
    expect(trustFramework.isActive).to.be.true;
    expect(trustFramework.criteria).to.have.length(3);
  });

  it("A3 should create an asset profile", async () => {
    const tx = await program.methods
      .createAssetProfile(
        assetId,
        "Tech Startup Inc",
        "Innovative software development company specializing in blockchain solutions",
        { business: {} }, // AssetType::Business
        "https://techstartup.com/metadata"
      )
      .accounts({
        assetProfile: assetProfilePda,
        owner: a3Owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([a3Owner])
      .rpc();

    console.log("Asset profile creation transaction", tx);

    // Verify the asset profile was created correctly
    const assetProfile = await program.account.assetProfile.fetch(assetProfilePda);
    expect(assetProfile.owner.toString()).to.equal(a3Owner.publicKey.toString());
    expect(assetProfile.assetId.toString()).to.equal(assetId.toString());
    expect(assetProfile.name).to.equal("Tech Startup Inc");
    expect(assetProfile.isActive).to.be.true;
  });

  it("A2 should issue trust for A3's asset using A1's framework", async () => {
    const trustScore = 85;
    const evidence = "Verified business registration, reviewed financial statements, confirmed positive customer feedback";

    const tx = await program.methods
      .issueTrust(
        trustFrameworkPda,
        assetProfilePda,
        trustScore,
        evidence,
        null // No expiry
      )
      .accounts({
        trustRecord: trustRecordPda,
        trustFramework: trustFrameworkPda,
        assetProfile: assetProfilePda,
        issuer: a2Issuer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([a2Issuer])
      .rpc();

    console.log("Trust issuance transaction", tx);

    // Verify the trust record was created correctly
    const trustRecord = await program.account.trustRecord.fetch(trustRecordPda);
    expect(trustRecord.framework.toString()).to.equal(trustFrameworkPda.toString());
    expect(trustRecord.issuer.toString()).to.equal(a2Issuer.publicKey.toString());
    expect(trustRecord.targetAsset.toString()).to.equal(assetProfilePda.toString());
    expect(trustRecord.trustScore).to.equal(trustScore);
    expect(trustRecord.evidence).to.equal(evidence);
    expect(trustRecord.isActive).to.be.true;
    expect(trustRecord.expiresAt).to.be.null;
  });

  it("A1 should be able to update their trust framework", async () => {
    const tx = await program.methods
      .updateTrustFramework(
        "Updated Business Verification Framework",
        null, // Keep same description
        ["Valid business registration", "Financial transparency", "Customer reviews", "Compliance verification"],
        null // Keep active status
      )
      .accounts({
        trustFramework: trustFrameworkPda,
        authority: a1Authority.publicKey,
      })
      .signers([a1Authority])
      .rpc();

    console.log("Trust framework update transaction", tx);

    // Verify the trust framework was updated
    const trustFramework = await program.account.trustFramework.fetch(trustFrameworkPda);
    expect(trustFramework.name).to.equal("Updated Business Verification Framework");
    expect(trustFramework.criteria).to.have.length(4);
  });
});
