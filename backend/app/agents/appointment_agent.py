"""
Appointment Routing Agent
Handles appointment booking, rescheduling, and cancellation.
"""

import os
import re
import time
import random
from typing import Tuple, Optional, Dict
from datetime import datetime, timezone

from app.database.supabase import db

DOCTORS = [
    "Dr. Priya Mehta (General Physician)",
    "Dr. Arun Kapoor (Cardiologist)",
    "Dr. Sunita Rao (Dermatologist)",
    "Dr. Vikram Singh (Orthopedic)",
    "Dr. Anjali Sharma (Gynecologist)",
    "Dr. Ravi Kumar (Pediatrician)",
]


def _extract_appointment_info(query: str, intent: str, patient_name: str) -> Dict:
    """Extracts appointment details from a natural language query."""
    q = query.lower()

    # Determine action
    action = "book"
    if intent == "appointment_cancellation" or "cancel" in q:
        action = "cancel"
    elif intent == "appointment_reschedule" or any(w in q for w in ["reschedule", "change", "move", "postpone"]):
        action = "reschedule"

    # Try to extract doctor preference
    doctor = None
    for d in DOCTORS:
        name = d.split("(")[0].strip().lower()
        if name.replace("dr. ", "") in q:
            doctor = d
            break

    # Detect specialty preference
    if not doctor:
        if any(w in q for w in ["heart", "cardiac", "cardio"]):
            doctor = "Dr. Arun Kapoor (Cardiologist)"
        elif any(w in q for w in ["skin", "derma", "acne", "rash"]):
            doctor = "Dr. Sunita Rao (Dermatologist)"
        elif any(w in q for w in ["bone", "joint", "ortho", "fracture"]):
            doctor = "Dr. Vikram Singh (Orthopedic)"
        elif any(w in q for w in ["child", "baby", "pediatric", "kid"]):
            doctor = "Dr. Ravi Kumar (Pediatrician)"
        elif any(w in q for w in ["gynec", "women", "pregnancy", "period"]):
            doctor = "Dr. Anjali Sharma (Gynecologist)"
        else:
            doctor = "Dr. Priya Mehta (General Physician)"

    # Extract date
    date_str = None
    from datetime import timedelta
    today = datetime.now(timezone.utc)
    if "tomorrow" in q:
        date_str = (today + timedelta(days=1)).strftime("%Y-%m-%dT10:30:00Z")
    elif "today" in q:
        date_str = today.strftime("%Y-%m-%dT14:00:00Z")
    elif "monday" in q:
        date_str = (today + timedelta(days=(0 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "tuesday" in q:
        date_str = (today + timedelta(days=(1 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "wednesday" in q:
        date_str = (today + timedelta(days=(2 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "thursday" in q:
        date_str = (today + timedelta(days=(3 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    elif "friday" in q:
        date_str = (today + timedelta(days=(4 - today.weekday()) % 7 or 7)).strftime("%Y-%m-%dT10:00:00Z")
    else:
        # Default to next available slot
        date_str = (today + timedelta(days=2)).strftime("%Y-%m-%dT10:30:00Z")

    return {
        "action": action,
        "doctor": doctor,
        "date_str": date_str,
        "patient_name": patient_name,
    }


def run_appointment_agent(
    query: str,
    intent: str,
    patient_name: str,
) -> Tuple[Optional[Dict], int]:
    """
    Returns (appointment_data, duration_ms)
    appointment_data = None if intent not appointment-related
    """
    start = time.time()

    appointment_intents = {
        "appointment_booking",
        "appointment_cancellation",
        "appointment_reschedule",
    }

    if intent not in appointment_intents:
        time.sleep(random.uniform(0.02, 0.05))
        return None, int((time.time() - start) * 1000)

    info = _extract_appointment_info(query, intent, patient_name)

    if info["action"] == "book":
        record = db.create_appointment({
            "patient_name": patient_name,
            "doctor_name": info["doctor"],
            "appointment_date": info["date_str"],
            "notes": f"Booked via MediFlow AI: {query[:100]}",
        })
        result = {
            "action": "booked",
            "appointment_id": record["id"],
            "doctor": info["doctor"],
            "date": info["date_str"],
            "status": "pending",
        }
    elif info["action"] == "cancel":
        result = {
            "action": "cancel_requested",
            "message": "Please call +91-9876543210 or visit the clinic to confirm cancellation.",
        }
    else:
        result = {
            "action": "reschedule_requested",
            "message": "Please call +91-9876543210 to reschedule your appointment.",
        }

    duration = int((time.time() - start) * 1000)
    return result, duration
