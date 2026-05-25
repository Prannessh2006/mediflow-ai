

import os
import re
import time
import random
from typing import Tuple

INTENT_LABELS = [
    "appointment_booking",
    "appointment_cancellation",
    "appointment_reschedule",
    "prescription_question",
    "clinic_policy",
    "follow_up_request",
    "report_upload",
    "emergency_symptom",
    "appointment_inquiry",
    "general_inquiry",
]

_PATTERNS = {
    "appointment_booking":      r"\b(book|schedule|reserve|want\s+an?\s+appointment|need\s+an?\s+appointment|fix\s+an?\s+appointment)\b",
    "appointment_cancellation": r"\b(cancel|cancellation|called\s+off|withdraw)\b",
    "appointment_reschedule":   r"\b(reschedule|change\s+(my\s+)?appointment|move\s+(my\s+)?appointment|postpone)\b",
    "prescription_question":    r"\b(prescription|medicine|medication|drug|dosage|tablet|pill|refill)\b",
    "clinic_policy":            r"\b(policy|policies|timings?|hours?|fees?|charges?|insurance|payment|documents?\s+needed|what\s+do\s+i\s+bring)\b",
    "follow_up_request":        r"\b(follow[-\s]?up|check[-\s]?up|results?|test\s+results?|report\s+ready|next\s+visit)\b",
    "report_upload":            r"\b(upload|send\s+(my\s+)?report|share\s+(my\s+)?report|attach)\b",
    "emergency_symptom":        r"\b(chest\s+pain|can'?t\s+breathe|difficulty\s+breath|unconscious|severe\s+bleed|emergency|stroke|heart\s+attack|allergic\s+reaction|seizure|faint)\b",
    "appointment_inquiry":      r"\b(my\s+appointments?|appointments?\s+so\s+far|when\s+is\s+my\s+appointment|list\s+appointments?|show\s+appointments?)\b",
}

def _keyword_classify(query: str) -> str:
    q = query.lower()

    if re.search(_PATTERNS["emergency_symptom"], q):
        return "emergency_symptom"
    for intent, pattern in _PATTERNS.items():
        if re.search(pattern, q):
            return intent
    return "general_inquiry"

def _gemini_classify(query: str) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""Classify this patient query into exactly one category.
Categories: {", ".join(INTENT_LABELS)}

Query: "{query}"

Reply with ONLY the category name, nothing else."""
        response = model.generate_content(prompt)
        result = response.text.strip().lower().replace(" ", "_")
        return result if result in INTENT_LABELS else "general_inquiry"
    except Exception:
        return _keyword_classify(query)

def run_classifier(query: str) -> Tuple[str, int]:

    start = time.time()
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        intent = _gemini_classify(query)
    else:

        time.sleep(random.uniform(0.05, 0.15))
        intent = _keyword_classify(query)
    duration = int((time.time() - start) * 1000)
    return intent, duration
