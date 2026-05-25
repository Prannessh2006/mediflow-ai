

import os
import time
import random
from typing import List, Optional, Dict, Tuple
from datetime import datetime

def _format_appointment_response(appointment_data: Dict) -> str:
    if not appointment_data:
        return ""
    action = appointment_data.get("action", "")
    if action == "booked":
        date_str = appointment_data.get("date", "")
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            formatted_date = dt.strftime("%A, %B %d, %Y at %I:%M %p")
        except Exception:
            formatted_date = date_str
        return f"""
✅ **Appointment Confirmed!**

| Detail | Info |
|--------|------|
| **Doctor** | {appointment_data.get('doctor', 'TBD')} |
| **Date & Time** | {formatted_date} |
| **Status** | Pending Confirmation |
| **Reference ID** | `{appointment_data.get('appointment_id', 'N/A')}` |

**Please bring:**
- Valid photo ID
- Insurance card
- Previous medical records / test reports
- List of current medications

Arrive **15 minutes early** for registration. You will receive a confirmation SMS shortly.
"""
    elif action == "cancel_requested":
        return "\n📋 **Cancellation Request Received**\n\nPlease call **+91-9876543210** or visit the clinic to confirm your cancellation. Cancellations must be made 24 hours in advance."
    elif action == "reschedule_requested":
        return "\n📅 **Reschedule Request**\n\nPlease call **+91-9876543210** to reschedule your appointment. Our team will find the next available slot for you."
    return ""

_TEMPLATE_RESPONSES = {
    "clinic_policy": lambda ctx, q: f"""Here's the information you need about our clinic:

{chr(10).join(f'• {c}' for c in ctx[:3])}

Is there anything specific you'd like to know more about? I'm happy to help!""",

    "appointment_booking": lambda ctx, q: f"""I'd be happy to help you book an appointment at MediFlow Clinic!

{chr(10).join(f'• {c}' for c in ctx[:2])}

**Available Doctors:**
- Dr. Priya Mehta — General Physician
- Dr. Arun Kapoor — Cardiologist
- Dr. Sunita Rao — Dermatologist
- Dr. Vikram Singh — Orthopedic

Please provide your preferred doctor and date, and I'll get that scheduled for you!""",

    "prescription_question": lambda ctx, q: f"""Regarding your prescription query:

{chr(10).join(f'• {c}' for c in ctx[:3])}

For specific medication advice, please consult with your doctor directly.""",

    "follow_up_request": lambda ctx, q: f"""Here's information about your follow-up:

{chr(10).join(f'• {c}' for c in ctx[:3])}

If you need to schedule a follow-up appointment, I can help with that!""",

    "general_inquiry": lambda ctx, q: f"""Thank you for reaching out to MediFlow AI! Here's what I can help you with:

{chr(10).join(f'• {c}' for c in ctx[:3])}

Feel free to ask about appointments, clinic hours, test results, or any other queries!""",

    "emergency_symptom": lambda ctx, q: """**Please seek immediate medical attention.**

Call **112** (Emergency Services) or **108** (Ambulance) immediately.

MediFlow Emergency: **+91-9876543210** (24/7)

Do not wait — emergency symptoms require in-person medical evaluation.""",

    "report_upload": lambda ctx, q: """Your report has been received and is being processed by our AI system.

**What happens next:**
1. Our AI will analyze and summarize your report
2. You'll receive a summary within a few minutes
3. A copy will be shared with your doctor

Please note that AI summaries are for informational purposes only and should be reviewed by your healthcare provider.""",

    "appointment_cancellation": lambda ctx, q: """I understand you'd like to cancel your appointment.

To complete the cancellation:
- **Online**: Use the Appointments section above
- **Phone**: Call +91-9876543210
- **In-person**: Visit the clinic reception

Please note that cancellations must be made **24 hours in advance** to avoid a ₹200 no-show fee.""",

    "appointment_reschedule": lambda ctx, q: """I'd be happy to help you reschedule your appointment.

**Options to reschedule:**
- **Online**: Select a new date in the Appointments section
- **Phone**: Call +91-9876543210
- **Visit**: Stop by the reception desk

Would you like me to find available slots for a specific doctor or date?""",
}

def _template_response(query: str, intent: str, context: List[str], appointment_data: Optional[Dict]) -> str:
    appt_block = _format_appointment_response(appointment_data) if appointment_data else ""
    template_fn = _TEMPLATE_RESPONSES.get(intent, _TEMPLATE_RESPONSES["general_inquiry"])
    base = template_fn(context, query)
    return (appt_block + base).strip() if appt_block else base

def _gemini_response(
    query: str,
    intent: str,
    context: List[str],
    risk_level: str,
    appointment_data: Optional[Dict],
) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel("gemini-1.5-flash")

        appt_info = ""
        if appointment_data:
            appt_info = f"\nAppointment Action Taken: {appointment_data}\n"

        prompt = f"""You are MediFlow AI, a friendly and professional healthcare operations assistant for a clinic.

Patient Query: "{query}"
Intent: {intent}
Risk Level: {risk_level}
{appt_info}

Relevant Clinic Information:
{chr(10).join(f'- {c}' for c in context)}

Generate a helpful, empathetic, patient-friendly response in markdown format.
- Be warm and professional
- Use bullet points and formatting where helpful
- Do NOT give specific medical diagnoses
- Keep response concise but complete
- If appointment was booked, include confirmation details"""

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return _template_response(query, intent, context, appointment_data)

def run_response_agent(
    query: str,
    intent: str,
    context: List[str],
    risk_level: str,
    appointment_data: Optional[Dict],
) -> Tuple[str, int]:

    start = time.time()

    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key:
        response = _gemini_response(query, intent, context, risk_level, appointment_data)
    else:
        time.sleep(random.uniform(0.10, 0.25))
        response = _template_response(query, intent, context, appointment_data)

    duration = int((time.time() - start) * 1000)
    return response, duration
