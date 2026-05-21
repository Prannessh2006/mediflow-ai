"""FastAPI route: /chat — runs the full LangGraph pipeline."""

from fastapi import APIRouter, Depends
from app.database.models import ChatRequest, ChatResponse, AgentTraceStep
from app.graph.workflow import run_workflow
from app.auth import get_current_user, User

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, user: User = Depends(get_current_user)):
    result = run_workflow(
        query=request.query,
        patient_name=user.name,
        user_id=user.uid,
        session_id=request.session_id,
    )

    trace = [
        AgentTraceStep(
            agent=step["agent"],
            status=step["status"],
            output=step.get("output"),
            duration_ms=step.get("duration_ms"),
        )
        for step in result["agent_trace"]
    ]

    return ChatResponse(
        response=result["final_response"] or "I'm sorry, I couldn't process your request. Please try again.",
        intent=result["intent"] or "general_inquiry",
        risk_level=result["risk_level"] or "LOW",
        escalated=result.get("escalate", False),
        agent_trace=trace,
        session_id=result["session_id"],
        appointment_data=result.get("appointment_data"),
        rag_context_used=bool(result.get("rag_context")),
    )
