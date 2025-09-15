use anchor_lang::prelude::*;

#[account]
pub struct TrustRecord {
    pub framework: Pubkey,         // Reference to trust framework
    pub issuer: Pubkey,            // A2 - Trust issuer
    pub target_asset: Pubkey,      // Reference to asset profile (A3's asset)
    pub trust_score: u8,           // Trust score (0-100)
    pub evidence: String,          // Evidence/justification
    pub is_active: bool,           // Trust record status
    pub issued_at: i64,            // Issuance timestamp
    pub expires_at: Option<i64>,   // Optional expiration
    pub bump: u8,                  // PDA bump
}

impl TrustRecord {
    pub const MAX_EVIDENCE_LEN: usize = 500;

    pub const SPACE: usize = 8 + // discriminator
        32 + // framework
        32 + // issuer
        32 + // target_asset
        1 + // trust_score
        4 + Self::MAX_EVIDENCE_LEN + // evidence
        1 + // is_active
        8 + // issued_at
        1 + 8 + // expires_at (Option<i64>)
        1; // bump
}