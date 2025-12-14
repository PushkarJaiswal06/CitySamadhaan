# 🏛️ CitySamdhaan - Digital Governance Platform

A comprehensive digital governance platform enabling citizens to file complaints through SMS, IVR, mobile apps, and web portals. Features **blockchain-based complaint anchoring** for transparency and immutable audit trails.

## ✨ New: Blockchain Integration

🔗 **Every complaint is now anchored on Ethereum blockchain!**
- Immutable complaint records
- Tamper-proof audit trails
- Full transparency via Etherscan
- Data integrity verification

👉 **Quick Setup**: See [BLOCKCHAIN-QUICKSTART.md](BLOCKCHAIN-QUICKSTART.md)
📖 **Full Guide**: See [BLOCKCHAIN-GUIDE.md](BLOCKCHAIN-GUIDE.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm 9+
- Docker & Docker Compose
- MongoDB 7+ (or use Docker)
- Redis 7.2+ (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PushkarJaiswal06/CitySamadhaan.git
cd CitySamadhaan
```

2. **Start databases with Docker**
```bash
docker-compose up -d
```

3. **Set up Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials (MongoDB, Redis, MSG91, Cloudinary)
# Optional: Add blockchain config for complaint anchoring
npm run dev
```

4. **[Optional] Set up Blockchain**
```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with Infura/Alchemy RPC URL and private key
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# Copy contract addresses to backend/.env
```

5. **Set up Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure + Tailwind CSS
│   ├── src/
│   │   ├── components/  # Reusable components (incl. BlockchainVerification)
│   │   ├── pages/       # Dashboard pages for all roles
│   │   ├── services/    # API services
│   │   └── store/       # Zustand state management
│   └── ...
├── blockchain/          # Hardhat + Solidity Smart Contracts
│   ├── contracts/       # ComplaintRegistry.sol, AuditTrail.sol
│   ├── scripts/         # Deployment scripts
│   └── hardhat.config.js
├── docs/               # Complete documentation
├── BLOCKCHAIN-QUICKSTART.md  # 5-minute blockchain setup
├── BLOCKCHAIN-GUIDE.md       # Complete blockchain
CitySamdhaan/
├── backend/              # Node.js + Express API
│   ├── config/          # Database & Redis config
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation,, Zustand
- **Backend**: Node.js 20, Express.js, MongoDB
- **Blockchain**: Solidity 0.8.20, Hardhat, Ethers.js 6, OpenZeppelin
- **Network**: Ethereum Sepolia Testnet (soon: Polygon zkEVM)
- **Services**: MSG91 (SMS/IVR), Cloudinary (Storage)
- **Database**: MongoDB 7, Redis 7.2 (Upstash) Solidity
├── .docs/              # Complete documentation
└── docker-compose.yml   # MongoDB + Redis
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js 20, Express.js, MongoDB
- **Blockchain**: Solidity, Hardhat, Ethers.js (Sepolia)
- **Services**: MSG91 (SMS/IVR), Cloudinary (Storage)
- **Database**: MongoDB 7, Redis 7.2

## 📚 Documentation
:

**Quick Guides:**
- [BLOCKCHAIN-QUICKSTART.md](BLOCKCHAIN-QUICKSTART.md) - 5-minute blockchain setup
- [QUICKSTART.md](QUICKSTART.md) - Complete application setup
- [USER-GUIDE.md](USER-GUIDE.md) - User manual for all roles

**Technical Documentation:**
- [BLOCKCHAIN-GUIDE.md](BLOCKCHAIN-GUIDE.md) - Complete blockchain architecture
### ✅ Fully Implemented
- ✅ Multi-channel complaint filing (Web portal, Call Center)
- ✅ 5 role-based dashboards (Citizen, Admin, Dept Officer, Field Worker, Call Center)
- ✅ Complete complaint lifecycle management
- ✅ Assignment workflow with field worker tracking
- ✅ Image upload with Cloudinary integration
- ✅ Real-time status tracking and updates
- ✅ SMS notifications via MSG91
- ✅ User management with CRUD operations
- ✅ Department and category management
- ✅ Statistics and analytics dashboards

### 🆕 Blockchain Features
- ✅ **Immutable Complaint Registry** - Every complaint anchored on Ethereum
- ✅ **Audit Trail Smart Contract** - Complete system action logging
- ✅ **Data Integrity Verification** - Hash-based tamper detection
- ✅ **Blockchain Badge** - User-facing verification component
- ✅ **Etherscan Integration** - Direct links to view transactions
- ✅ **Smart Contract Deployment Scripts** - Ready for Sepolia/Mainnet

### 🚧 Coming Soon
- 📱 Mobile app (SMS, IVR integration)
- 🌍 Multi-language support (Hindi, Regional languages)
- 📊 Advanced analytics and reporting
- 🗺️ Land registry module
- 🔔 Push notifications
- 📧 Email notificationsROADMAP.md)

## 🔑 Key Features

- Multi-channel complaint filing (Web, SMS, IVR, Mobile)
- Role-based access control (9 user roles)
- 12 government departments integration
- Blockchain-based complaint anchoring
- Land registry with anti-fraud mechanisms
- Multi-language support (Hindi, English, Regional)

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 👥 Team

CitySamdhaan Development Team
