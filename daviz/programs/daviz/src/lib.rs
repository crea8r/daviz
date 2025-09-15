pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("B1EzQtkQo1o3dthdo1XHfc3R8qa4zLwxEwp8ATAW2sDS");

#[program]
pub mod daviz {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn create_trust_framework(
        ctx: Context<CreateTrustFramework>,
        framework_id: u64,
        name: String,
        description: String,
        criteria: Vec<String>,
    ) -> Result<()> {
        create_trust_framework::handler(ctx, framework_id, name, description, criteria)
    }

    pub fn create_asset_profile(
        ctx: Context<CreateAssetProfile>,
        asset_id: u64,
        name: String,
        description: String,
        asset_type: AssetType,
        metadata_uri: Option<String>,
    ) -> Result<()> {
        create_asset_profile::handler(ctx, asset_id, name, description, asset_type, metadata_uri)
    }

    pub fn issue_trust(
        ctx: Context<IssueTrust>,
        framework_key: Pubkey,
        asset_key: Pubkey,
        trust_score: u8,
        evidence: String,
        expires_at: Option<i64>,
    ) -> Result<()> {
        issue_trust::handler(ctx, framework_key, asset_key, trust_score, evidence, expires_at)
    }

    pub fn update_trust_framework(
        ctx: Context<UpdateTrustFramework>,
        name: Option<String>,
        description: Option<String>,
        criteria: Option<Vec<String>>,
        is_active: Option<bool>,
    ) -> Result<()> {
        update_trust_framework::handler(ctx, name, description, criteria, is_active)
    }
}
