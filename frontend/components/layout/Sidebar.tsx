"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Calendar,
  FileText,
  LayoutDashboard,
  Heart,
  Shield,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Overview", section: "patient" },
  { href: "/chat", icon: Bot, label: "AI Assistant", section: "patient" },
  { href: "/appointments", icon: Calendar, label: "Appointments", section: "patient" },
  { href: "/reports", icon: FileText, label: "Reports", section: "patient" },
  { href: "/admin", icon: Shield, label: "Admin Dashboard", section: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: "rgba(10, 15, 30, 0.95)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "8px 10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              MediFlow AI
            </div>
            <div style={{ fontSize: "10px", color: "#4A5680", letterSpacing: "0.5px" }}>
              CLINIC OPERATIONS
            </div>
          </div>
        </div>
      </div>

      {/* Patient Section */}
      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#4A5680",
            letterSpacing: "1px",
            padding: "0 10px",
            marginBottom: "6px",
          }}
        >
          PATIENT
        </div>
        {navItems
          .filter((i) => i.section === "patient")
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: "auto", opacity: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
      </div>

      {/* Admin Section */}
      <div style={{ marginTop: "12px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "#4A5680",
            letterSpacing: "1px",
            padding: "0 10px",
            marginBottom: "6px",
          }}
        >
          ADMIN
        </div>
        {navItems
          .filter((i) => i.section === "admin")
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight
                    size={14}
                    style={{ marginLeft: "auto", opacity: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
      </div>

      {/* Bottom Status */}
      <div style={{ marginTop: "auto" }}>
        <div
          className="glass-card-static"
          style={{ padding: "12px 14px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <Activity size={14} color="#10B981" />
            <span style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>
              System Online
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#4A5680" }}>
            6 agents active • Demo mode
          </div>
          <div
            style={{
              marginTop: "8px",
              height: "4px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "78%",
                background: "linear-gradient(90deg, #00D4FF, #10B981)",
                borderRadius: "2px",
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
