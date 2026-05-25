

from typing import TypedDict, Optional, List, Any, Dict
from langgraph.graph import StateGraph, END

from app.agents.classifier import run_classifier
from app.agents.risk_agent import run_risk_agent
from app.agents.rag_agent import run_rag_agent
from app.agents.appointment_agent import run_appointment_agent
from app.agents.validator_agent import run_validator_agent
from app.agents.response_agent import run_response_agent
from app.database.supabase import db

class WorkflowState(TypedDict):

    query: str
    patient_name: str
    user_id: str
    session_id: str

    intent: Optional[str]
    risk_level: Optional[str]
    escalate: Optional[bool]
    risk_reason: Optional[str]
    rag_context: Optional[List[str]]
    rag_used_real: Optional[bool]
    appointment_data: Optional[Dict]
    response_draft: Optional[str]
    validation_result: Optional[Dict]
    final_response: Optional[str]

    agent_trace: List[Dict]

def classifier_node(state: WorkflowState) -> WorkflowState:
    intent, duration = run_classifier(state["query"])
    state["intent"] = intent
    state["agent_trace"].append({
        "agent": "Query Classifier",
        "status": "completed",
        "output": {"intent": intent},
        "duration_ms": duration,
    })
    return state

def risk_node(state: WorkflowState) -> WorkflowState:
    risk_result, duration = run_risk_agent(state["query"], state["intent"])
    state["risk_level"] = risk_result["risk_level"]
    state["escalate"] = risk_result["escalate"]
    state["risk_reason"] = risk_result["reason"]
    state["agent_trace"].append({
        "agent": "Risk Evaluator",
        "status": "completed",
        "output": risk_result,
        "duration_ms": duration,
    })

    if risk_result["escalate"]:
        db.create_escalation({
            "patient_name": state["patient_name"],
            "risk_level": risk_result["risk_level"],
            "issue": risk_result["reason"],
            "query": state["query"],
        })

    return state

def rag_node(state: WorkflowState) -> WorkflowState:
    chunks, used_real, duration = run_rag_agent(state["query"], state["intent"])
    state["rag_context"] = chunks
    state["rag_used_real"] = used_real
    state["agent_trace"].append({
        "agent": "RAG Retrieval",
        "status": "completed",
        "output": {
            "chunks_retrieved": len(chunks),
            "source": "pinecone" if used_real else "knowledge_base",
        },
        "duration_ms": duration,
    })
    return state

def appointment_node(state: WorkflowState) -> WorkflowState:
    appt_data, duration = run_appointment_agent(
        state["query"], state["intent"], state["patient_name"], state["user_id"]
    )
    state["appointment_data"] = appt_data
    state["agent_trace"].append({
        "agent": "Appointment Router",
        "status": "completed",
        "output": appt_data or {"action": "not_applicable"},
        "duration_ms": duration,
    })
    return state

def response_node(state: WorkflowState) -> WorkflowState:
    response_draft, duration = run_response_agent(
        query=state["query"],
        intent=state["intent"],
        context=state["rag_context"] or [],
        risk_level=state["risk_level"],
        appointment_data=state["appointment_data"],
    )
    state["response_draft"] = response_draft
    state["agent_trace"].append({
        "agent": "Response Writer",
        "status": "completed",
        "output": {"response_length": len(response_draft)},
        "duration_ms": duration,
    })
    return state

def validator_node(state: WorkflowState) -> WorkflowState:
    val_result, duration = run_validator_agent(
        response_draft=state["response_draft"],
        intent=state["intent"],
        risk_level=state["risk_level"],
        rag_context_used=bool(state.get("rag_context")),
    )
    state["validation_result"] = val_result
    state["final_response"] = val_result["modified_response"]
    state["agent_trace"].append({
        "agent": "Validator",
        "status": "completed",
        "output": {
            "passed": val_result["passed"],
            "confidence": val_result["confidence"],
            "issues": val_result["issues"],
        },
        "duration_ms": duration,
    })

    db.create_chat_log({
        "session_id": state["session_id"],
        "patient_name": state["patient_name"],
        "query": state["query"],
        "intent": state["intent"],
        "risk_level": state["risk_level"],
        "response": state["final_response"],
        "agent_trace": state["agent_trace"],
    })

    return state

def build_workflow() -> StateGraph:
    graph = StateGraph(WorkflowState)

    graph.add_node("classifier", classifier_node)
    graph.add_node("risk_evaluator", risk_node)
    graph.add_node("rag_retrieval", rag_node)
    graph.add_node("appointment_router", appointment_node)
    graph.add_node("response_writer", response_node)
    graph.add_node("validator", validator_node)

    graph.set_entry_point("classifier")
    graph.add_edge("classifier", "risk_evaluator")
    graph.add_edge("risk_evaluator", "rag_retrieval")
    graph.add_edge("rag_retrieval", "appointment_router")
    graph.add_edge("appointment_router", "response_writer")
    graph.add_edge("response_writer", "validator")
    graph.add_edge("validator", END)

    return graph.compile()

workflow = build_workflow()

def run_workflow(query: str, patient_name: str, user_id: str, session_id: str) -> WorkflowState:

    initial_state: WorkflowState = {
        "query": query,
        "patient_name": patient_name,
        "user_id": user_id,
        "session_id": session_id,
        "intent": None,
        "risk_level": None,
        "escalate": False,
        "risk_reason": None,
        "rag_context": None,
        "rag_used_real": False,
        "appointment_data": None,
        "response_draft": None,
        "validation_result": None,
        "final_response": None,
        "agent_trace": [],
    }
    return workflow.invoke(initial_state)
