# 🏠 WasiAI - Decentralized AI Agent Marketplace

> **Hackathon Submission: x402 Protocol Integration**

WasiAI is a decentralized marketplace where AI developers monetize their models through **micropayments** and **NFT licenses**. Built on Avalanche with x402 Protocol for gasless, pay-per-use AI inference.

![WasiAI Demo](https://img.shields.io/badge/Demo-Live-green) ![Avalanche](https://img.shields.io/badge/Chain-Avalanche%20Fuji-red) ![x402](https://img.shields.io/badge/Protocol-x402-blue)

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **x402 Micropayments** | Pay-per-use AI inference with USDC. No subscriptions. |
| **Gasless Transactions** | Ultravioleta DAO facilitator covers network fees |
| **On-chain Reputation** | ERC-8004 verifiable feedback system |
| **NFT Licenses** | Perpetual licenses as tradeable NFT assets |
| **Revenue Splitting** | Automatic royalty distribution via splitter contracts |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Models    │  │   Publish   │  │   Run Model (x402)  │  │
│  │   Browser   │  │   Wizard    │  │   Inference Panel   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes (Next.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  /api/      │  │  /api/      │  │  /api/inference/    │  │
│  │  models     │  │  indexed    │  │  [modelId]          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Neon Postgres │  │  x402 Facilitator│  │  Avalanche Fuji │
│   (Indexer DB)  │  │  (Ultravioleta)  │  │  Smart Contracts│
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MetaMask** or compatible wallet
- **AVAX** on Fuji testnet (for gas) - [Faucet](https://faucet.avax.network/)
- **USDC** on Fuji testnet (for payments)

### 1. Clone & Install

```bash
git clone https://github.com/ferrosasfp/WasiAIHackathonx402.git
cd WasiAIHackathonx402

# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts/evm && npm install && cd ../..
```

### 2. Environment Setup

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values (see Environment Variables section)
nano .env.local
```

### 3. Database Setup (Neon)

1. Create free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`
4. Run migrations:

```bash
npx prisma db push
npx prisma generate
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon Postgres connection string |
| `PINATA_JWT` | ✅ | Pinata API JWT for IPFS uploads |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | ✅ | Thirdweb client ID for wallet connection |
| `UPSTASH_REDIS_REST_URL` | ⚠️ | Redis cache (optional but recommended) |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ | Redis token |

**Note:** Smart contract addresses and x402 config are pre-configured for Avalanche Fuji testnet.

---

## 📋 Demo Flow

### 1. Browse Models
Navigate to `/models` to see published AI models with pricing.

### 2. Publish a Model (5-step wizard)
1. **Identity**: Name, description, cover image
2. **Business Profile**: Category, tags, author info
3. **Inference Config**: Endpoint URL, wallet address
4. **Pricing**: Perpetual license price, per-inference price (x402)
5. **Review & Publish**: Deploy to blockchain

### 3. Run Model with x402 Payments
1. Go to model detail page
2. Click "Run Model"
3. Enter input text
4. Approve USDC payment (micropayment via x402)
5. Receive AI inference result
6. Provide on-chain feedback (ERC-8004)

### 4. Dashboard
View earnings, usage analytics, and purchased licenses at `/dashboard`.

---

## 🔗 Smart Contracts (Avalanche Fuji)

| Contract | Address |
|----------|---------|
| **Marketplace** | `0xf1eA59d71C67e9E6Ea481Aa26911641a6c97370C` |
| **License NFT** | `0xC657F1B26fc56A0AA1481F502BCC6532B93d7426` |
| **Agent Registry** | `0x3421c2cDE342afF48C12Fe345eD81cA1ac4D89A6` |
| **Splitter Factory** | `0xf8d8C220181CAe9A748b8e817BFE337AB5b74731` |
| **Reputation (ERC-8004)** | `0xf4D4c4b91BaE8863f508B772f0195b7D3Fbc6412` |
| **MockUSDC** | `0xCDa6E1C8340550aC412Ee9BC59ae4Db46745C53e` |
| **Circle USDC (x402)** | `0x5425890298aed601595a70AB815c96711a31Bc65` |

---

## 🛠️ x402 Integration Details

### How x402 Works in WasiAI

```typescript
// 1. User requests inference
POST /api/inference/[modelId]
Body: { input: "Translate hello to Spanish" }

// 2. Server returns 402 Payment Required
Response: {
  status: 402,
  paymentDetails: {
    amount: "50000", // 0.05 USDC
    recipient: "0x...", // Model owner's splitter
    token: "0x5425890298aed601595a70AB815c96711a31Bc65"
  }
}

// 3. Client signs USDC permit via x402 facilitator
// 4. Facilitator executes payment + inference
// 5. Result returned to user
```

### Key Files

- `src/lib/x402-constants.ts` - Protocol constants and types
- `src/lib/x402-facilitators.ts` - Facilitator abstraction layer
- `src/app/api/inference/[modelId]/route.ts` - Inference API with x402
- `src/components/X402InferencePanel.tsx` - Client-side payment UI

---

## 📁 Project Structure

```
WasiAIHackathonx402/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Internationalized pages
│   │   │   ├── models/         # Model browser
│   │   │   ├── publish/        # Publishing wizard
│   │   │   └── dashboard/      # Creator dashboard
│   │   └── api/                # API routes
│   │       ├── inference/      # x402 inference endpoint
│   │       ├── models/         # Model CRUD
│   │       └── indexed/        # Blockchain indexer
│   ├── components/             # React components
│   │   └── X402InferencePanel.tsx
│   ├── lib/                    # Core logic
│   │   ├── x402-constants.ts
│   │   ├── x402-facilitators.ts
│   │   └── db.ts
│   └── abis/                   # Contract ABIs
├── contracts/
│   └── evm/
│       ├── contracts/          # Solidity contracts
│       └── scripts/            # Deployment scripts
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
```

---

## 🧪 Testing x402 Flow

### Get Test Tokens

1. **AVAX (gas)**: [Avalanche Faucet](https://faucet.avax.network/)
2. **USDC (payments)**: 
   - Use Circle's testnet faucet, or
   - Mint MockUSDC from contract `0xCDa6E1C8340550aC412Ee9BC59ae4Db46745C53e`

### Test Inference

```bash
# Using curl
curl -X POST http://localhost:3000/api/inference/1 \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world"}'

# Expected: 402 Payment Required with payment details
```

---

## 🏆 Hackathon Highlights

1. **Real x402 Integration**: Not a mock - actual micropayments on Avalanche Fuji
2. **Gasless UX**: Ultravioleta facilitator covers all gas fees
3. **Full E2E Flow**: Publish → Pay → Inference → Feedback
4. **On-chain Reputation**: ERC-8004 implementation for verifiable AI quality
5. **Revenue Splitting**: Automatic royalty distribution to model creators

---

## 📺 Demo Video

[Watch the full demo on YouTube](https://youtu.be/dqAJCdFguxo)

---

## 👥 Team

- **Fernando Rosas** - Full Stack Developer
- Built with ❤️ for the x402 Hackathon

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Live Demo**: Coming soon
- **GitHub**: https://github.com/ferrosasfp/WasiAIHackathonx402
- **x402 Protocol**: https://x402.org
- **Avalanche**: https://avax.network
