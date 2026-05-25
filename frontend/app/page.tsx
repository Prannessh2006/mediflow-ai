"use client";

import Link from "next/link";
import { Bot, Calendar, Activity, AlertTriangle, FileText, ArrowRight, Heart, Clock, CheckCircle } from "lucide-react";

const quickActions = [
  {
    href: "/chat",
    icon: Bot,
    label: "Ask AI Assistant",
    desc: "Get instant answers about your health & clinic",
    color: "#00D4FF",
    bg: "rgba(0, 212, 255, 0.1)",
    border: "rgba(0, 212, 255, 0.2)",
  },
  {
    href: "/appointments",
    icon: Calendar,
    label: "Book Appointment",
    desc: "Schedule with our specialist doctors",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.1)",
    border: "rgba(124, 58, 237, 0.2)",
  },
  {
    href: "/reports",
    icon: FileText,
    label: "Upload Report",
    desc: "Get AI-powered analysis of your medical reports",
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.2)",
  },
  {
    href: "/admin",
    icon: Activity,
    label: "Admin Dashboard",
    desc: "Monitor operations and patient workflows",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.2)",
  },
];

const recentActivity = [
  { icon: Calendar, text: "Appointment confirmed — Dr. Priya Mehta", time: "2 min ago", color: "#00D4FF" },
  { icon: AlertTriangle, text: "High-risk escalation: Chest pain reported", time: "8 min ago", color: "#F43F5E" },
  { icon: CheckCircle, text: "Report summary generated for Raj Sharma", time: "15 min ago", color: "#10B981" },
  { icon: Bot, text: "12 patient queries handled by AI today", time: "1 hr ago", color: "#7C3AED" },
];

const agents = [
  { name: "Query Classifier", status: "online", latency: "42ms" },
  { name: "Risk Evaluator", status: "online", latency: "38ms" },
  { name: "RAG Retrieval", status: "online", latency: "95ms" },
  { name: "Appointment Router", status: "online", latency: "56ms" },
  { name: "Response Writer", status: "online", latency: "210ms" },
  { name: "Validator", status: "online", latency: "29ms" },
];

export default function HomePage() {
  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      
      <div className="animate-fade-in-up" style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={22} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MediFlow AI
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#8B9BC8" }}>
              Multi-Agent Clinic Operations Platform
            </p>
          </div>
        </div>
      </div>

      <div
        className="animate-fade-in-up glass-card-static"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          marginBottom: "32px",
          overflow: "hidden",
        }}
      >
        {[
          { label: "Appointments Today", value: "3", icon: Calendar, color: "#00D4FF" },
          { label: "Active Alerts", value: "2", icon: AlertTriangle, color: "#F43F5E" },
          { label: "AI Chats Today", value: "12", icon: Bot, color: "#7C3AED" },
          { label: "Reports Processed", value: "1", icon: FileText, color: "#10B981" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "rgba(255,255,255,0.02)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: `${stat.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#F0F4FF", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "12px", color: "#8B9BC8", marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#F0F4FF", marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="glass-card"
              style={{
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: action.bg,
                  border: `1px solid ${action.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <action.icon size={22} color={action.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#F0F4FF", marginBottom: "3px" }}>
                  {action.label}
                </div>
                <div style={{ fontSize: "13px", color: "#8B9BC8" }}>{action.desc}</div>
              </div>
              <ArrowRight size={16} color="#4A5680" style={{ flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        <div className="glass-card-static" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={14} color="#8B9BC8" /> Recent Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "8px",
                  background: `${act.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <act.icon size={13} color={act.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "#8B9BC8" }}>{act.text}</div>
                  <div style={{ fontSize: "11px", color: "#4A5680", marginTop: "2px" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card-static" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F4FF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={14} color="#8B9BC8" /> Agent Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {agents.map((agent, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="status-dot online" />
                <div style={{ flex: 1, fontSize: "13px", color: "#8B9BC8" }}>{agent.name}</div>
                <div style={{
                  fontSize: "11px",
                  color: "#10B981",
                  background: "rgba(16,185,129,0.1)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                }}>
                  {agent.latency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
