"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatApi, ChatResponse, AgentTraceStep } from "@/lib/api";
import { WorkflowTrace } from "@/components/chat/WorkflowTrace";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  intent?: string;
  risk_level?: string;
  escalated?: boolean;
  trace?: AgentTraceStep[];
  rag_context_used?: boolean;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  "I want to book an appointment tomorrow",
  "What are the clinic timings?",
  "I have severe chest pain",
  "How do I get my test results?",
  "What insurance do you accept?",
  "Can I reschedule my appointment?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [patientName, setPatientName] = useState("Anonymous");
  const [liveTrace, setLiveTrace] = useState<AgentTraceStep[]>([]);
  const [showTrace, setShowTrace] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, liveTrace]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setLiveTrace([]);

    // Simulate progressive trace reveal
    const agentNames = [
      "Query Classifier",
      "Risk Evaluator",
      "RAG Retrieval",
      "Appointment Router",
      "Response Writer",
      "Validator",
    ];

    let response: ChatResponse | null = null;

    try {
      // Kick off the real API call
      const promise = chatApi.send(query, patientName);

      // Show fake progressive loading (each ~200ms)
      for (let i = 0; i < agentNames.length - 1; i++) {
        await new Promise((r) => setTimeout(r, 180));
        setLiveTrace((prev) => [
          ...prev,
          {
            agent: agentNames[i],
            status: "completed",
            output: {},
            duration_ms: Math.floor(Math.random() * 120) + 30,
          },
        ]);
      }

      response = await promise;

      // Use real trace from API
      setLiveTrace(response.agent_trace);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: response.response,
        intent: response.intent,
        risk_level: response.risk_level,
        escalated: response.escalated,
        trace: response.agent_trace,
        rag_context_used: response.rag_context_used,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("API Error details:", err);
      console.error("Response:", err.response?.data);
      // Demo fallback when backend isn't running
      const fallbackTrace = agentNames.map((name, i) => ({
        agent: name,
        status: "completed" as const,
        output: { demo: true, error: err.message },
        duration_ms: Math.floor(Math.random() * 120) + 30,
      }));
      setLiveTrace(fallbackTrace);

      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "ai",
        content: `**Backend Connection Failed**\n\nI received your query: *"${query}"*\n\nHowever, the backend rejected the request.\n\n**Error:** ${err.message}\n**Details:** ${err.response?.data?.detail || "No additional details provided."}\n\nTo see the full AI pipeline working, please check your Render logs or start the backend locally:\n\`\`\`\ncd backend && uvicorn app.main:app --reload\n\`\`\``,
        intent: "general_inquiry",
        risk_level: "LOW",
        escalated: false,
        trace: fallbackTrace,
        rag_context_used: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLiveTrace([]);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(10,15,30,0.8)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00D4FF20, #7C3AED20)",
              border: "1px solid rgba(0,212,255,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={18} color="#00D4FF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#F0F4FF" }}>MediFlow AI Assistant</div>
            <div style={{ fontSize: "12px", color: "#8B9BC8", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="status-dot online" style={{ width: 6, height: 6 }} />
              6-agent pipeline active • Demo mode
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              placeholder="Your name (optional)"
              value={patientName === "Anonymous" ? "" : patientName}
              onChange={(e) => setPatientName(e.target.value || "Anonymous")}
              className="input-field"
              style={{ width: "160px", padding: "8px 12px", fontSize: "13px" }}
            />
            <button
              onClick={() => setShowTrace(!showTrace)}
              className="btn-ghost"
              style={{ padding: "8px 14px", fontSize: "12px" }}
            >
              {showTrace ? "Hide" : "Show"} Trace
            </button>
            {messages.length > 0 && (
              <button onClick={clearChat} className="btn-ghost" style={{ padding: "8px" }}>
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {messages.length === 0 && (
            <div
              className="animate-fade-in-up"
              style={{ textAlign: "center", paddingTop: "40px" }}
            >
              <div
                className="animate-float"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #00D4FF20, #7C3AED20)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Sparkles size={28} color="#00D4FF" />
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F0F4FF", marginBottom: "8px" }}>
                Hello! How can I help you?
              </h2>
              <p style={{ color: "#8B9BC8", fontSize: "14px", marginBottom: "32px" }}>
                Ask about appointments, clinic policies, reports, or any health questions.
              </p>

              {/* Suggested queries */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "500px", margin: "0 auto" }}>
                {SUGGESTED_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: "8px 14px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "100px",
                      color: "#8B9BC8",
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(0,212,255,0.08)";
                      (e.target as HTMLElement).style.borderColor = "rgba(0,212,255,0.2)";
                      (e.target as HTMLElement).style.color = "#00D4FF";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      (e.target as HTMLElement).style.color = "#8B9BC8";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className="animate-fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "6px",
              }}
            >
              {msg.role === "user" ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                  <div className="chat-bubble-user">
                    <p style={{ margin: 0, fontSize: "14px", color: "#F0F4FF" }}>{msg.content}</p>
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: "8px",
                    background: "linear-gradient(135deg, #00D4FF, #7C3AED)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <User size={14} color="white" />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", maxWidth: "85%" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "8px",
                    background: "rgba(0,212,255,0.15)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
                  }}>
                    <Bot size={14} color="#00D4FF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {msg.escalated && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "8px 12px", borderRadius: "8px",
                        background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
                        marginBottom: "8px",
                      }}>
                        <AlertTriangle size={14} color="#F43F5E" />
                        <span style={{ fontSize: "12px", color: "#F43F5E", fontWeight: 600 }}>
                          HIGH RISK — This case has been escalated to clinical staff
                        </span>
                      </div>
                    )}
                    <div
                      className={`chat-bubble-ai ${msg.escalated ? "chat-bubble-emergency" : ""}`}
                    >
                      <div className="markdown-output">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", paddingLeft: "2px" }}>
                      {msg.intent && (
                        <span className="badge badge-cyan">{msg.intent.replace(/_/g, " ")}</span>
                      )}
                      {msg.risk_level && (
                        <span className={`badge badge-${msg.risk_level === "HIGH" ? "high" : msg.risk_level === "MEDIUM" ? "medium" : "low"}`}>
                          {msg.risk_level} risk
                        </span>
                      )}
                      {msg.rag_context_used && (
                        <span className="badge badge-purple">RAG</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "8px",
                background: "rgba(0,212,255,0.15)",
                border: "1px solid rgba(0,212,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bot size={14} color="#00D4FF" />
              </div>
              <div style={{
                padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", gap: "4px", alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#00D4FF",
                    animation: `pulse-dot 1.2s infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,15,30,0.8)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about appointments, clinic info, symptoms..."
              className="input-field"
              disabled={isLoading}
              style={{ flex: 1 }}
              autoFocus
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="btn-primary"
              style={{ padding: "12px 18px", opacity: !input.trim() || isLoading ? 0.5 : 1 }}
            >
              <Send size={16} />
            </button>
          </div>
          <div style={{ fontSize: "11px", color: "#4A5680", marginTop: "8px" }}>
            Press Enter to send • This AI is for informational purposes only
          </div>
        </div>
      </div>

      {/* Trace Panel */}
      {showTrace && (
        <div
          style={{
            width: "300px",
            minWidth: "300px",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 16px",
            overflowY: "auto",
            background: "rgba(10,15,30,0.6)",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#F0F4FF", marginBottom: "16px" }}>
            Agent Pipeline
          </div>
          <WorkflowTrace
            steps={isLoading ? liveTrace : (messages[messages.length - 1]?.trace || liveTrace)}
            isLoading={isLoading}
          />
          {!isLoading && messages.length > 0 && (
            <div style={{ marginTop: "16px", fontSize: "12px", color: "#4A5680" }}>
              Last query processed through 6-agent LangGraph pipeline
            </div>
          )}
        </div>
      )}
    </div>
  );
}
