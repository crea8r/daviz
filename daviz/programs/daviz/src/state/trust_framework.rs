use anchor_lang::prelude::*;

#[account]
pub struct TrustFramework {
    pub authority: Pubkey,         // A1 - Framework issuer
    pub framework_id: u64,         // Unique framework identifier
    pub name: String,              // Framework name
    pub description: String,       // Framework description
    pub criteria: Vec<String>,     // Trust criteria
    pub is_active: bool,           // Framework status
    pub created_at: i64,           // Creation timestamp
    pub bump: u8,                  // PDA bump
}

impl TrustFramework {
    pub const MAX_NAME_LEN: usize = 50;
    pub const MAX_DESCRIPTION_LEN: usize = 200;
    pub const MAX_CRITERIA_COUNT: usize = 10;
    pub const MAX_CRITERIA_LEN: usize = 100;

    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        8 + // framework_id
        4 + Self::MAX_NAME_LEN + // name
        4 + Self::MAX_DESCRIPTION_LEN + // description
        4 + (4 + Self::MAX_CRITERIA_LEN) * Self::MAX_CRITERIA_COUNT + // criteria
        1 + // is_active
        8 + // created_at
        1; // bump
}