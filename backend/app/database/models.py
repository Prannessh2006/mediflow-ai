from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
import uuid


# ─── Chat ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    query: str
    patient_name: Optional[str] = "Anonymous"
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))

class AgentTraceStep(BaseModel):
    agent: str
    status: str  # "completed" | "processing" | "skipped" | "error"
    output: Optional[Any] = None
    duration_ms: Optional[int] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    risk_level: str
    escalated: bool
    agent_trace: List[AgentTraceStep]
    session_id: str
    appointment_data: Optional[dict] = None
    rag_context_used: bool = False


# ─── Appointments ────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    patient_name: str
    patient_email: Optional[str] = None
    patient_phone: Optional[str] = None
    doctor_name: str
    appointment_date: str   # ISO string
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    appointment_date: Optional[str] = None
    notes: Optional[str] = None

class Appointment(BaseModel):
    id: str
    patient_name: str
    patient_email: Optional[str] = None
    doctor_name: str
    appointment_date: str
    status: str
    notes: Optional[str] = None
    created_at: str


# ─── Reports ─────────────────────────────────────────────────────────────────

class ReportUpload(BaseModel):
    patient_name: str
    patient_email: Optional[str] = None
    file_name: str
    file_url: Optional[str] = None
    extracted_summary: Optional[str] = None

class Report(BaseModel):
    id: str
    patient_name: str
    file_name: str
    file_url: Optional[str]
    extracted_summary: Optional[str]
    created_at: str


# ─── Escalations ─────────────────────────────────────────────────────────────

class EscalationCreate(BaseModel):
    patient_name: str
    risk_level: str
    issue: str
    query: str

class Escalation(BaseModel):
    id: str
    patient_name: str
    risk_level: str
    issue: str
    query: str
    status: str
    created_at: str

class EscalationUpdate(BaseModel):
    status: str  # "open" | "reviewed" | "resolved"


# ─── Admin Stats ──────────────────────────────────────────────────────────────

class AdminStats(BaseModel):
    appointments_today: int
    high_risk_alerts: int
    pending_approvals: int
    total_chats_today: int
    resolved_escalations: int
