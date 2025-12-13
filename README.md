# 🏛️ CitySamdhaan - Digital Governance Platform

A comprehensive digital governance platform enabling citizens to file complaints through SMS, IVR, mobile apps, and web portals. Features blockchain-based land registry and multi-channel complaint management.

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
# Edit .env with your credentials
npm run dev
```

4. **Set up Frontend** (Coming soon)
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
CitySamdhaan/
├── backend/              # Node.js + Express API
│   ├── config/          # Database & Redis config
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, etc.
│   ├── services/        # MSG91, Cloudinary, Blockchain
│   └── server.js        # Entry point
├── frontend/            # React + Vite
├── blockchain/          # Hardhat + Solidity
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

Comprehensive documentation available in [.docs/](.docs/) folder:
- [01-PROJECT-OVERVIEW.md](.docs/01-PROJECT-OVERVIEW.md)
- [02-TECHNICAL-ARCHITECTURE.md](.docs/02-TECHNICAL-ARCHITECTURE.md)
- [03-BLOCKCHAIN-INTEGRATION.md](.docs/03-BLOCKCHAIN-INTEGRATION.md)
- [04-LAND-REGISTRY-MODULE.md](.docs/04-LAND-REGISTRY-MODULE.md)
- [05-DEVELOPMENT-ROADMAP.md](.docs/05-DEVELOPMENT-ROADMAP.md)

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
