"""
Risk Escalation Agent
Detects high-risk emergency symptoms and flags cases for escalation.
"""

import os
import re
import time
import random
from typing import Tuple, Dict

# High-risk emergency patterns
_HIGH_RISK_PATTERNS = [
    r"\bchest\s*pain\b",
    r"\bcan'?t\s+breathe\b",
    r"\bdifficulty\s+breath(ing)?\b",
    r"\bshortness\s+of\s+breath\b",
    r"\bsevere\s+bleed(ing)?\b",
    r"\bunconscious(ness)?\b",
    r"\bsevere\s+allergic\b",
    r"\banaphylax\b",
    r"\bheart\s+attack\b",
    r"\bstroke\b",
    r"\bseizure\b",
    r"\bfaint(ing|ed)?\b",
    r"\bnot\s+breathing\b",
    r"\bcode\s+blue\b",
    r"\bpassing\s+out\b",
    r"\bsudden\s+numbness\b",
    r"\bsevere\s+head(ache)?\b",
    r"\bcollapsed?\b",
]

# Medium-risk patterns
_MEDIUM_RISK_PATTERNS = [
    r"\bhigh\s+fever\b",
    r"\bfever\s+(of\s+)?(103|104|105|106)\b",
    r"\bvomiting\b",
    r"\bdizziness\b",
    r"\bblurred?\s+vision\b",
    r"\bsevere\s+pain\b",
    r"\bbleeding\b",
    r"\bswelling\b",
    r"\binfection\b",
    r"\bwound\b",
]


def _keyword_risk(query: str) -> Dict:
    q = query.lower()
    for pattern in _HIGH_RISK_PATTERNS:
        if re.search(pattern, q):
            return {
                "risk_level": "HIGH",
                "escalate": True,
                "reason": f"Emergency symptom detected: '{re.search(pattern, q).group()}'",
            }
    for pattern in _MEDIUM_RISK_PATTERNS:
        if re.search(pattern, q):
            return {
                "risk_level": "MEDIUM",
                "escalate": False,
                "reason": f"Concerning symptom detected: '{re.search(pattern, q).group()}'",
            }
    return {"risk_level": "LOW", "escalate": False, "reason": "No significant risk detected"}


def _gemini_risk(query: str) -> Dict:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""You are a medical triage assistant. Analyze this patient query for risk level.

Query: "{query}"

Respond in this exact format:
RISK_LEVEL: [HIGH|MEDIUM|LOW]
ESCALATE: [true|false]
REASON: [brief reason]

HIGH = emergency (chest pain, can't breathe, unconscious, severe bleeding, stroke, heart attack, anaphylaxis)
MEDIUM = concerning but not immediate emergency
LOW = routine query"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        risk_level = "LOW"
        escalate = False
        reason = "No risk detected"
        for line in text.split("\n"):
            if line.startswith("RISK_LEVEL:"):
                risk_level = line.split(":")[1].strip()
            elif line.startswith("ESCALATE:"):
                escalate = "true" in line.lower()
            elif line.startswith("REASON:"):
                reason = line.split(":", 1)[1].strip()
        return {"risk_level": risk_level, "escalate": escalate, "reason": reason}
    except Exception:
        return _keyword_risk(query)


def run_risk_agent(query: str, intent: str) -> Tuple[Dict, int]:
    """
    Returns (risk_result_dict, duration_ms)
    risk_result_dict = { risk_level, escalate, reason }
    """
    start = time.time()
    # If already classified as emergency, fast-track
    if intent == "emergency_symptom":
        time.sleep(random.uniform(0.05, 0.10))
        result = {
            "risk_level": "HIGH",
            "escalate": True,
            "reason": "Query classified as emergency symptom",
        }
        return result, int((time.time() - start) * 1000)

    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        result = _gemini_risk(query)
    else:
        time.sleep(random.uniform(0.05, 0.12))
        result = _keyword_risk(query)

    duration = int((time.time() - start) * 1000)
    return result, duration
