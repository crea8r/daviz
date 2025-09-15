use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(framework_key: Pubkey, asset_key: Pubkey)]
pub struct IssueTrust<'info> {
    #[account(
        init,
        payer = issuer,
        space = TrustRecord::SPACE,
        seeds = [b"trust_record", framework_key.as_ref(), issuer.key().as_ref(), asset_key.as_ref()],
        bump
    )]
    pub trust_record: Account<'info, TrustRecord>,

    #[account(
        constraint = trust_framework.is_active @ TrustErrorCode::FrameworkInactive
    )]
    pub trust_framework: Account<'info, TrustFramework>,

    #[account(
        constraint = asset_profile.is_active @ TrustErrorCode::AssetInactive
    )]
    pub asset_profile: Account<'info, AssetProfile>,

    #[account(mut)]
    pub issuer: Signer<'info>, // A2 - Trust issuer

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<IssueTrust>,
    _framework_key: Pubkey,
    _asset_key: Pubkey,
    trust_score: u8,
    evidence: String,
    expires_at: Option<i64>,
) -> Result<()> {
    require!(trust_score <= 100, TrustErrorCode::InvalidTrustScore);
    require!(evidence.len() <= TrustRecord::MAX_EVIDENCE_LEN, TrustErrorCode::EvidenceTooLong);

    if let Some(expiry) = expires_at {
        let clock = Clock::get()?;
        require!(expiry > clock.unix_timestamp, TrustErrorCode::ExpiryInPast);
    }

    let trust_record = &mut ctx.accounts.trust_record;
    let clock = Clock::get()?;

    trust_record.framework = ctx.accounts.trust_framework.key();
    trust_record.issuer = ctx.accounts.issuer.key();
    trust_record.target_asset = ctx.accounts.asset_profile.key();
    trust_record.trust_score = trust_score;
    trust_record.evidence = evidence;
    trust_record.is_active = true;
    trust_record.issued_at = clock.unix_timestamp;
    trust_record.expires_at = expires_at;
    trust_record.bump = ctx.bumps.trust_record;

    msg!(
        "Trust issued by {} for asset {} with score {}",
        ctx.accounts.issuer.key(),
        ctx.accounts.asset_profile.key(),
        trust_score
    );

    Ok(())
}

#[error_code]
pub enum TrustErrorCode {
    #[msg("Trust framework is not active")]
    FrameworkInactive,
    #[msg("Asset profile is not active")]
    AssetInactive,
    #[msg("Trust score must be between 0 and 100")]
    InvalidTrustScore,
    #[msg("Evidence text is too long")]
    EvidenceTooLong,
    #[msg("Expiry date cannot be in the past")]
    ExpiryInPast,
}