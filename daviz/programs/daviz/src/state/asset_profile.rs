use anchor_lang::prelude::*;

#[account]
pub struct AssetProfile {
    pub owner: Pubkey,             // A3 - Asset owner
    pub asset_id: u64,             // Unique asset identifier
    pub name: String,              // Asset/business name
    pub description: String,       // Asset description
    pub asset_type: AssetType,     // Type of asset/business
    pub metadata_uri: Option<String>, // Optional metadata URI
    pub is_active: bool,           // Asset status
    pub created_at: i64,           // Creation timestamp
    pub bump: u8,                  // PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetType {
    Business,
    RealEstate,
    Intellectual,
    Digital,
    Other,
}

impl AssetProfile {
    pub const MAX_NAME_LEN: usize = 100;
    pub const MAX_DESCRIPTION_LEN: usize = 300;
    pub const MAX_METADATA_URI_LEN: usize = 200;

    pub const SPACE: usize = 8 + // discriminator
        32 + // owner
        8 + // asset_id
        4 + Self::MAX_NAME_LEN + // name
        4 + Self::MAX_DESCRIPTION_LEN + // description
        1 + // asset_type
        1 + 4 + Self::MAX_METADATA_URI_LEN + // metadata_uri (Option<String>)
        1 + // is_active
        8 + // created_at
        1; // bump
}