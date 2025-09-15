# Daviz Marketplace App

A React application connecting buyers with trusted businesses and enabling consultants to manage client orders. Built on the Solana blockchain using the Daviz trust framework program.

## Overview

This application serves **A4 (Buyers)** and **A5 (Consultants)** in the Daviz ecosystem:

- **A4 (Buyers)** discover and connect with verified businesses based on trust scores
- **A5 (Consultants)** manage client orders and facilitate business deals

## Architecture

### User Roles

**A4 - Buyers (e.g., Investors, Companies seeking partners)**
- Search businesses by trust score, industry, and framework
- View detailed trust certificates and evidence
- Place interest orders for specific businesses
- Connect with consultants for deal facilitation

**A5 - Consultants (e.g., Business Development, M&A Advisors)**
- Monitor all interest orders across the platform
- Accept/decline orders based on expertise
- Manage order status and client communications
- Track completed projects and revenue

### Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Solana + Anchor v0.31.1  
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare)
- **Styling**: Custom CSS with utility-first approach
- **State Management**: React hooks + Local storage for orders

## Project Structure

```
marketplace-app/
├── src/
│   ├── components/
│   │   ├── BusinessMarketplace.tsx     # A4 business discovery
│   │   └── ConsultantDashboard.tsx     # A5 order management
│   ├── contexts/
│   │   └── WalletProvider.tsx          # Solana wallet context
│   ├── hooks/
│   │   └── useDavizClient.ts           # Anchor client + order manager
│   ├── lib/
│   │   └── anchor-client.ts            # Enhanced Daviz client
│   ├── idl/
│   │   └── daviz.json                  # Program IDL
│   ├── daviz.ts                        # Program types
│   ├── App.tsx                         # Main application
│   └── App.css                         # Styling
├── package.json
└── vite.config.ts
```

## Key Features

### Business Discovery (A4)
- **Smart Search**: Filter by trust score range, asset type, framework
- **Trust Transparency**: View detailed certificates with evidence
- **Framework Context**: See evaluation criteria for each trust score
- **Interest Orders**: Place detailed orders with budget and timeline
- **Real-time Data**: Live blockchain data for trust records

### Consultant Dashboard (A5)
- **Order Management**: View, accept, decline, and complete orders
- **Status Tracking**: Full order lifecycle management
- **Client Information**: Access to buyer contact details and requirements
- **Analytics**: Order statistics and performance metrics
- **Filtering**: Sort orders by status, date, and other criteria

## Data Flow

```
A1 creates Framework → A2 issues Trust to A3's Business
                   ↓
A4 discovers Business → Places Interest Order
                   ↓
A5 receives Order → Accepts/Manages → Facilitates Deal
                   ↓
Order completed off-chain → Status updated on platform
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
- Switch between A4/A5 workflows using navigation tabs

## Usage Workflows

### A4 - Business Discovery & Ordering

1. **Connect wallet** and navigate to "Business Discovery (A4)" tab
2. **Search & Filter businesses:**
   - Set trust score range (e.g., 80-100 for high-trust only)
   - Filter by asset type (Business, Real Estate, etc.)
   - Search by name or description
3. **Review business details:**
   - Trust score and issuing framework
   - Evidence provided by trust issuer (A2)
   - Business description and type
4. **Place Interest Order:**
   - Describe your requirements and interest
   - Provide contact information
   - Optional: Set budget range and timeline
   - Submit order for consultant review

### A5 - Consultant Order Management

1. **Connect wallet** and navigate to "Consultant Dashboard (A5)" tab
2. **Monitor incoming orders:**
   - View all pending orders across platform
   - See buyer information and requirements
   - Filter by status and sort by date
3. **Manage orders:**
   - Accept orders that match your expertise
   - Decline orders outside your scope
   - Mark orders as completed after deal closure
4. **Track performance:**
   - View statistics on total/pending/completed orders
   - Monitor order details and client information

## Enhanced Features

### Advanced Search & Filtering
- Multiple filter combinations (score + type + framework)
- Real-time search with instant results
- Clear filter functionality for easy reset

### Order System
- Persistent local storage for order management
- Unique order IDs with timestamps
- Status tracking: Pending → Accepted → Completed/Cancelled
- Rich order details with buyer contact information

### Trust Transparency
- Display trust framework criteria for context
- Show evidence provided by trust issuers
- Color-coded trust scores for quick assessment
- Framework authority information

## Data Management

### On-Chain Data (Via Anchor Program)
- Trust frameworks and criteria
- Business/asset profiles  
- Trust certificates and scores
- Issuer evidence and validation

### Off-Chain Data (Local Storage)
- Interest orders and status
- Buyer-consultant communications
- Order history and analytics
- User preferences and filters

> **Note**: In production, off-chain data would typically use a backend database with proper authentication and access controls.

## Integration Notes

### With Trust Management App
- Shares same Anchor program and types
- Businesses must have trust certificates to appear
- Real-time sync with on-chain trust data

### With External Systems
- `DavizClient` can be extracted for API integrations
- Order data can be exported for CRM systems
- Trust verification available via public methods

## Configuration

### Network Configuration
Edit `src/contexts/WalletProvider.tsx` to change networks:

```typescript
// For local development
const endpoint = 'http://127.0.0.1:8899';

// For devnet testing  
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl('devnet');
```

### Program ID
Update `PROGRAM_ID` in `src/lib/anchor-client.ts` if program deployed to different address.

## Security & Privacy

### Buyer Protection
- No payment processing (orders are interest expressions only)
- Contact information shared only after consultant accepts
- Wallet addresses used for identity verification

### Consultant Benefits
- Full order details before accepting
- Client contact information for direct communication
- Order status tracking for accountability

### Data Privacy
- Order data stored locally in browser
- No sensitive information transmitted on-chain
- Wallet connection required for identity verification

## Known Limitations

- **Off-chain Orders**: Order system uses local storage (not blockchain)
- **No Payment Integration**: No built-in payment or escrow system
- **Manual Status Updates**: Order status managed manually by consultants
- **Local Network Only**: Currently configured for localhost/devnet
- **No Identity Verification**: Beyond wallet connection

## Future Enhancements

### Phase 1 - Platform Improvements
- Backend database for order persistence
- Real-time notifications for new orders
- Advanced analytics and reporting
- Mobile-responsive design optimization

### Phase 2 - Business Features
- Consultant profiles and ratings system
- Order escrow and payment integration
- Multi-language support for global reach
- Integration with external business databases

### Phase 3 - Advanced Features
- AI-powered business matching
- Automated due diligence workflows
- Smart contract-based order management
- Cross-chain trust verification

## Development Notes

### Adding New Features
- New search filters → Update `BusinessMarketplace.tsx` filter logic
- Order workflow changes → Modify `OrderManager` class methods
- UI improvements → Update component CSS and styling
- Data sources → Extend `DavizClient` with new methods

### Testing Scenarios
1. **A1** creates frameworks via trust-management-app
2. **A2** issues trust certificates to businesses
3. **A4** searches and places orders via marketplace-app
4. **A5** manages orders via consultant dashboard
5. End-to-end flow from trust issuance to order completion

### Deployment Considerations
- Environment variables for network configuration
- Database setup for production order management
- Authentication system for consultant verification
- Monitoring and analytics for platform usage

## Error Handling

The app includes comprehensive error handling for:
- Wallet connection issues
- Blockchain data loading failures  
- Order creation and status update errors
- Network connectivity problems
- Missing trust data dependencies

## API Reference

### DavizClient Methods
```typescript
// Search and discovery
async getAllTrustRecordsWithDetails()
async searchAssetsByTrustScore(minScore?, maxScore?)
async searchAssetsByFramework(frameworkPda)

// Asset management (A3)
async createAssetProfile(assetId, name, description, assetType, metadataUri?)

// Data fetching
async getTrustFrameworks(authority?)
async getAssetProfiles(owner?)
async getTrustRecordsForAsset(assetPda)
```

### OrderManager Methods
```typescript
// Order management
createOrder(order): InterestOrder
getOrdersForAsset(assetPda): InterestOrder[]
getAllOrders(): InterestOrder[]
updateOrderStatus(orderId, status)
```

---

**Ready for Production?** This marketplace app provides a complete foundation for business discovery and consultant order management. Extend with backend integration, payment systems, and advanced matching algorithms as needed.
