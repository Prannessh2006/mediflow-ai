from app.graph.workflow import run_workflow

tests = [
    ("What are your clinic timings?", "clinic_policy", "LOW"),
    ("I want to book an appointment tomorrow", "appointment_booking", "LOW"),
    ("I have severe chest pain", "emergency_symptom", "HIGH"),
    ("Can I reschedule my appointment?", "appointment_reschedule", "LOW"),
    ("Tell me about my prescription", "prescription_question", "LOW"),
]

print("=== MEDIFLOW AI VERIFICATION ===\n")
all_pass = True
for query, exp_intent, exp_risk in tests:
    r = run_workflow(query, "Test Patient", "verify-sess")
    intent_ok = r["intent"] == exp_intent
    risk_ok = r["risk_level"] == exp_risk
    trace_ok = len(r["agent_trace"]) == 6
    ok = intent_ok and risk_ok and trace_ok
    if not ok:
        all_pass = False
    label = "PASS" if ok else "FAIL"
    print(f"[{label}] intent={r['intent']} risk={r['risk_level']} agents={len(r['agent_trace'])}")
    print(f"       query: {query[:60]}")
    print()

print("RESULT:", "ALL 5 TESTS PASSED" if all_pass else "SOME FAILED")
