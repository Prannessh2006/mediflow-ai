"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle, Calendar, Bot, Users, CheckCircle,
  Clock, TrendingUp, Activity, RefreshCw, MessageSquare,
} from "lucide-react";
import { adminApi, Escalation, AdminStats } from "@/lib/api";
import { format, parseISO } from "date-fns";

const MOCK_STATS: AdminStats = {
  appointments_today: 3,
  high_risk_alerts: 2,
  pending_approvals: 1,
  total_chats_today: 12,
  resolved_escalations: 1,
};

const MOCK_ESCALATIONS: Escalation[] = [
  { id: "esc-001", patient_name: "Sunita Rao", risk_level: "HIGH", issue: "Patient reported chest pain and difficulty breathing", query: "I have severe chest pain and I can't breathe properly", status: "open", created_at: "2026-05-20T17:00:00Z" },
  { id: "esc-002", patient_name: "Vikram Singh", risk_level: "HIGH", issue: "Patient experiencing severe allergic reaction symptoms", query: "My face is swelling and I have hives all over my body after taking medication", status: "reviewed", created_at: "2026-05-20T15:30:00Z" },
  { id: "esc-003", patient_name: "Deepa Nair", risk_level: "MEDIUM", issue: "Patient has persistent high fever for 3 days", query: "I've had a fever of 104°F for 3 days, is this serious?", status: "open", created_at: "2026-05-20T14:00:00Z" },
];

const AGENT_LOG = [
  { time: "17:47", agent: "Query Classifier", event: "Intent: appointment_booking", patient: "Raj Sharma", intent: "#00D4FF" },
  { time: "17:45", agent: "Risk Evaluator", event: "HIGH risk flagged — escalated", patient: "Sunita Rao", intent: "#F43F5E" },
  { time: "17:30", agent: "RAG Retrieval", event: "3 chunks retrieved from knowledge base", patient: "Anita Verma", intent: "#7C3AED" },
  { time: "17:15", agent: "Response Writer", event: "Appointment confirmation generated", patient: "Mohammed Ali", intent: "#10B981" },
  { time: "17:02", agent: "Validator", event: "Response approved — 94% confidence", patient: "Priya Rao", intent: "#00D4FF" },
  { time: "16:50", agent: "Risk Evaluator", event: "MEDIUM risk — monitoring", patient: "Deepa Nair", intent: "#F59E0B" },
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>(MOCK_STATS);
  const [escalations, setEscalations] = useState<Escalation[]>(MOCK_ESCALATIONS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [s, e] = await Promise.all([adminApi.stats(), adminApi.escalations()]);
      setStats(s);
      setEscalations(e);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const updateEscalation = async (id: string, status: string) => {
    try {
      await adminApi.updateEscalation(id, status);
    } catch (e) {
      console.error(e);
    }
    setEscalations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: status as Escalation["status"] } : e))
    );
  };

  const formatTime = (d: string) => {
    try { return format(parseISO(d), "MMM d • h:mm a"); } catch { return d; }
  };

  const statCards = [
    { label: "Appointments Today", value: stats.appointments_today, icon: Calendar, color: "#00D4FF", glow: "stat-card-glow-cyan" },
    { label: "High Risk Alerts", value: stats.high_risk_alerts, icon: AlertTriangle, color: "#F43F5E", glow: "stat-card-glow-red" },
    { label: "Pending Approvals", value: stats.pending_approvals, icon: Clock, color: "#F59E0B", glow: "" },
    { label: "AI Chats Today", value: stats.total_chats_today, icon: Bot, color: "#7C3AED", glow: "stat-card-glow-purple" },
    { label: "Resolved Cases", value: stats.resolved_escalations, icon: CheckCircle, color: "#10B981", glow: "stat-card-glow-green" },
    { label: "Agents Online", value: 6, icon: Activity, color: "#00D4FF", glow: "stat-card-glow-cyan" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      
      <div
        className="animate-fade-in-up"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#F0F4FF", margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#8B9BC8", margin: "4px 0 0", fontSize: "14px" }}>
            Real-time clinic operations monitoring
          </p>
        </div>
        <button className="btn-ghost" onClick={loadData} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "28px" }}
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`glass-card animate-fade-in-up ${card.glow}`}
            style={{ padding: "20px", animationDelay: `${i * 0.06}s` }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px",
                background: `${card.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon size={20} color={card.color} />
              </div>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#F0F4FF", lineHeight: 1 }}>
                  {card.value}
                </div>
                <div style={{ fontSize: "12px", color: "#8B9BC8", marginTop: "3px" }}>{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "20px" }}>
        
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#F0F4FF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} color="#F43F5E" /> Escalated Cases
            </h2>
            <span className="badge badge-high">
              {escalations.filter((e) => e.status === "open").length} open
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {escalations.map((esc, i) => (
              <div
                key={esc.id}
                className="glass-card animate-fade-in"
                style={{
                  padding: "16px",
                  animationDelay: `${i * 0.07}s`,
                  borderColor: esc.risk_level === "HIGH" ? "rgba(244,63,94,0.2)" : "rgba(245,158,11,0.2)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "9px",
                    background: esc.risk_level === "HIGH" ? "rgba(244,63,94,0.12)" : "rgba(245,158,11,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <AlertTriangle
                      size={16}
                      color={esc.risk_level === "HIGH" ? "#F43F5E" : "#F59E0B"}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF" }}>
                        {esc.patient_name}
                      </span>
                      <span className={`badge badge-${esc.risk_level === "HIGH" ? "high" : "medium"}`}>
                        {esc.risk_level}
                      </span>
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "100px",
                        background: esc.status === "open" ? "rgba(244,63,94,0.1)" : esc.status === "reviewed" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                        color: esc.status === "open" ? "#F43F5E" : esc.status === "reviewed" ? "#F59E0B" : "#10B981",
                      }}>
                        {esc.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#8B9BC8", margin: "0 0 6px" }}>{esc.issue}</p>
                    <p style={{ fontSize: "12px", color: "#4A5680", margin: "0 0 8px", fontStyle: "italic" }}>
                      "{esc.query}"
                    </p>
                    <div style={{ fontSize: "11px", color: "#4A5680" }}>{formatTime(esc.created_at)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {esc.status !== "reviewed" && (
                    <button className="btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => updateEscalation(esc.id, "reviewed")}>
                      Mark Reviewed
                    </button>
                  )}
                  {esc.status !== "resolved" && (
                    <button className="btn-success" style={{ fontSize: "12px" }} onClick={() => updateEscalation(esc.id, "resolved")}>
                      <CheckCircle size={11} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          <div className="glass-card-static" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MessageSquare size={14} color="#8B9BC8" /> AI Activity Log
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {AGENT_LOG.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "11px", color: "#4A5680", minWidth: "36px", paddingTop: "1px" }}>
                    {log.time}
                  </span>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: log.intent, marginTop: "5px", flexShrink: 0,
                    boxShadow: `0 0 6px ${log.intent}80`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", color: "#8B9BC8" }}>{log.event}</div>
                    <div style={{ fontSize: "11px", color: "#4A5680" }}>{log.agent} • {log.patient}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={14} color="#8B9BC8" /> Today's Performance
            </h3>
            {[
              { label: "AI Response Rate", value: 98, color: "#10B981" },
              { label: "Avg. Response Time", value: 75, display: "520ms", color: "#00D4FF" },
              { label: "Safe Responses", value: 100, color: "#7C3AED" },
              { label: "Escalation Rate", value: 17, display: "17%", color: "#F59E0B" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "#8B9BC8" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: item.color }}>
                    {item.display || `${item.value}%`}
                  </span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                  <div style={{
                    height: "100%", width: `${item.value}%`, borderRadius: 2,
                    background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
