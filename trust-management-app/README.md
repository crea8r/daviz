# Trust Management App

A React application for managing trust frameworks and issuing certificates on the Solana blockchain using the Daviz trust framework program.

## Overview

This application serves **A1 (Framework Authorities)** and **A2 (Trust Issuers)** in the Daviz ecosystem:

- **A1** creates and manages trust frameworks with specific criteria
- **A2** uses existing frameworks to issue trust certificates to businesses/assets

## Architecture

### User Roles

**A1 - Framework Authority (e.g., KPMG Global Standards)**
- Create trust frameworks with custom criteria
- Define evaluation standards for specific industries/use cases
- Update framework details and criteria
- Manage framework active/inactive status

**A2 - Trust Issuer (e.g., KPMG Vietnam, Local Auditors)**
- Browse available trust frameworks
- Evaluate businesses/assets against framework criteria
- Issue trust certificates with scores (0-100)
- Provide evidence and justification for trust scores
- Set optional expiration dates for certificates

### Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Solana + Anchor v0.31.1
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare)
- **Styling**: Custom CSS with Tailwind-like utilities
- **State Management**: React hooks + Anchor client

## Project Structure

```
trust-management-app/
├── src/
│   ├── components/
│   │   ├── CreateTrustFramework.tsx    # A1 workflow component
│   │   └── IssueCertificate.tsx        # A2 workflow component
│   ├── contexts/
│   │   └── WalletProvider.tsx          # Solana wallet context
│   ├── hooks/
│   │   └── useDavizClient.ts           # Hook for Anchor client
│   ├── lib/
│   │   └── anchor-client.ts            # Daviz program client
│   ├── idl/
│   │   └── daviz.json                  # Program IDL
│   ├── daviz.ts                        # Program types
│   ├── App.tsx                         # Main application
│   └── App.css                         # Styling
├── package.json
└── vite.config.ts
```

## Key Components

### DavizClient (src/lib/anchor-client.ts)
Central client for interacting with the Daviz Anchor program:

```typescript
class DavizClient {
  // A1 - Create trust frameworks
  async createTrustFramework(frameworkId, name, description, criteria)

  // A2 - Issue trust certificates
  async issueTrust(frameworkPda, assetPda, trustScore, evidence, expiresAt?)

  // A3 - Create asset profiles (for future use)
  async createAssetProfile(assetId, name, description, assetType, metadataUri?)

  // Data fetching
  async getTrustFrameworks(authority?)
  async getAssetProfiles(owner?)
  async getTrustRecords(frameworkPda?, issuer?)
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- Solana CLI
- Anchor CLI v0.31.1
- A Solana wallet (Phantom, Solflare)

### Development Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Copy program artifacts:**
```bash
# Copy IDL and types from parent Anchor program
cp ../daviz/target/idl/daviz.json src/idl/
cp ../daviz/target/types/daviz.ts src/
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access application:**
- Open http://localhost:5173
- Connect your Solana wallet
- Switch between A1/A2 workflows using navigation tabs

## Usage Workflows

### A1 - Creating Trust Framework

1. Connect wallet and navigate to "Create Framework (A1)" tab
2. Fill in framework details:
   - **Framework ID**: Unique numeric identifier
   - **Name**: Framework name (max 50 chars)
   - **Description**: Purpose and scope (max 200 chars)
   - **Criteria**: List of evaluation criteria (max 10, 100 chars each)
3. Submit transaction and note the Framework PDA address

### A2 - Issuing Trust Certificate

1. Connect wallet and navigate to "Issue Certificate (A2)" tab
2. Select existing trust framework from dropdown
3. Review framework criteria displayed
4. Select target asset/business (requires A3 to create profiles first)
5. Enter trust evaluation:
   - **Trust Score**: 0-100 numeric score
   - **Evidence**: Detailed justification (max 500 chars)
   - **Expiration**: Optional future date
6. Submit transaction and note the Trust Record PDA address

## Configuration

### Network Configuration
Edit src/contexts/WalletProvider.tsx to change networks:

```typescript
// For local development
const endpoint = 'http://127.0.0.1:8899';

// For devnet testing
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl('devnet');
```

## Known Limitations

- Currently requires A3 asset profiles to exist before A2 can issue certificates
- No framework editing UI (requires A1 to update via program calls)
- Limited to 10 criteria per framework (program constraint)
- No certificate revocation workflow implemented
- Devnet/localhost only (not production ready)

## Future Enhancements

- Framework search/filtering capabilities
- Certificate history and status tracking
- Integration with external identity providers
- Mobile-responsive design improvements
