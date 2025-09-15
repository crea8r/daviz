use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(framework_id: u64, name: String)]
pub struct CreateTrustFramework<'info> {
    #[account(
        init,
        payer = authority,
        space = TrustFramework::SPACE,
        seeds = [b"trust_framework", authority.key().as_ref(), framework_id.to_le_bytes().as_ref()],
        bump
    )]
    pub trust_framework: Account<'info, TrustFramework>,

    #[account(mut)]
    pub authority: Signer<'info>, // A1 - Framework issuer

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateTrustFramework>,
    framework_id: u64,
    name: String,
    description: String,
    criteria: Vec<String>,
) -> Result<()> {
    require!(name.len() <= TrustFramework::MAX_NAME_LEN, ErrorCode::NameTooLong);
    require!(description.len() <= TrustFramework::MAX_DESCRIPTION_LEN, ErrorCode::DescriptionTooLong);
    require!(criteria.len() <= TrustFramework::MAX_CRITERIA_COUNT, ErrorCode::TooManyCriteria);

    for criterion in &criteria {
        require!(criterion.len() <= TrustFramework::MAX_CRITERIA_LEN, ErrorCode::CriteriaTooLong);
    }

    let trust_framework = &mut ctx.accounts.trust_framework;
    let clock = Clock::get()?;

    trust_framework.authority = ctx.accounts.authority.key();
    trust_framework.framework_id = framework_id;
    trust_framework.name = name;
    trust_framework.description = description;
    trust_framework.criteria = criteria;
    trust_framework.is_active = true;
    trust_framework.created_at = clock.unix_timestamp;
    trust_framework.bump = ctx.bumps.trust_framework;

    msg!("Trust framework {} created by {}", framework_id, ctx.accounts.authority.key());

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Too many criteria")]
    TooManyCriteria,
    #[msg("Criteria text is too long")]
    CriteriaTooLong,
}