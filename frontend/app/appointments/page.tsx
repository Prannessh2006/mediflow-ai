"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, X, CheckCircle, Clock, User, Stethoscope, FileText, ChevronDown } from "lucide-react";
import { appointmentsApi, Appointment } from "@/lib/api";
import { format, parseISO } from "date-fns";

const DOCTORS = [
  "Dr. Priya Mehta (General Physician)",
  "Dr. Arun Kapoor (Cardiologist)",
  "Dr. Sunita Rao (Dermatologist)",
  "Dr. Vikram Singh (Orthopedic)",
  "Dr. Anjali Sharma (Gynecologist)",
  "Dr. Ravi Kumar (Pediatrician)",
];

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Pending" },
  confirmed: { color: "#00D4FF", bg: "rgba(0,212,255,0.1)", label: "Confirmed" },
  completed: { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Completed" },
  cancelled: { color: "#F43F5E", bg: "rgba(244,63,94,0.1)", label: "Cancelled" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    doctor_name: DOCTORS[0],
    appointment_date: "",
    appointment_time: "10:30",
    notes: "",
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsApi.list();
      setAppointments(data);
    } catch {
      // Demo fallback
      setAppointments([
        {
          id: "appt-001", patient_name: "Raj Sharma", patient_email: "raj@example.com",
          doctor_name: "Dr. Priya Mehta (General Physician)", appointment_date: "2026-05-22T10:30:00Z",
          status: "confirmed", notes: "Annual checkup", created_at: "2026-05-20T08:00:00Z",
        },
        {
          id: "appt-002", patient_name: "Anita Verma", patient_email: "anita@example.com",
          doctor_name: "Dr. Arun Kapoor (Cardiologist)", appointment_date: "2026-05-21T14:00:00Z",
          status: "pending", notes: "Follow-up after blood test", created_at: "2026-05-19T09:30:00Z",
        },
        {
          id: "appt-003", patient_name: "Mohammed Ali", patient_email: "mali@example.com",
          doctor_name: "Dr. Priya Mehta (General Physician)", appointment_date: "2026-05-20T11:00:00Z",
          status: "completed", notes: "Diabetic consultation", created_at: "2026-05-18T10:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name || !form.appointment_date) return;
    setSubmitting(true);
    try {
      const dateTime = `${form.appointment_date}T${form.appointment_time}:00Z`;
      const appt = await appointmentsApi.book({
        patient_name: form.patient_name,
        patient_email: form.patient_email,
        patient_phone: form.patient_phone,
        doctor_name: form.doctor_name,
        appointment_date: dateTime,
        notes: form.notes,
      });
      setAppointments((prev) => [appt, ...prev]);
      setSuccess(`Appointment booked with ${form.doctor_name.split("(")[0].trim()}!`);
      setShowForm(false);
      setForm({ patient_name: "", patient_email: "", patient_phone: "", doctor_name: DOCTORS[0], appointment_date: "", appointment_time: "10:30", notes: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      // Demo: just add locally
      const mock = {
        id: `appt-${Date.now()}`, ...form,
        appointment_date: `${form.appointment_date}T${form.appointment_time}:00Z`,
        status: "pending" as const, created_at: new Date().toISOString(),
      };
      setAppointments((prev) => [mock, ...prev]);
      setSuccess("Appointment booked! (Demo mode)");
      setShowForm(false);
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appointmentsApi.update(id, { status });
    } catch 
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a)));
  };

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d, yyyy • h:mm a"); }
    catch { return dateStr; }
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
      
      <div className="animate-fade-in-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#F0F4FF", margin: 0 }}>Appointments</h1>
          <p style={{ color: "#8B9BC8", margin: "4px 0 0", fontSize: "14px" }}>
            Book, view, and manage patient appointments
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {success && (
        <div className="animate-fade-in" style={{
          padding: "12px 16px", borderRadius: "10px", marginBottom: "20px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <CheckCircle size={16} color="#10B981" />
          <span style={{ color: "#10B981", fontSize: "14px" }}>{success}</span>
        </div>
      )}

      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div className="glass-card-static animate-fade-in-up" style={{ width: "100%", maxWidth: "520px", padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#F0F4FF", margin: 0 }}>
                Book Appointment
              </h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ padding: "6px" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Patient Name *</label>
                  <input className="input-field" placeholder="Full name" required value={form.patient_name} onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Email</label>
                  <input className="input-field" placeholder="email@example.com" type="email" value={form.patient_email} onChange={(e) => setForm((f) => ({ ...f, patient_email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Doctor</label>
                <div style={{ position: "relative" }}>
                  <select
                    className="input-field"
                    value={form.doctor_name}
                    onChange={(e) => setForm((f) => ({ ...f, doctor_name: e.target.value }))}
                    style={{ appearance: "none", cursor: "pointer" }}
                  >
                    {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown size={14} color="#8B9BC8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Date *</label>
                  <input className="input-field" type="date" required value={form.appointment_date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Time</label>
                  <input className="input-field" type="time" value={form.appointment_time} onChange={(e) => setForm((f) => ({ ...f, appointment_time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#8B9BC8", marginBottom: "6px", display: "block" }}>Notes (optional)</label>
                <textarea className="input-field" placeholder="Reason for visit, symptoms..." rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "96px" }} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {appointments.map((appt, i) => {
            const st = STATUS_COLORS[appt.status] || STATUS_COLORS.pending;
            return (
              <div
                key={appt.id}
                className="glass-card animate-fade-in"
                style={{ padding: "18px 20px", animationDelay: `${i * 0.05}s` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Stethoscope size={20} color="#00D4FF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "3px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#F0F4FF" }}>
                        {appt.patient_name}
                      </span>
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "100px", fontWeight: 600,
                        background: st.bg, color: st.color,
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "13px", color: "#8B9BC8", display: "flex", alignItems: "center", gap: "5px" }}>
                        <User size={12} /> {appt.doctor_name}
                      </span>
                      <span style={{ fontSize: "13px", color: "#8B9BC8", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Calendar size={12} /> {formatDate(appt.appointment_date)}
                      </span>
                      {appt.notes && (
                        <span style={{ fontSize: "13px", color: "#8B9BC8", display: "flex", alignItems: "center", gap: "5px" }}>
                          <FileText size={12} /> {appt.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {appt.status === "pending" && (
                      <>
                        <button className="btn-success" onClick={() => updateStatus(appt.id, "confirmed")}>
                          <CheckCircle size={12} /> Confirm
                        </button>
                        <button className="btn-danger" onClick={() => updateStatus(appt.id, "cancelled")}>
                          <X size={12} /> Cancel
                        </button>
                      </>
                    )}
                    {appt.status === "confirmed" && (
                      <button className="btn-success" onClick={() => updateStatus(appt.id, "completed")}>
                        <CheckCircle size={12} /> Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {appointments.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#4A5680" }}>
              <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p>No appointments yet. Book one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
