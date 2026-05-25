

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.chat import router as chat_router
from app.routes.appointments import router as appointments_router
from app.routes.upload import upload_router, admin_router

app = FastAPI(
    title="MediFlow AI Backend",
    description="Multi-Agent Clinic Operations & Patient Workflow Assistant API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(appointments_router)
app.include_router(upload_router)
app.include_router(admin_router)

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "MediFlow AI Backend",
        "version": "1.0.0",
        "mode": "demo" if not os.getenv("GEMINI_API_KEY") else "production",
        "agents": [
            "Query Classifier",
            "Risk Evaluator",
            "RAG Retrieval",
            "Appointment Router",
            "Response Writer",
            "Validator",
        ],
    }

@app.get("/")
async def root():
    return JSONResponse({
        "name": "MediFlow AI",
        "tagline": "Multi-Agent Clinic Operations Platform",
        "docs": "/docs",
        "health": "/health",
    })
