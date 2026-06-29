-- RoadRushIQ Database Schema
-- psql -U postgres -d roadrushiq -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id     TEXT,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  username      VARCHAR(30) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Backward-compatible migration for older dev databases.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(30);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'google_id'
  ) THEN
    ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
  END IF;
END
$$;

-- ── Player Stats ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_stats (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coins              INTEGER DEFAULT 0,
  blue_diamonds      INTEGER DEFAULT 0,
  red_diamonds       INTEGER DEFAULT 0,
  best_score         INTEGER DEFAULT 0,
  total_runs         INTEGER DEFAULT 0,
  total_coins_ever   INTEGER DEFAULT 0,
  selected_bike      VARCHAR(50) DEFAULT 'skooter',
  day_streak         INTEGER DEFAULT 1,
  last_claim_date    DATE,
  claimed_days       JSONB DEFAULT '[]',
  updated_at         TIMESTAMP DEFAULT NOW()
);

-- ── Run History ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS run_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL DEFAULT 0,
  coins         INTEGER NOT NULL DEFAULT 0,
  blue_diamonds INTEGER NOT NULL DEFAULT 0,
  red_diamonds  INTEGER NOT NULL DEFAULT 0,
  mode          VARCHAR(20) DEFAULT 'two-way',
  bike_used     VARCHAR(50) DEFAULT 'skooter',
  played_at     TIMESTAMP DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_run_history_user_id  ON run_history(user_id);
CREATE INDEX IF NOT EXISTS idx_run_history_score    ON run_history(score DESC);

-- ── updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER player_stats_updated_at
  BEFORE UPDATE ON player_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();