"use client";

import { CheckCircle, Clock, Loader2, AlertTriangle, Database, Bot, Shield, Calendar, Zap } from "lucide-react";
import { AgentTraceStep } from "@/lib/api";

const AGENT_ICONS: Record<string, React.ElementType> = {
  "Query Classifier": Zap,
  "Risk Evaluator": AlertTriangle,
  "RAG Retrieval": Database,
  "Appointment Router": Calendar,
  "Response Writer": Bot,
  "Validator": Shield,
};

const AGENT_COLORS: Record<string, string> = {
  "Query Classifier": "#00D4FF",
  "Risk Evaluator": "#F43F5E",
  "RAG Retrieval": "#7C3AED",
  "Appointment Router": "#F59E0B",
  "Response Writer": "#10B981",
  "Validator": "#00D4FF",
};

interface WorkflowTraceProps {
  steps: AgentTraceStep[];
  isLoading?: boolean;
}

export function WorkflowTrace({ steps, isLoading }: WorkflowTraceProps) {
  const allAgents = [
    "Query Classifier",
    "Risk Evaluator",
    "RAG Retrieval",
    "Appointment Router",
    "Response Writer",
    "Validator",
  ];

  const completedNames = new Set(steps.map((s) => s.agent));
  const currentIdx = steps.length;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#4A5680", letterSpacing: "1px", marginBottom: "12px" }}>
        AI WORKFLOW TRACE
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {allAgents.map((agentName, i) => {
          const step = steps.find((s) => s.agent === agentName);
          const isCompleted = completedNames.has(agentName);
          const isProcessing = isLoading && i === currentIdx;
          const isPending = !isCompleted && !isProcessing;
          const color = AGENT_COLORS[agentName];
          const Icon = AGENT_ICONS[agentName] || Bot;

          return (
            <div
              key={agentName}
              className={`trace-step ${isCompleted ? "completed" : isProcessing ? "processing" : ""}`}
            >
              {/* Status dot */}
              <div
                className={`trace-dot ${isCompleted ? "completed" : isProcessing ? "processing" : "pending"}`}
              />

              {/* Icon */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "7px",
                  background: isCompleted
                    ? `${color}18`
                    : isProcessing
                    ? `${color}10`
                    : "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isProcessing ? (
                  <Loader2 size={12} color={color} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Icon size={12} color={isCompleted ? color : "#4A5680"} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: isCompleted
                        ? "#F0F4FF"
                        : isProcessing
                        ? color
                        : "#4A5680",
                    }}
                  >
                    {agentName}
                  </span>
                  {isCompleted && step?.duration_ms && (
                    <span style={{ fontSize: "10px", color: "#4A5680" }}>
                      {step.duration_ms}ms
                    </span>
                  )}
                </div>

                {/* Output summary */}
                {isCompleted && step?.output && (
                  <div style={{ fontSize: "11px", color: "#4A5680", marginTop: "2px" }}>
                    {agentName === "Query Classifier" && (step.output as { intent?: string }).intent && (
                      <span className="badge badge-cyan" style={{ fontSize: "10px", padding: "1px 7px" }}>
                        {String((step.output as { intent?: string }).intent).replace(/_/g, " ")}
                      </span>
                    )}
                    {agentName === "Risk Evaluator" && (step.output as { risk_level?: string }).risk_level && (
                      <span
                        className={`badge badge-${
                          (step.output as { risk_level?: string }).risk_level === "HIGH"
                            ? "high"
                            : (step.output as { risk_level?: string }).risk_level === "MEDIUM"
                            ? "medium"
                            : "low"
                        }`}
                        style={{ fontSize: "10px", padding: "1px 7px" }}
                      >
                        {String((step.output as { risk_level?: string }).risk_level)} risk
                      </span>
                    )}
                    {agentName === "RAG Retrieval" && (step.output as { chunks_retrieved?: number }).chunks_retrieved !== undefined && (
                      <span style={{ color: "#7C3AED" }}>
                        {(step.output as { chunks_retrieved?: number }).chunks_retrieved} chunks retrieved
                      </span>
                    )}
                    {agentName === "Appointment Router" && (step.output as { action?: string }).action && (
                      <span style={{ color: "#F59E0B" }}>
                        {String((step.output as { action?: string }).action).replace(/_/g, " ")}
                      </span>
                    )}
                    {agentName === "Response Writer" && (step.output as { response_length?: number }).response_length && (
                      <span style={{ color: "#10B981" }}>
                        {(step.output as { response_length?: number }).response_length} chars
                      </span>
                    )}
                    {agentName === "Validator" && (step.output as { confidence?: number }).confidence !== undefined && (
                      <span style={{ color: "#00D4FF" }}>
                        {Math.round(Number((step.output as { confidence?: number }).confidence) * 100)}% confidence
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div style={{ flexShrink: 0 }}>
                {isCompleted ? (
                  <CheckCircle size={14} color="#10B981" />
                ) : isProcessing ? (
                  <Clock size={14} color={color} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connector lines */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
