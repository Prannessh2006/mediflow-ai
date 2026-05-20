"""
Supabase Schema — MediFlow AI
Run this SQL in your Supabase dashboard → SQL Editor to set up all tables.
"""

SCHEMA_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Patients ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE,
  phone        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Appointments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name     TEXT NOT NULL,
  patient_email    TEXT,
  patient_phone    TEXT,
  doctor_name      TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status           TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','cancelled','completed')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- ─── Reports ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name      TEXT,
  patient_email     TEXT,
  file_name         TEXT,
  file_url          TEXT,
  extracted_summary TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Escalations ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS escalations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT,
  risk_level   TEXT CHECK (risk_level IN ('HIGH','MEDIUM','LOW')),
  issue        TEXT NOT NULL,
  query        TEXT,
  status       TEXT DEFAULT 'open'
               CHECK (status IN ('open','reviewed','resolved')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON escalations (status);
CREATE INDEX IF NOT EXISTS idx_escalations_risk ON escalations (risk_level);

-- ─── Chat Logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT,
  patient_name TEXT,
  query        TEXT,
  intent       TEXT,
  risk_level   TEXT,
  response     TEXT,
  agent_trace  JSONB,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_date ON chat_logs (created_at);

-- ─── Row Level Security (optional, for production) ────────────────────────────
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
"""

if __name__ == "__main__":
    print(SCHEMA_SQL)
    print("\n-- Copy this SQL and run it in your Supabase SQL Editor")
    print("-- Dashboard → SQL Editor → New Query → Paste → Run")
