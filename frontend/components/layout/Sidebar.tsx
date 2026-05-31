"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import {
  Activity,
  Bot,
  Calendar,
  FileText,
  LayoutDashboard,
  Heart,
  Shield,
  ChevronRight,
  LogOut,
  LogIn
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
  const { user, loading } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        position: "relative",
        zIndex: 10,
      }}
    >
      
      <div style={{ padding: "8px 10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "var(--accent-cyan)",
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
                color: "var(--text-primary)",
              }}
            >
              MediFlow AI
            </div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.5px" }}>
              CLINIC OPERATIONS
            </div>
          </div>
        </div>
      </div>

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

      <div style={{ marginTop: "auto" }}>
        {loading ? (
          <div className="glass-card-static" style={{ padding: "12px 14px", opacity: 0.5 }}>Loading...</div>
        ) : user ? (
          <div className="glass-card-static" style={{ padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--text-muted)" }} />
              )}
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {user.displayName}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
