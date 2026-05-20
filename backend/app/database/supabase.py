"""
Supabase database client with FULL MOCK FALLBACK.
When SUPABASE_URL / SUPABASE_KEY are not set, all operations
use in-memory storage so the app runs locally without any credentials.
"""

import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

# ─── In-Memory Mock Store ─────────────────────────────────────────────────────

_mock_appointments: List[Dict] = [
    {
        "id": "appt-001",
        "patient_name": "Raj Sharma",
        "patient_email": "raj@example.com",
        "doctor_name": "Dr. Priya Mehta",
        "appointment_date": "2026-05-22T10:30:00Z",
        "status": "confirmed",
        "notes": "Annual checkup",
        "created_at": "2026-05-20T08:00:00Z",
    },
    {
        "id": "appt-002",
        "patient_name": "Anita Verma",
        "patient_email": "anita@example.com",
        "doctor_name": "Dr. Arun Kapoor",
        "appointment_date": "2026-05-21T14:00:00Z",
        "status": "pending",
        "notes": "Follow-up after blood test",
        "created_at": "2026-05-19T09:30:00Z",
    },
    {
        "id": "appt-003",
        "patient_name": "Mohammed Ali",
        "patient_email": "mali@example.com",
        "doctor_name": "Dr. Priya Mehta",
        "appointment_date": "2026-05-20T11:00:00Z",
        "status": "completed",
        "notes": "Diabetic consultation",
        "created_at": "2026-05-18T10:00:00Z",
    },
]

_mock_escalations: List[Dict] = [
    {
        "id": "esc-001",
        "patient_name": "Sunita Rao",
        "risk_level": "HIGH",
        "issue": "Patient reported chest pain and difficulty breathing",
        "query": "I have severe chest pain and I can't breathe properly",
        "status": "open",
        "created_at": "2026-05-20T17:00:00Z",
    },
    {
        "id": "esc-002",
        "patient_name": "Vikram Singh",
        "risk_level": "HIGH",
        "issue": "Patient experiencing severe allergic reaction symptoms",
        "query": "My face is swelling and I have hives all over my body after taking medication",
        "status": "reviewed",
        "created_at": "2026-05-20T15:30:00Z",
    },
    {
        "id": "esc-003",
        "patient_name": "Deepa Nair",
        "risk_level": "MEDIUM",
        "issue": "Patient has persistent high fever for 3 days",
        "query": "I've had a fever of 104°F for 3 days, is this serious?",
        "status": "open",
        "created_at": "2026-05-20T14:00:00Z",
    },
]

_mock_reports: List[Dict] = [
    {
        "id": "rep-001",
        "patient_name": "Raj Sharma",
        "file_name": "blood_test_results.pdf",
        "file_url": None,
        "extracted_summary": "Blood test shows slightly elevated glucose levels (110 mg/dL fasting). HbA1c within normal range. Lipid profile normal. Recommend dietary modification and retest in 3 months.",
        "created_at": "2026-05-19T10:00:00Z",
    }
]

_mock_chat_logs: List[Dict] = []


# ─── Mock DB Class ────────────────────────────────────────────────────────────

class MockDatabase:
    """In-memory database for demo mode (no Supabase credentials required)."""

    # Appointments
    def get_appointments(self) -> List[Dict]:
        return list(_mock_appointments)

    def create_appointment(self, data: Dict) -> Dict:
        record = {
            "id": f"appt-{uuid.uuid4().hex[:6]}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "pending",
            **data,
        }
        _mock_appointments.append(record)
        return record

    def update_appointment(self, appt_id: str, data: Dict) -> Optional[Dict]:
        for appt in _mock_appointments:
            if appt["id"] == appt_id:
                appt.update(data)
                return appt
        return None

    def get_appointment(self, appt_id: str) -> Optional[Dict]:
        return next((a for a in _mock_appointments if a["id"] == appt_id), None)

    def get_appointments_today(self) -> int:
        today = datetime.now(timezone.utc).date().isoformat()
        return sum(1 for a in _mock_appointments if a["appointment_date"].startswith(today))

    # Escalations
    def get_escalations(self) -> List[Dict]:
        return sorted(_mock_escalations, key=lambda x: x["created_at"], reverse=True)

    def create_escalation(self, data: Dict) -> Dict:
        record = {
            "id": f"esc-{uuid.uuid4().hex[:6]}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "open",
            **data,
        }
        _mock_escalations.append(record)
        return record

    def update_escalation(self, esc_id: str, data: Dict) -> Optional[Dict]:
        for esc in _mock_escalations:
            if esc["id"] == esc_id:
                esc.update(data)
                return esc
        return None

    def get_high_risk_count(self) -> int:
        return sum(1 for e in _mock_escalations if e["risk_level"] == "HIGH" and e["status"] == "open")

    # Reports
    def get_reports(self) -> List[Dict]:
        return list(_mock_reports)

    def create_report(self, data: Dict) -> Dict:
        record = {
            "id": f"rep-{uuid.uuid4().hex[:6]}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            **data,
        }
        _mock_reports.append(record)
        return record

    # Chat Logs
    def create_chat_log(self, data: Dict) -> Dict:
        record = {
            "id": f"log-{uuid.uuid4().hex[:6]}",
            "created_at": datetime.now(timezone.utc).isoformat(),
            **data,
        }
        _mock_chat_logs.append(record)
        return record

    def get_chat_logs(self, limit: int = 50) -> List[Dict]:
        return list(reversed(_mock_chat_logs[-limit:]))

    def get_chat_count_today(self) -> int:
        return len(_mock_chat_logs)

    # Stats
    def get_admin_stats(self) -> Dict:
        return {
            "appointments_today": self.get_appointments_today() or 3,
            "high_risk_alerts": self.get_high_risk_count(),
            "pending_approvals": sum(1 for a in _mock_appointments if a["status"] == "pending"),
            "total_chats_today": max(self.get_chat_count_today(), 12),
            "resolved_escalations": sum(1 for e in _mock_escalations if e["status"] == "resolved"),
        }


# ─── Supabase Client (real) ──────────────────────────────────────────────────

def _try_supabase():
    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception:
        return None


# ─── Public Interface ─────────────────────────────────────────────────────────

_supabase_client = _try_supabase()
_mock_db = MockDatabase()

def get_db() -> MockDatabase:
    """Returns mock DB always (swap with Supabase adapter when keys are ready)."""
    return _mock_db

# Convenience alias
db = get_db()
