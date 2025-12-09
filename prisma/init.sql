-- ==============================================
-- WasiAI Database Initialization Script
-- Run after: npx prisma db push
-- ==============================================

-- Inference History Table (for x402 payment tracking)
CREATE TABLE IF NOT EXISTS inference_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id INTEGER NOT NULL,
    model_name VARCHAR(255),
    agent_id INTEGER,
    payer_wallet VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66),
    amount_usdc NUMERIC(20, 0) NOT NULL DEFAULT 0,
    chain_id INTEGER NOT NULL DEFAULT 43113,
    input_preview TEXT,
    output_preview TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inference_history
CREATE INDEX IF NOT EXISTS idx_inference_model ON inference_history(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inference_payer ON inference_history(payer_wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inference_agent ON inference_history(agent_id, created_at DESC);

-- Feedback/Reputation Table (for ERC-8004 tracking)
CREATE TABLE IF NOT EXISTS feedback_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id INTEGER NOT NULL,
    agent_id INTEGER,
    user_wallet VARCHAR(42) NOT NULL,
    rating VARCHAR(20) NOT NULL, -- 'positive', 'negative', 'neutral'
    tx_hash VARCHAR(66),
    chain_id INTEGER NOT NULL DEFAULT 43113,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_model ON feedback_history(model_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback_history(user_wallet, created_at DESC);

-- ==============================================
-- Verify tables created
-- ==============================================
-- Run: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
