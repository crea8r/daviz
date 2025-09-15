use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UpdateTrustFramework<'info> {
    #[account(
        mut,
        constraint = trust_framework.authority == authority.key() @ UpdateErrorCode::Unauthorized,
        seeds = [b"trust_framework", authority.key().as_ref(), trust_framework.framework_id.to_le_bytes().as_ref()],
        bump = trust_framework.bump
    )]
    pub trust_framework: Account<'info, TrustFramework>,

    pub authority: Signer<'info>, // A1 - Framework authority
}

pub fn handler(
    ctx: Context<UpdateTrustFramework>,
    name: Option<String>,
    description: Option<String>,
    criteria: Option<Vec<String>>,
    is_active: Option<bool>,
) -> Result<()> {
    let trust_framework = &mut ctx.accounts.trust_framework;

    if let Some(new_name) = name {
        require!(new_name.len() <= TrustFramework::MAX_NAME_LEN, UpdateErrorCode::NameTooLong);
        trust_framework.name = new_name;
    }

    if let Some(new_description) = description {
        require!(new_description.len() <= TrustFramework::MAX_DESCRIPTION_LEN, UpdateErrorCode::DescriptionTooLong);
        trust_framework.description = new_description;
    }

    if let Some(new_criteria) = criteria {
        require!(new_criteria.len() <= TrustFramework::MAX_CRITERIA_COUNT, UpdateErrorCode::TooManyCriteria);
        for criterion in &new_criteria {
            require!(criterion.len() <= TrustFramework::MAX_CRITERIA_LEN, UpdateErrorCode::CriteriaTooLong);
        }
        trust_framework.criteria = new_criteria;
    }

    if let Some(active_status) = is_active {
        trust_framework.is_active = active_status;
    }

    msg!("Trust framework {} updated", trust_framework.framework_id);

    Ok(())
}

#[error_code]
pub enum UpdateErrorCode {
    #[msg("Unauthorized: Only framework authority can update")]
    Unauthorized,
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Too many criteria")]
    TooManyCriteria,
    #[msg("Criteria text is too long")]
    CriteriaTooLong,
}