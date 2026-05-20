# MediFlow AI 🏥
### Multi-Agent Clinic Operations & Patient Workflow Assistant

A production-style, multi-agent AI healthcare operations platform built with FastAPI, LangGraph, Next.js, and Gemini AI.

---

## 🚀 Quick Start (Demo Mode — No API Keys Needed)

### 1. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

---

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🤖 AI Agents (6-Agent LangGraph Pipeline)

| Agent | Role |
|-------|------|
| **Query Classifier** | Classifies patient intent (booking, emergency, policy, etc.) |
| **Risk Evaluator** | Detects high-risk emergency symptoms, triggers escalation |
| **RAG Retrieval** | Retrieves relevant clinic knowledge (Pinecone or local KB) |
| **Appointment Router** | Handles booking/rescheduling/cancellation via Supabase |
| **Response Writer** | Generates patient-friendly responses via Gemini |
| **Validator** | Ensures response safety, adds disclaimers, logs interaction |

---

## 🔑 Adding Real API Keys

Copy and fill in the environment files:

```bash
# Backend
cp backend/.env.example backend/.env

# Fill in:
# GEMINI_API_KEY=your_key
# PINECONE_API_KEY=your_key
# SUPABASE_URL=your_url
# SUPABASE_SERVICE_KEY=your_key
```

When keys are present:
- Gemini API is used for classification + response generation
- Pinecone is used for semantic document retrieval
- Supabase stores persistent data (appointments, escalations, chat logs)

---

## 📱 Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Overview | `/` | Home with quick actions and stats |
| AI Chat | `/chat` | Chat interface with live workflow trace |
| Appointments | `/appointments` | Book and manage appointments |
| Reports | `/reports` | Upload and get AI-analyzed report summaries |
| Admin | `/admin` | Dashboard with escalations and monitoring |

---

## 🗄️ Database Schema (Supabase)

```sql
-- Run this in your Supabase SQL editor:

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT, doctor_name TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT, file_name TEXT, file_url TEXT,
  extracted_summary TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT, risk_level TEXT, issue TEXT, query TEXT,
  status TEXT DEFAULT 'open', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT, patient_name TEXT, query TEXT,
  intent TEXT, risk_level TEXT, response TEXT,
  agent_trace JSONB, created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Run full 6-agent pipeline |
| GET | `/appointments` | List all appointments |
| POST | `/appointments/book` | Book new appointment |
| PATCH | `/appointments/{id}` | Update appointment status |
| POST | `/upload-report` | Upload + summarize report |
| GET | `/reports` | List all reports |
| GET | `/admin/stats` | Dashboard statistics |
| GET | `/admin/escalations` | Get escalated cases |
| PATCH | `/admin/escalations/{id}` | Update escalation status |
| GET | `/health` | Health check |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript |
| Styling | Tailwind CSS (custom dark theme) |
| Backend | FastAPI, Python |
| AI Orchestration | LangGraph |
| LLM | Google Gemini 1.5 Flash |
| Vector DB | Pinecone |
| Database | Supabase PostgreSQL |
| Animations | Framer Motion |

---

## 📁 Project Structure

```
mediflow-ai/
├── backend/
│   ├── app/
│   │   ├── agents/          # 6 AI agents
│   │   ├── graph/           # LangGraph workflow
│   │   ├── rag/             # RAG pipeline
│   │   ├── database/        # Supabase client + models
│   │   ├── routes/          # FastAPI routes
│   │   └── main.py
│   ├── documents/           # Clinic knowledge base
│   └── requirements.txt
└── frontend/
    ├── app/                 # Next.js pages
    ├── components/          # React components
    └── lib/                 # API client
```

---

## 🚀 Deployment

**Frontend** → Vercel: `vercel deploy`
**Backend** → Railway or Render: connect GitHub repo

---

Built with ❤️ as a production-style AI healthcare platform.
