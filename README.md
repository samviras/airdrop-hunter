# AirdropHunter

Scan crypto wallets and find unclaimed airdrops — no wallet connection needed.

## Stack

- **Backend:** Python FastAPI + SQLAlchemy (async) + PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Auth:** JWT + bcrypt

## Quick Start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your Supabase credentials and API keys

# Run migrations in Supabase SQL editor or psql:
# psql $DATABASE_URL < migrations/001_initial.sql

uvicorn app.main:app --reload
```

API available at `http://localhost:8000`
Docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL async URL (`postgresql+asyncpg://...`) |
| `JWT_SECRET` | Secret key for JWT signing |
| `ETHERSCAN_API_KEY` | Get free at etherscan.io/apis |
| `ARBISCAN_API_KEY` | Get free at arbiscan.io/apis |
| `OPTIMISM_API_KEY` | Get free at optimistic.etherscan.io |
| `BASESCAN_API_KEY` | Get free at basescan.org/apis |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anon key |

### Free API Keys

All blockchain scanner keys are free tier. One Etherscan account gives you keys for all four chains (Etherscan, Arbiscan, Optimism, Basescan).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/scan` | Scan wallet addresses |
| `GET` | `/api/v1/airdrops` | List all airdrops |
| `GET` | `/api/v1/airdrops/{id}` | Get airdrop details |
| `GET` | `/api/v1/wallets` | Get saved wallets (auth) |
| `POST` | `/api/v1/wallets` | Save a wallet (auth) |
| `DELETE` | `/api/v1/wallets/{id}` | Remove a wallet (auth) |
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login |

## Features

- **No login required** to scan — paste addresses and get results instantly
- Multi-chain: Ethereum, Arbitrum, Optimism, Base
- 15 tracked airdrops (past, claimable, and upcoming)
- 1-hour result caching to avoid API rate limits
- Save wallets to account for quick re-scanning

## Notes

- Eligibility is based on transaction count and dates — estimates only
- Verify on official claim pages before claiming
- Solana airdrops (Jito) shown in registry but not scannable with EVM wallets
- Free Etherscan API: 5 calls/second limit
