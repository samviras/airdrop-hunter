-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS airdrops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    token_symbol TEXT,
    chain TEXT NOT NULL,
    description TEXT,
    eligibility_criteria JSONB NOT NULL DEFAULT '{}',
    claim_url TEXT,
    claim_deadline TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'claimable', 'expired')),
    estimated_value_usd NUMERIC(20, 2),
    total_allocation TEXT,
    announcement_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    chain TEXT NOT NULL DEFAULT 'ethereum',
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(address, chain)
);

CREATE TABLE IF NOT EXISTS wallet_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    chain TEXT NOT NULL,
    transaction_count INTEGER,
    first_tx_date TIMESTAMPTZ,
    last_tx_date TIMESTAMPTZ,
    protocols_used JSONB DEFAULT '[]',
    volume_usd NUMERIC(20, 2),
    scan_data JSONB DEFAULT '{}',
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT NOT NULL,
    airdrop_id UUID NOT NULL REFERENCES airdrops(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('eligible', 'not_eligible', 'claimed', 'unknown')),
    estimated_amount NUMERIC(20, 8),
    estimated_value_usd NUMERIC(20, 2),
    details JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(wallet_address, airdrop_id)
);

-- Seed airdrops data
INSERT INTO airdrops (name, token_symbol, chain, description, eligibility_criteria, claim_url, claim_deadline, status, estimated_value_usd, total_allocation, announcement_url) VALUES
('LayerZero', 'ZRO', 'ethereum', 'LayerZero is an omnichain interoperability protocol. ZRO airdrop for early users who bridged through LayerZero.', '{"min_transactions": 1, "protocols": ["layerzero", "stargate"], "before_date": "2024-05-01"}', 'https://www.layerzero.foundation/zro', '2024-08-20', 'expired', 856.00, '100,000,000 ZRO', 'https://layerzero.network/blog/zro-token-launch'),
('Starknet', 'STRK', 'ethereum', 'Starknet is a permissionless decentralized ZK-Rollup. STRK tokens distributed to early users.', '{"min_transactions": 1, "before_date": "2023-11-15"}', 'https://provisions.starknet.io/', '2024-06-20', 'expired', 1200.00, '1,800,000,000 STRK', 'https://starknet.io/blog/starknet-provisions-program/'),
('Arbitrum', 'ARB', 'arbitrum', 'Arbitrum is a leading L2 scaling solution. ARB airdrop for early users.', '{"min_transactions": 3, "before_date": "2023-02-06", "chains": ["arbitrum"]}', 'https://arbitrum.foundation/airdrop', '2023-09-23', 'expired', 1200.00, '1,162,000,000 ARB', 'https://arbitrum.foundation/blog/arb-airdrop-announcement'),
('Optimism Round 1', 'OP', 'optimism', 'OP token airdrop round 1 for early Optimism users, DAO voters, and Gitcoin donors.', '{"min_transactions": 1, "before_date": "2022-01-10", "chains": ["optimism"]}', 'https://app.optimism.io/airdrops', '2022-12-31', 'expired', 800.00, '214,000,000 OP', 'https://optimism.mirror.xyz/qvd0WfuLKnePm1Gxb9dpGchPf5uDz5NSMEFdgirDS4'),
('Optimism Round 2', 'OP', 'optimism', 'OP token airdrop round 2 targeting positive-sum governance participants.', '{"min_transactions": 1, "before_date": "2023-01-01", "chains": ["optimism"]}', 'https://app.optimism.io/airdrops', '2023-06-27', 'expired', 500.00, '11,742,277 OP', 'https://optimism.mirror.xyz/Vkn-KFMw0q4p2Yx7eZ8O5j5_u5V9Y0N5A6oGsA'),
('Uniswap', 'UNI', 'ethereum', 'Uniswap governance token airdrop for anyone who used the protocol before Sep 1 2020.', '{"min_transactions": 1, "before_date": "2020-09-01"}', 'https://app.uniswap.org/', '2021-01-17', 'expired', 3200.00, '150,000,000 UNI', 'https://uniswap.org/blog/uni'),
('dYdX', 'DYDX', 'ethereum', 'dYdX protocol token for traders on the platform.', '{"min_volume_usd": 1, "before_date": "2021-07-26"}', 'https://dydx.exchange/', '2022-02-14', 'expired', 2400.00, '75,000,000 DYDX', 'https://dydx.foundation/blog/en-dydx-token'),
('ENS', 'ENS', 'ethereum', 'Ethereum Name Service governance token for .eth domain holders.', '{"ens_domain": true, "before_date": "2021-10-31"}', 'https://claim.ens.domains/', '2022-05-04', 'expired', 6000.00, '25,000,000 ENS', 'https://ens.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU'),
('Blur', 'BLUR', 'ethereum', 'Blur NFT marketplace token for NFT traders.', '{"nft_trades": 1, "before_date": "2023-01-01"}', 'https://blur.io/', '2023-06-01', 'expired', 450.00, '300,000,000 BLUR', 'https://blur.io/blog/blur-token-launch'),
('EigenLayer', 'EIGEN', 'ethereum', 'EigenLayer restaking protocol token for early restakers and stakers.', '{"min_transactions": 1, "protocols": ["eigenlayer"], "before_date": "2024-03-15"}', 'https://claims.eigenfoundation.org/', '2025-09-30', 'claimable', 800.00, '167,000,000 EIGEN', 'https://eigenfoundation.org/blog/eigen-token-launch'),
('Scroll', 'SCR', 'ethereum', 'Scroll zkEVM L2 token for early users who bridged and transacted on Scroll.', '{"min_transactions": 3, "chains": ["scroll"], "before_date": "2024-10-01"}', 'https://scroll.io/', NULL, 'claimable', 400.00, 'TBD', 'https://scroll.io/blog/scr-token'),
('zkSync', 'ZK', 'ethereum', 'zkSync Era L2 token for early users of the zkSync ecosystem.', '{"min_transactions": 5, "chains": ["zksync"], "before_date": "2024-03-24"}', 'https://claim.zknation.io/', '2025-01-03', 'expired', 600.00, '17,500,000,000 ZK', 'https://zksync.io/blog/zk-token-generation-event'),
('Linea', 'LINEA', 'ethereum', 'Linea zkEVM L2 token for early users of the Linea network.', '{"min_transactions": 1, "chains": ["linea"], "before_date": "2024-06-01"}', 'https://linea.build/', NULL, 'upcoming', 300.00, 'TBD', 'https://linea.build/blog/linea-surge'),
('Base', 'BASE', 'base', 'Base L2 network token - speculative, not yet confirmed by Coinbase.', '{"min_transactions": 3, "chains": ["base"], "before_date": "2024-12-01"}', 'https://base.org/', NULL, 'upcoming', 200.00, 'TBD', 'https://base.org'),
('Jito', 'JTO', 'solana', 'Jito liquid staking protocol on Solana. Note: Solana ecosystem, EVM wallets not applicable.', '{"chains": ["solana"], "min_transactions": 1, "before_date": "2023-12-07"}', 'https://jito.network/', '2024-03-07', 'expired', 1500.00, '100,000,000 JTO', 'https://jito.network/blog/jto-token-launch')
ON CONFLICT DO NOTHING;
