use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(asset_id: u64)]
pub struct CreateAssetProfile<'info> {
    #[account(
        init,
        payer = owner,
        space = AssetProfile::SPACE,
        seeds = [b"asset_profile", owner.key().as_ref(), asset_id.to_le_bytes().as_ref()],
        bump
    )]
    pub asset_profile: Account<'info, AssetProfile>,

    #[account(mut)]
    pub owner: Signer<'info>, // A3 - Asset owner

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateAssetProfile>,
    asset_id: u64,
    name: String,
    description: String,
    asset_type: AssetType,
    metadata_uri: Option<String>,
) -> Result<()> {
    require!(name.len() <= AssetProfile::MAX_NAME_LEN, AssetErrorCode::NameTooLong);
    require!(description.len() <= AssetProfile::MAX_DESCRIPTION_LEN, AssetErrorCode::DescriptionTooLong);

    if let Some(ref uri) = metadata_uri {
        require!(uri.len() <= AssetProfile::MAX_METADATA_URI_LEN, AssetErrorCode::MetadataUriTooLong);
    }

    let asset_profile = &mut ctx.accounts.asset_profile;
    let clock = Clock::get()?;

    asset_profile.owner = ctx.accounts.owner.key();
    asset_profile.asset_id = asset_id;
    asset_profile.name = name;
    asset_profile.description = description;
    asset_profile.asset_type = asset_type;
    asset_profile.metadata_uri = metadata_uri;
    asset_profile.is_active = true;
    asset_profile.created_at = clock.unix_timestamp;
    asset_profile.bump = ctx.bumps.asset_profile;

    msg!("Asset profile {} created by {}", asset_id, ctx.accounts.owner.key());

    Ok(())
}

#[error_code]
pub enum AssetErrorCode {
    #[msg("Asset name is too long")]
    NameTooLong,
    #[msg("Asset description is too long")]
    DescriptionTooLong,
    #[msg("Metadata URI is too long")]
    MetadataUriTooLong,
}