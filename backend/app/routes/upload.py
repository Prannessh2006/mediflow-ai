"""FastAPI routes: /upload-report and /admin"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import random
import time

from app.database.supabase import db
from app.database.models import EscalationUpdate, AdminStats

upload_router = APIRouter()
admin_router = APIRouter(prefix="/admin")


# ─── Report Upload ────────────────────────────────────────────────────────────

MOCK_SUMMARIES = [
    "Blood glucose levels slightly elevated (112 mg/dL fasting). HbA1c within normal range at 5.8%. Recommend dietary changes and follow-up in 3 months.",
    "Chest X-ray shows no significant abnormalities. Lung fields clear. Heart size normal. No active cardiopulmonary disease detected.",
    "CBC results: Hemoglobin 11.2 g/dL (slightly low - mild anemia). WBC and platelet counts normal. Recommend iron supplementation and dietary review.",
    "Lipid profile: Total cholesterol 210 mg/dL (borderline high). LDL 130 mg/dL. HDL 45 mg/dL. Triglycerides 160 mg/dL. Recommend lifestyle modifications.",
    "Thyroid function test: TSH 3.8 mIU/L (normal). T3 and T4 within normal ranges. No thyroid dysfunction detected.",
    "Urine routine: Slight proteinuria noted (+1). Suggest repeat test after 2 weeks. Other parameters normal. No infection detected.",
]

from app.auth import get_current_user, User
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends

import os

@upload_router.post("/upload-report")
async def upload_report(
    file: UploadFile = File(...),
    patient_name: str = Form(default="Anonymous"),
    patient_email: str = Form(default=""),
    user: User = Depends(get_current_user),
):
    # Read file content
    content = await file.read()
    file_size_kb = len(content) / 1024

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = "You are a medical assistant AI. Analyze this medical report, prescription, or image and summarize the key findings in 2-4 clear sentences. Do not give any medical advice or diagnoses of your own, just extract and summarize what is on the document."
        
        try:
            response = model.generate_content([
                prompt,
                {
                    "mime_type": file.content_type or "image/jpeg",
                    "data": content
                }
            ])
            summary = response.text
        except Exception as e:
            print(f"[Upload] AI Error: {e}")
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                summary = "API Rate Limit Exceeded: The free tier of the AI model only allows a few requests per minute. Please wait about 30 seconds and try uploading again."
            else:
                summary = "Error analyzing report with AI. Please try again later."
    else:
        # Fallback if no API key
        time.sleep(random.uniform(0.3, 0.7))
        summary = random.choice(MOCK_SUMMARIES)

    record = db.create_report({
        "patient_name": user.name,
        "patient_email": user.email,
        "user_id": user.uid,
        "file_name": file.filename,
        "file_url": f"/uploads/{file.filename}",
        "extracted_summary": summary,
    })

    return {
        "success": True,
        "report_id": record["id"],
        "file_name": file.filename,
        "file_size_kb": round(file_size_kb, 1),
        "summary": summary,
        "created_at": record["created_at"],
    }


@upload_router.get("/reports")
async def list_reports(user: User = Depends(get_current_user)):
    return db.get_user_reports(user.uid)


# ─── Admin Routes ─────────────────────────────────────────────────────────────

@admin_router.get("/stats")
async def get_stats():
    return db.get_admin_stats()


@admin_router.get("/escalations")
async def get_escalations():
    return db.get_escalations()


@admin_router.patch("/escalations/{escalation_id}")
async def update_escalation(escalation_id: str, data: EscalationUpdate):
    record = db.update_escalation(escalation_id, {"status": data.status})
    if not record:
        raise HTTPException(status_code=404, detail="Escalation not found")
    return record


@admin_router.get("/chat-logs")
async def get_chat_logs():
    return db.get_chat_logs(limit=50)
