"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MessageCircle, TrendingUp, AlertTriangle, Send, ChevronRight, Clock, Users, Zap, X, Check } from "lucide-react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";

const THEMES = [
  { id: "training", label: "Product Training", icon: "📚", color: "#4F46E5" },
  { id: "feature", label: "Feature Request", icon: "✨", color: "#7C3AED" },
  { id: "enablement", label: "Enablement Gap", icon: "🔧", color: "#2563EB" },
  { id: "docs", label: "Documentation", icon: "📄", color: "#0891B2" },
  { id: "onboarding", label: "Onboarding", icon: "🚀", color: "#059669" },
  { id: "adoption", label: "Adoption Blocker", icon: "🚧", color: "#DC2626" },
  { id: "support", label: "Support Process", icon: "🎧", color: "#D97706" },
  { id: "integration", label: "Integration", icon: "🔗", color: "#7C3AED" },
];

const PRODUCTS = ["ITSM", "ITOM", "HRSD", "CSM", "Employee Center Pro", "Creator", "Security Ops", "Other"];
const SEGMENTS = ["Commercial", "Enterprise", "Strategic", "Federal"];
const PRIORITIES = [
  { id: "high", label: "High", desc: "Blocks adoption/renewal", color: "#DC2626" },
  { id: "medium", label: "Medium", desc: "Impacts experience", color: "#D97706" },
  { id: "low", label: "Low", desc: "Nice-to-have", color: "#059669" },
];

const SAMPLE_ENTRIES = [
  { id: "s1", date: "2026-03-01", submittedBy: "Marie", customer: "Farmoquimica SA", segment: "Commercial", theme: "training", product: "ITSM", priority: "high", request: "Customer needs more training on ITSM SOW functionality", frequency: "recurring" },
  { id: "s2", date: "2026-03-01", submittedBy: "João Corona", customer: "ZUP", segment: "Enterprise", theme: "feature", product: "Employee Center Pro", priority: "medium", request: "Better dashboard customization options needed", frequency: "first" },
  { id: "s3", date: "2026-02-28", submittedBy: "Leticia", customer: "F1RST Tecnologia", segment: "Commercial", theme: "enablement", product: "ITOM", priority: "high", request: "Lack of Spanish-language documentation for ITOM setup", frequency: "recurring" },
  { id: "s4", date: "2026-02-27", submittedBy: "Marcus Guerra", customer: "Honeywell Chile SA", segment: "Enterprise", theme: "adoption", product: "HRSD", priority: "high", request: "Low user adoption due to lack of executive sponsorship", frequency: "frequent" },
  { id: "s5", date: "2026-02-26", submittedBy: "Marie", customer: "Farmoquimica SA", segment: "Commercial", theme: "docs", product: "ITSM", priority: "medium", request: "Need step-by-step guide for Incident Management configuration", frequency: "recurring" },
  { id: "s6", date: "2026-02-25", submittedBy: "João Corona", customer: "ZUP", segment: "Enterprise", theme: "training", product: "CSM", priority: "low", request: "Request for advanced CSM workshop for power users", frequency: "first" },
  { id: "s7", date: "2026-02-24", submittedBy: "Leticia", customer: "F1RST Tecnologia", segment: "Commercial", theme: "support", product: "ITSM", priority: "medium", request: "Escalation process unclear for critical incidents", frequency: "recurring" },
  { id: "s8", date: "2026-02-23", submittedBy: "Marcus Guerra", customer: "Honeywell Chile SA", segment: "Enterprise", theme: "integration", product: "ITOM", priority: "high", request: "Need integration guidance with existing monitoring tools", frequency: "first" },
];

const PIE_COLORS = ["#4F46E5", "#7C3AED", "#2563EB", "#0891B2", "#059669", "#DC2626", "#D97706", "#9333EA"];

export default function FeedbackApp() {
  const [view, setView] = useState("dashboard");
  const [entries, setEntries] = useState([]);
  const [formStep, setFormStep] = useState(0);
  const [formData, setFormData] = useState({ theme: "", product: "", otherProduct: "", customer: "", segment: "", priority: "", request: "", frequency: "", submittedBy: "" });
  const [submitted, setSubmitted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  // Real-time listener for Firestore
  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setEntries(data);
        setSeeded(true);
      } else if (!seeded) {
        // Seed sample data on first load
        seedSampleData();
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setEntries(SAMPLE_ENTRIES);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const seedSampleData = async () => {
    try {
      for (const entry of SAMPLE_ENTRIES) {
        const { id, ...data } = entry;
        await addDoc(collection(db, "feedback"), data);
      }
      setSeeded(true);
    } catch (err) {
      console.error("Seed error:", err);
      setEntries(SAMPLE_ENTRIES);
    }
  };

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const resetForm = () => {
    setFormStep(0);
    setFormData({ theme: "", product: "", otherProduct: "", customer: "", segment: "", priority: "", request: "", frequency: "", submittedBy: "" });
    setSubmitted(false);
    setTimer(0);
    setTimerActive(false);
  };

  const handleSubmit = async () => {
    setTimerActive(false);
    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      submittedBy: formData.submittedBy || "Anonymous",
      theme: formData.theme,
      product: formData.product === "Other" && formData.otherProduct ? formData.otherProduct : formData.product,
      customer: formData.customer,
      segment: formData.segment,
      priority: formData.priority,
      request: formData.request,
      frequency: formData.frequency,
    };
    try {
      await addDoc(collection(db, "feedback"), newEntry);
    } catch (err) {
      console.error("Submit error:", err);
      setEntries([{ id: Date.now().toString(), ...newEntry }, ...entries]);
    }
    setSubmitted(true);
  };

  const themeData = THEMES.map((t) => ({
    name: t.label.split(" ").slice(0, 2).join(" "),
    count: entries.filter((e) => e.theme === t.id).length,
    color: t.color,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

  const priorityData = PRIORITIES.map((p) => ({
    name: p.label,
    value: entries.filter((e) => e.priority === p.id).length,
    color: p.color,
  }));

  const productData = PRODUCTS.map((p) => ({
    name: p,
    count: entries.filter((e) => e.product === p).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

  const topTheme = themeData[0];
  const highPriority = entries.filter((e) => e.priority === "high").length;
  const recurring = entries.filter((e) => e.frequency === "recurring" || e.frequency === "frequent").length;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F0B1E 0%, #1A1145 40%, #0D1B2A 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#A5B4FC", fontSize: 16 }}>
        Loading feedback...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F0B1E 0%, #1A1145 40%, #0D1B2A 100%)", color: "#E2E8F0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", background: "rgba(15,11,30,0.8)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "#F8FAFC" }}>Feedback Loop</div>
              <div style={{ fontSize: 11, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase" }}>CEG Customer Insights</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: <TrendingUp size={14} /> },
              { id: "submit", label: "Submit Feedback", icon: <Send size={14} /> },
              { id: "feed", label: "Recent", icon: <Clock size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setView(tab.id); if (tab.id === "submit") { resetForm(); setTimerActive(true); } }}
                style={{
                  padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: view === tab.id ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "transparent",
                  color: view === tab.id ? "white" : "#94A3B8",
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* =================== DASHBOARD VIEW =================== */}
        {view === "dashboard" && (
          <div>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Feedback", value: entries.length, icon: <MessageCircle size={18} />, color: "#6366F1", sub: "all time" },
                { label: "High Priority", value: highPriority, icon: <AlertTriangle size={18} />, color: "#DC2626", sub: `${entries.length > 0 ? Math.round((highPriority / entries.length) * 100) : 0}% of total` },
                { label: "Recurring Issues", value: recurring, icon: <TrendingUp size={18} />, color: "#D97706", sub: "heard 2+ times" },
                { label: "Contributors", value: [...new Set(entries.map((e) => e.submittedBy))].length, icon: <Users size={18} />, color: "#059669", sub: "team members" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "20px 20px", border: "1px solid rgba(255,255,255,0.06)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${stat.color}15, transparent)`, borderRadius: "0 0 0 80px" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                    <span style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{stat.label}</span>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>Feedback by Theme</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={themeData} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#CBD5E1", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: "#1E1B4B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                      {themeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>By Priority</div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {priorityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1E1B4B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E2E8F0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                  {priorityData.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                      <span style={{ color: "#94A3B8" }}>{p.name} ({p.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product breakdown */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>Top Products Mentioned</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {productData.map((p, i) => (
                  <div key={i} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#818CF8" }}>{p.count}</span>
                    <span style={{ fontSize: 13, color: "#CBD5E1" }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================== SUBMIT VIEW =================== */}
        {view === "submit" && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {!submitted && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: timer > 60 ? "rgba(220,38,38,0.15)" : "rgba(99,102,241,0.1)", borderRadius: 20, padding: "6px 16px", border: `1px solid ${timer > 60 ? "rgba(220,38,38,0.3)" : "rgba(99,102,241,0.2)"}` }}>
                  <Zap size={14} color={timer > 60 ? "#F87171" : "#818CF8"} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: timer > 60 ? "#F87171" : "#818CF8", fontVariantNumeric: "tabular-nums" }}>
                    {timer}s — {timer <= 60 ? "On track for <1 min!" : "Take your time"}
                  </span>
                </div>
              </div>
            )}

            {submitted ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #059669, #10B981)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Check size={32} color="white" />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", marginBottom: 8 }}>Feedback Submitted!</div>
                <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 4 }}>Completed in {timer} seconds</div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 24 }}>{timer <= 60 ? "Under 1 minute — great job! ⚡" : "Thanks for the detailed feedback!"}</div>
                <button
                  onClick={() => { resetForm(); setTimerActive(true); }}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <div>
                {/* Progress bar */}
                <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
                  {[0, 1, 2, 3].map((step) => (
                    <div key={step} style={{ flex: 1, height: 4, borderRadius: 2, background: formStep >= step ? "linear-gradient(90deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.06)", transition: "all 0.3s" }} />
                  ))}
                </div>

                {/* Step 0: Theme */}
                {formStep === 0 && (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>What's the feedback about?</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Pick the closest theme</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => { setFormData({ ...formData, theme: theme.id }); setFormStep(1); }}
                          style={{
                            padding: "16px", borderRadius: 12, border: `1px solid ${formData.theme === theme.id ? theme.color : "rgba(255,255,255,0.06)"}`,
                            background: formData.theme === theme.id ? `${theme.color}15` : "rgba(255,255,255,0.02)",
                            cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "#E2E8F0",
                          }}
                        >
                          <span style={{ fontSize: 20, marginRight: 8 }}>{theme.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Product + Customer */}
                {formStep === 1 && (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>Quick details</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Product and customer info</div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Name</label>
                      <input
                        type="text"
                        value={formData.submittedBy}
                        onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                        placeholder="e.g. Marie, Kevin, João"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
                      />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product / BU</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {PRODUCTS.map((p) => (
                          <button
                            key={p}
                            onClick={() => setFormData({ ...formData, product: p })}
                            style={{
                              padding: "8px 16px", borderRadius: 8, border: `1px solid ${formData.product === p ? "#6366F1" : "rgba(255,255,255,0.08)"}`,
                              background: formData.product === p ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                              color: formData.product === p ? "#A5B4FC" : "#94A3B8", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.product === "Other" && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Specify Product</label>
                        <input
                          type="text"
                          value={formData.otherProduct || ""}
                          onChange={(e) => setFormData({ ...formData, otherProduct: e.target.value })}
                          placeholder="e.g. App Engine, Strategic Portfolio Management"
                          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Name</label>
                      <input
                        type="text"
                        value={formData.customer}
                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                        placeholder="e.g. Farmoquimica SA"
                        style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>Segment</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {SEGMENTS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setFormData({ ...formData, segment: s })}
                            style={{
                              padding: "8px 16px", borderRadius: 8, border: `1px solid ${formData.segment === s ? "#6366F1" : "rgba(255,255,255,0.08)"}`,
                              background: formData.segment === s ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                              color: formData.segment === s ? "#A5B4FC" : "#94A3B8", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setFormStep(0)} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                      <button
                        onClick={() => formData.product && formData.customer && formData.submittedBy && setFormStep(2)}
                        style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: formData.product && formData.customer && formData.submittedBy ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "rgba(255,255,255,0.05)", color: formData.product && formData.customer && formData.submittedBy ? "white" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: The Ask */}
                {formStep === 2 && (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>What did the customer ask for?</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Keep it short — one sentence is perfect</div>

                    <textarea
                      value={formData.request}
                      onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                      placeholder="e.g. Customer needs more training on ITSM SOW functionality"
                      rows={3}
                      style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />

                    <div style={{ marginTop: 16, marginBottom: 20 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>How often have you heard this?</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[
                          { id: "first", label: "First time" },
                          { id: "recurring", label: "2-3 times" },
                          { id: "frequent", label: "4+ times" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setFormData({ ...formData, frequency: f.id })}
                            style={{
                              flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${formData.frequency === f.id ? "#6366F1" : "rgba(255,255,255,0.08)"}`,
                              background: formData.frequency === f.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                              color: formData.frequency === f.id ? "#A5B4FC" : "#94A3B8", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setFormStep(1)} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                      <button
                        onClick={() => formData.request && setFormStep(3)}
                        style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: formData.request ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "rgba(255,255,255,0.05)", color: formData.request ? "white" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Priority + Submit */}
                {formStep === 3 && (
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 4 }}>How critical is this?</div>
                    <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Last step — then you're done!</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setFormData({ ...formData, priority: p.id })}
                          style={{
                            padding: "16px 20px", borderRadius: 12, border: `1px solid ${formData.priority === p.id ? p.color : "rgba(255,255,255,0.06)"}`,
                            background: formData.priority === p.id ? `${p.color}15` : "rgba(255,255,255,0.02)",
                            cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#E2E8F0",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: formData.priority === p.id ? p.color : "#E2E8F0" }}>{p.label}</div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{p.desc}</div>
                          </div>
                          {formData.priority === p.id && <Check size={18} color={p.color} />}
                        </button>
                      ))}
                    </div>

                    {/* Summary */}
                    <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 12, padding: 16, border: "1px solid rgba(99,102,241,0.12)", marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: "#818CF8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Summary</div>
                      <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>
                        <strong>{THEMES.find((t) => t.id === formData.theme)?.icon} {THEMES.find((t) => t.id === formData.theme)?.label}</strong> — {formData.product} — {formData.customer}
                        <br />"{formData.request}"
                        <br /><span style={{ color: "#94A3B8" }}>by {formData.submittedBy}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setFormStep(2)} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                      <button
                        onClick={() => formData.priority && handleSubmit()}
                        style={{ flex: 1, padding: "14px 20px", borderRadius: 10, border: "none", background: formData.priority ? "linear-gradient(135deg, #059669, #10B981)" : "rgba(255,255,255,0.05)", color: formData.priority ? "white" : "#64748B", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      >
                        <Send size={16} /> Submit Feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================== FEED VIEW =================== */}
        {view === "feed" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC" }}>Recent Feedback</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, color: "#64748B" }}>Live updates</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {entries.map((entry) => {
                const theme = THEMES.find((t) => t.id === entry.theme);
                const priority = PRIORITIES.find((p) => p.id === entry.priority);
                return (
                  <div key={entry.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${priority?.color || "#6366F1"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{theme?.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme?.color }}>{theme?.label}</span>
                        <span style={{ fontSize: 11, color: "#64748B" }}>•</span>
                        <span style={{ fontSize: 12, color: "#94A3B8" }}>{entry.product}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{entry.date}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8, lineHeight: 1.5 }}>{entry.request}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 6, color: "#94A3B8" }}>{entry.customer}</span>
                      <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 6, color: "#94A3B8" }}>{entry.segment}</span>
                      <span style={{ fontSize: 11, background: `${priority?.color}20`, padding: "3px 10px", borderRadius: 6, color: priority?.color, fontWeight: 600 }}>{priority?.label}</span>
                      <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>by {entry.submittedBy}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
