"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { signInWithPopup } from "firebase/auth";
import { googleProvider } from "@/lib/firebase";
import { Heart, LogIn } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoginError("");
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      setLoginError("Failed to sign in. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0F1E" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(0, 212, 255, 0.2)",
          borderTopColor: "#00D4FF",
          animation: "spin 1s linear infinite"
        }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "url('https://www.transparenttextures.com/patterns/stardust.png'), linear-gradient(135deg, #0A0F1E 0%, #1A1F35 100%)",
      }}>
        <div className="glass-card" style={{
          padding: "48px",
          maxWidth: "440px",
          width: "90%",
          textAlign: "center",
          borderRadius: "24px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 12px 24px rgba(124, 58, 237, 0.4)"
          }}>
            <Heart size={36} color="white" strokeWidth={2.5} />
          </div>
          
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-0.5px" }}>
            Welcome to MediFlow
          </h1>
          <p style={{ color: "#8B9BC8", fontSize: "15px", marginBottom: "32px", lineHeight: 1.5 }}>
            Sign in to access your clinic operations dashboard, AI assistant, and patient reports.
          </p>

          {loginError && (
            <div style={{ color: "#ff4d4f", fontSize: "13px", marginBottom: "16px", background: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px" }}>
              {loginError}
            </div>
          )}

          <button
            onClick={handleSignIn}
            style={{
              width: "100%",
              padding: "16px",
              background: "#fff",
              border: "none",
              borderRadius: "12px",
              color: "#0A0F1E",
              fontSize: "15px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
            }}
          >
            <LogIn size={20} color="#0A0F1E" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
