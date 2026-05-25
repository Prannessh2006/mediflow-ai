

import time
import random
from typing import Tuple, Dict

_UNSAFE_PATTERNS = [
    "you should take",
    "i recommend taking",
    "take this medication",
    "the diagnosis is",
    "you have",
    "you are suffering from",
    "this means you have",
    "you definitely have",
    "guaranteed to work",
    "100% effective",
]

_DISCLAIMER = (
    "\n\n> ⚕️ **Medical Disclaimer**: This information is for guidance only "
    "and does not substitute professional medical advice. Always consult a "
    "qualified healthcare provider for medical decisions."
)

_EMERGENCY_DISCLAIMER = (
    "\n\n🚨 **EMERGENCY ALERT**: If you are experiencing a medical emergency, "
    "please call **112** immediately or go to the nearest emergency room. "
    "Do not wait for an online response."
)

def _check_safety(response_draft: str, intent: str, risk_level: str) -> Dict:

    issues = []
    modified_response = response_draft
    add_disclaimer = False
    confidence = 0.95

    lower = response_draft.lower()
    for pattern in _UNSAFE_PATTERNS:
        if pattern in lower:
            issues.append(f"Potentially unsafe phrasing: '{pattern}'")
            confidence -= 0.10
            add_disclaimer = True

    if risk_level == "HIGH" or intent == "emergency_symptom":
        modified_response = _EMERGENCY_DISCLAIMER + "\n\n" + modified_response
        confidence = max(confidence, 0.90)

    if add_disclaimer or intent in {"prescription_question", "follow_up_request", "general_inquiry"}:
        modified_response += _DISCLAIMER

    confidence = max(round(confidence, 2), 0.70)

    return {
        "passed": confidence >= 0.75,
        "confidence": confidence,
        "issues": issues,
        "modified_response": modified_response,
        "disclaimer_added": add_disclaimer or risk_level == "HIGH",
    }

def run_validator_agent(
    response_draft: str,
    intent: str,
    risk_level: str,
    rag_context_used: bool,
) -> Tuple[Dict, int]:

    start = time.time()
    time.sleep(random.uniform(0.04, 0.10))
    result = _check_safety(response_draft, intent, risk_level)
    duration = int((time.time() - start) * 1000)
    return result, duration
