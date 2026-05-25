
import axios from "axios";
import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export interface AgentTraceStep {
  agent: string;
  status: "completed" | "processing" | "skipped" | "error";
  output?: Record<string, unknown>;
  duration_ms?: number;
}

export interface ChatResponse {
  response: string;
  intent: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  escalated: boolean;
  agent_trace: AgentTraceStep[];
  session_id: string;
  appointment_data?: Record<string, unknown>;
  rag_context_used: boolean;
}

export interface Appointment {
  id: string;
  patient_name: string;
  patient_email?: string;
  doctor_name: string;
  appointment_date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
}

export interface Escalation {
  id: string;
  patient_name: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  issue: string;
  query: string;
  status: "open" | "reviewed" | "resolved";
  created_at: string;
}

export interface AdminStats {
  appointments_today: number;
  high_risk_alerts: number;
  pending_approvals: number;
  total_chats_today: number;
  resolved_escalations: number;
}

export interface Report {
  id: string;
  patient_name: string;
  file_name: string;
  file_url?: string;
  extracted_summary?: string;
  created_at: string;
}

export const chatApi = {
  send: async (query: string, patientName = "Anonymous") => {
    const res = await api.post<ChatResponse>("/chat", {
      query,
      patient_name: patientName,
    });
    return res.data;
  },
};

export const appointmentsApi = {
  list: async (): Promise<Appointment[]> => {
    const res = await api.get<Appointment[]>("/appointments");
    return res.data;
  },
  book: async (data: {
    patient_name: string;
    patient_email?: string;
    patient_phone?: string;
    doctor_name: string;
    appointment_date: string;
    notes?: string;
  }): Promise<Appointment> => {
    const res = await api.post<Appointment>("/appointments/book", data);
    return res.data;
  },
  update: async (id: string, data: { status?: string; notes?: string }) => {
    const res = await api.patch(`/appointments/${id}`, data);
    return res.data;
  },
};

export const reportsApi = {
  list: async (): Promise<Report[]> => {
    const res = await api.get<Report[]>("/reports");
    return res.data;
  },
  upload: async (file: File, patientName: string, patientEmail?: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("patient_name", patientName);
    if (patientEmail) form.append("patient_email", patientEmail);
    const res = await api.post("/upload-report", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

export const adminApi = {
  stats: async (): Promise<AdminStats> => {
    const res = await api.get<AdminStats>("/admin/stats");
    return res.data;
  },
  escalations: async (): Promise<Escalation[]> => {
    const res = await api.get<Escalation[]>("/admin/escalations");
    return res.data;
  },
  updateEscalation: async (id: string, status: string) => {
    const res = await api.patch(`/admin/escalations/${id}`, { status });
    return res.data;
  },
  chatLogs: async () => {
    const res = await api.get("/admin/chat-logs");
    return res.data;
  },
};
