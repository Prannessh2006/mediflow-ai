"""FastAPI routes: /appointments"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.database.models import AppointmentCreate, AppointmentUpdate, Appointment
from app.database.supabase import db

router = APIRouter(prefix="/appointments")


@router.get("", response_model=List[dict])
async def list_appointments():
    return db.get_appointments()


@router.post("/book", response_model=dict)
async def book_appointment(data: AppointmentCreate):
    record = db.create_appointment(data.model_dump())
    return record


@router.patch("/{appointment_id}", response_model=dict)
async def update_appointment(appointment_id: str, data: AppointmentUpdate):
    record = db.update_appointment(appointment_id, {k: v for k, v in data.model_dump().items() if v is not None})
    if not record:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return record


@router.get("/{appointment_id}", response_model=dict)
async def get_appointment(appointment_id: str):
    record = db.get_appointment(appointment_id)
    if not record:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return record
