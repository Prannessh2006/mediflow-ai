"""
RAG Retrieval Agent
Retrieves relevant context from the clinic's knowledge base.
Uses Pinecone + Gemini embeddings when keys are available.
Falls back to a curated in-memory knowledge base for demo mode.
"""

import os
import time
import random
from typing import Tuple, List, Dict

# ─── In-Memory Knowledge Base (Demo Mode) ────────────────────────────────────

CLINIC_KB = {
    "clinic_policy": [
        "MediFlow Clinic is open Monday to Saturday, 8:00 AM to 8:00 PM. Sundays are closed except for emergencies.",
        "For appointments, patients should arrive 15 minutes early with their ID proof and insurance card.",
        "Cancellations must be made at least 24 hours in advance to avoid a no-show fee of ₹200.",
        "MediFlow Clinic accepts all major insurance providers including Star Health, HDFC Ergo, and National Insurance.",
        "Consultation fees: General Physician ₹500, Specialist ₹1000, Emergency ₹1500.",
        "Patients should bring all previous medical records, prescriptions, and test reports for consultation.",
    ],
    "appointment_booking": [
        "Appointments can be booked online through MediFlow AI, by calling +91-9876543210, or by visiting the clinic.",
        "Available doctors: Dr. Priya Mehta (General Physician), Dr. Arun Kapoor (Cardiologist), Dr. Sunita Rao (Dermatologist), Dr. Vikram Singh (Orthopedic).",
        "Morning slots available: 9:00 AM, 9:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM.",
        "Evening slots available: 4:00 PM, 4:30 PM, 5:00 PM, 5:30 PM, 6:00 PM, 6:30 PM.",
        "For urgent same-day appointments, call the clinic helpline at +91-9876543210.",
    ],
    "prescription_question": [
        "Prescription refills require a valid consultation within the last 30 days.",
        "Controlled medications require an in-person visit and cannot be refilled over the phone.",
        "Always take medications as prescribed. Do not alter dosage without consulting your doctor.",
        "If you experience side effects from any medication, contact the clinic immediately.",
        "Prescription pickup is available Monday to Saturday from 9 AM to 7 PM at our pharmacy counter.",
    ],
    "follow_up_request": [
        "Test results are typically available within 24-48 hours for routine tests and 3-5 days for specialized tests.",
        "Follow-up appointments should be scheduled within 2 weeks of completing treatment unless specified otherwise.",
        "You will receive an SMS/email notification when your test results are ready.",
        "For post-operative follow-ups, please contact your surgeon's office directly.",
        "Blood test results can be viewed through the patient portal or by calling the clinic.",
    ],
    "general_inquiry": [
        "MediFlow Clinic is located at 12, Healthcare Avenue, Koramangala, Bangalore - 560034.",
        "Emergency services are available 24/7. Call +91-9876543210 for emergencies.",
        "We offer home visit services for elderly and differently-abled patients. Call to schedule.",
        "The clinic has a fully equipped laboratory, pharmacy, and radiology department on-site.",
        "Parking is available in the basement for up to 2 hours free of charge.",
    ],
    "emergency_symptom": [
        "⚠️ EMERGENCY: If you are experiencing a medical emergency, call 112 immediately.",
        "For chest pain, difficulty breathing, or loss of consciousness, go to the nearest emergency room or call 108.",
        "Do not drive yourself to the hospital if you are experiencing severe symptoms.",
        "MediFlow Emergency line: +91-9876543210 (24/7)",
    ],
}


def _mock_rag_retrieve(query: str, intent: str) -> List[str]:
    """Returns relevant knowledge base entries based on intent."""
    time.sleep(random.uniform(0.08, 0.20))
    kb_entries = CLINIC_KB.get(intent, CLINIC_KB["general_inquiry"])
    # Return top 3 most relevant (in real RAG, these would be ranked by cosine similarity)
    return kb_entries[:3]


def _pinecone_retrieve(query: str, intent: str) -> List[str]:
    """Real Pinecone + Gemini embeddings retrieval."""
    try:
        import google.generativeai as genai
        from pinecone import Pinecone

        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
        index = pc.Index(os.environ.get("PINECONE_INDEX", "mediflow"))

        # Generate embedding for query
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query",
        )
        query_embedding = result["embedding"]

        # Query Pinecone
        response = index.query(
            vector=query_embedding,
            top_k=5,
            include_metadata=True,
        )
        return [match["metadata"]["text"] for match in response["matches"]]
    except Exception:
        return _mock_rag_retrieve(query, intent)


def run_rag_agent(query: str, intent: str) -> Tuple[List[str], bool, int]:
    """
    Returns (context_chunks, used_real_rag, duration_ms)
    """
    start = time.time()
    has_pinecone = bool(os.getenv("PINECONE_API_KEY", ""))
    has_gemini = bool(os.getenv("GEMINI_API_KEY", ""))

    if has_pinecone and has_gemini:
        chunks = _pinecone_retrieve(query, intent)
        used_real = True
    else:
        chunks = _mock_rag_retrieve(query, intent)
        used_real = False

    duration = int((time.time() - start) * 1000)
    return chunks, used_real, duration
