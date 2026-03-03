"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

var THEMES = [
  { id: "training", label: "Product Training", icon: "\ud83d\udcda", color: "#4F46E5" },
  { id: "feature", label: "Feature Request", icon: "\u2728", color: "#7C3AED" },
  { id: "enablement", label: "Enablement Gap", icon: "\ud83d\udd27", color: "#2563EB" },
  { id: "docs", label: "Documentation", icon: "\ud83d\udcc4", color: "#0891B2" },
  { id: "onboarding", label: "Onboarding", icon: "\ud83d\ude80", color: "#059669" },
  { id: "adoption", label: "Adoption Blocker", icon: "\ud83d\udea7", color: "#DC2626" },
  { id: "support", label: "Support Process", icon: "\ud83c\udfa7", color: "#D97706" },
  { id: "integration", label: "Integration", icon: "\ud83d\udd17", color: "#7C3AED" }
];

var PRODUCTS = ["ITSM", "ITOM", "HRSD", "CSM", "Employee Center Pro", "Creator", "Security Ops", "Other"];
var SEGMENTS = ["Commercial", "Enterprise", "Strategic", "Federal"];
var PRIORITIES = [
  { id: "high", label: "High", desc: "Blocks adoption/renewal", color: "#DC2626" },
  { id: "medium", label: "Medium", desc: "Impacts experience", color: "#D97706" },
  { id: "low", label: "Low", desc: "Nice-to-have", color: "#059669" }
];

var SAMPLE_ENTRIES = [
  { id: 1, date: "2026-03-01", submittedBy: "Marie", customer: "Farmoquimica SA", segment: "Commercial", theme: "training", product: "ITSM", priority: "high", request: "Customer needs more training on ITSM SOW functionality", frequency: "recurring" },
  { id: 2, date: "2026-03-01", submittedBy: "Joao Corona", customer: "ZUP", segment: "Enterprise", theme: "feature", product: "Employee Center Pro", priority: "medium", request: "Better dashboard customization options needed", frequency: "first" },
  { id: 3, date: "2026-02-28", submittedBy: "Leticia", customer: "F1RST Tecnologia", segment: "Commercial", theme: "enablement", product: "ITOM", priority: "high", request: "Lack of Spanish-language documentation for ITOM setup", frequency: "recurring" },
  { id: 4, date: "2026-02-27", submittedBy: "Marcus Guerra", customer: "Honeywell Chile SA", segment: "Enterprise", theme: "adoption", product: "HRSD", priority: "high", request: "Low user adoption due to lack of executive sponsorship", frequency: "frequent" },
  { id: 5, date: "2026-02-26", submittedBy: "Marie", customer: "Farmoquimica SA", segment: "Commercial", theme: "docs", product: "ITSM", priority: "medium", request: "Need step-by-step guide for Incident Management configuration", frequency: "recurring" },
  { id: 6, date: "2026-02-25", submittedBy: "Joao Corona", customer: "ZUP", segment: "Enterprise", theme: "training", product: "CSM", priority: "low", request: "Request for advanced CSM workshop for power users", frequency: "first" },
  { id: 7, date: "2026-02-24", submittedBy: "Leticia", customer: "F1RST Tecnologia", segment: "Commercial", theme: "support", product: "ITSM", priority: "medium", request: "Escalation process unclear for critical incidents", frequency: "recurring" },
  { id: 8, date: "2026-02-23", submittedBy: "Marcus Guerra", customer: "Honeywell Chile SA", segment: "Enterprise", theme: "integration", product: "ITOM", priority: "high", request: "Need integration guidance with existing monitoring tools", frequency: "first" }
];

export default function Home() {
  var s1 = useState("dashboard"); var view = s1[0]; var setView = s1[1];
  var s2 = useState(SAMPLE_ENTRIES); var entries = s2[0]; var setEntries = s2[1];
  var s3 = useState(0); var formStep = s3[0]; var setFormStep = s3[1];
  var s4 = useState({ theme: "", product: "", customer: "", segment: "", priority: "", request: "", frequency: "" }); var formData = s4[0]; var setFormData = s4[1];
  var s5 = useState(false); var submitted = s5[0]; var setSubmitted = s5[1];
  var s6 = useState(0); var timer = s6[0]; var setTimer = s6[1];
  var s7 = useState(false); var timerActive = s7[0]; var setTimerActive = s7[1];

  useEffect(function() {
    var interval;
    if (timerActive) { interval = setInterval(function() { setTimer(function(t) { return t + 1; }); }, 1000); }
    return function() { clearInterval(interval); };
  }, [timerActive]);

  function resetForm() {
    setFormStep(0);
    setFormData({ theme: "", product: "", customer: "", segment: "", priority: "", request: "", frequency: "" });
    setSubmitted(false); setTimer(0); setTimerActive(false);
  }

  function handleSubmit() {
    setTimerActive(false);
    setEntries([{ id: entries.length + 1, date: new Date().toISOString().split("T")[0], submittedBy: "You", theme: formData.theme, product: formData.product, customer: formData.customer, segment: formData.segment, priority: formData.priority, request: formData.request, frequency: formData.frequency }].concat(entries));
    setSubmitted(true);
  }

  var themeData = THEMES.map(function(t) { return { name: t.label, count: entries.filter(function(e) { return e.theme === t.id; }).length, color: t.color }; }).filter(function(d) { return d.count > 0; }).sort(function(a, b) { return b.count - a.count; });
  var priorityData = PRIORITIES.map(function(p) { return { name: p.label, value: entries.filter(function(e) { return e.priority === p.id; }).length, color: p.color }; });
  var productData = PRODUCTS.map(function(p) { return { name: p, count: entries.filter(function(e) { return e.product === p; }).length }; }).filter(function(d) { return d.count > 0; }).sort(function(a, b) { return b.count - a.count; });
  var highPriority = entries.filter(function(e) { return e.priority === "high"; }).length;
  var recurring = entries.filter(function(e) { return e.frequency === "recurring" || e.frequency === "frequent"; }).length;
  var contributors = []; entries.forEach(function(e) { if (contributors.indexOf(e.submittedBy) === -1) contributors.push(e.submittedBy); });
  var selectedTheme = THEMES.find(function(t) { return t.id === formData.theme; });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F0B1E 0%, #1A1145 40%, #0D1B2A 100%)", color: "#E2E8F0", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15,11,30,0.9)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "white", fontWeight: 700 }}>F</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC" }}>Feedback Loop</div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>CEG Customer Insights</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4 }}>
            {["dashboard", "submit", "feed"].map(function(tab) {
              var labels = { dashboard: "Dashboard", submit: "Submit Feedback", feed: "Recent" };
              return (<button key={tab} onClick={function() { setView(tab); if (tab === "submit") { resetForm(); setTimerActive(true); } }} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: view === tab ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "transparent", color: view === tab ? "white" : "#94A3B8", fontSize: 13, fontWeight: 600 }}>{labels[tab]}</button>);
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 48px" }}>
        {view === "dashboard" && (<div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[{ l: "Total Feedback", v: entries.length, c: "#6366F1", s: "this month" }, { l: "High Priority", v: highPriority, c: "#DC2626", s: Math.round((highPriority / entries.length) * 100) + "%" }, { l: "Recurring", v: recurring, c: "#D97706", s: "heard 2+ times" }, { l: "Contributors", v: contributors.length, c: "#059669", s: "team members" }].map(function(st, i) {
              return (<div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 12, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 12 }}>{st.l}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: st.c }}>{st.v}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{st.s}</div>
              </div>);
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>Feedback by Theme</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={themeData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#CBD5E1", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ background: "#1E1B4B", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E2E8F0" }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {themeData.map(function(e, i) { return <Cell key={i} fill={e.color} />; })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>By Priority</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart><Pie data={priorityData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {priorityData.map(function(e, i) { return <Cell key={i} fill={e.color} />; })}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
                {priorityData.map(function(p, i) { return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} /><span style={{ color: "#94A3B8" }}>{p.name} ({p.value})</span></div>); })}
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>Top Products</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {productData.map(function(p, i) { return (<div key={i} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22, fontWeight: 800, color: "#818CF8" }}>{p.count}</span><span style={{ fontSize: 13, color: "#CBD5E1" }}>{p.name}</span></div>); })}
            </div>
          </div>
        </div>)}

        {view === "submit" && (<div style={{ maxWidth: 600, margin: "0 auto" }}>
          {!submitted && (<div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", borderRadius: 20, padding: "6px 16px" }}><span style={{ fontSize: 13, fontWeight: 600, color: "#818CF8" }}>{timer}s</span></div></div>)}
          {submitted ? (<div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2705"}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", marginBottom: 8 }}>Feedback Submitted!</div>
            <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 24 }}>Completed in {timer} seconds</div>
            <button onClick={function() { resetForm(); setTimerActive(true); }} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366F1, #7C3AED)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Submit Another</button>
          </div>) : (<div>
            <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
              {[0,1,2,3].map(function(step) { return <div key={step} style={{ flex: 1, height: 4, borderRadius: 2, background: formStep >= step ? "#6366F1" : "rgba(255,255,255,0.06)" }} />; })}
            </div>
            {formStep === 0 && (<div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>What is the feedback about?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {THEMES.map(function(t) { return (<button key={t.id} onClick={function() { setFormData(Object.assign({}, formData, {theme: t.id})); setFormStep(1); }} style={{ padding: 16, borderRadius: 12, border: "1px solid " + (formData.theme === t.id ? t.color : "rgba(255,255,255,0.06)"), background: "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", color: "#E2E8F0" }}><span style={{ fontSize: 20, marginRight: 8 }}>{t.icon}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span></button>); })}
              </div>
            </div>)}
            {formStep === 1 && (<div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>Quick details</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Product / BU</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {PRODUCTS.map(function(p) { return (<button key={p} onClick={function() { setFormData(Object.assign({}, formData, {product: p})); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (formData.product === p ? "#6366F1" : "rgba(255,255,255,0.08)"), background: formData.product === p ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)", color: formData.product === p ? "#A5B4FC" : "#94A3B8", fontSize: 13, cursor: "pointer" }}>{p}</button>); })}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Customer Name</div>
                <input type="text" value={formData.customer} onChange={function(e) { setFormData(Object.assign({}, formData, {customer: e.target.value})); }} placeholder="e.g. Farmoquimica SA" style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Segment</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {SEGMENTS.map(function(s) { return (<button key={s} onClick={function() { setFormData(Object.assign({}, formData, {segment: s})); }} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (formData.segment === s ? "#6366F1" : "rgba(255,255,255,0.08)"), background: formData.segment === s ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)", color: formData.segment === s ? "#A5B4FC" : "#94A3B8", fontSize: 13, cursor: "pointer" }}>{s}</button>); })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={function() { setFormStep(0); }} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                <button onClick={function() { if (formData.product && formData.customer) setFormStep(2); }} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: formData.product && formData.customer ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "rgba(255,255,255,0.05)", color: formData.product && formData.customer ? "white" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next</button>
              </div>
            </div>)}
            {formStep === 2 && (<div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>What did the customer ask for?</div>
              <textarea value={formData.request} onChange={function(e) { setFormData(Object.assign({}, formData, {request: e.target.value})); }} placeholder="One sentence is perfect" rows={3} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#F8FAFC", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <div style={{ marginTop: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>How often?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{id:"first",label:"First time"},{id:"recurring",label:"2-3 times"},{id:"frequent",label:"4+ times"}].map(function(f) { return (<button key={f.id} onClick={function() { setFormData(Object.assign({}, formData, {frequency: f.id})); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid " + (formData.frequency === f.id ? "#6366F1" : "rgba(255,255,255,0.08)"), background: formData.frequency === f.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)", color: formData.frequency === f.id ? "#A5B4FC" : "#94A3B8", fontSize: 13, cursor: "pointer" }}>{f.label}</button>); })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={function() { setFormStep(1); }} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                <button onClick={function() { if (formData.request) setFormStep(3); }} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: formData.request ? "linear-gradient(135deg, #6366F1, #7C3AED)" : "rgba(255,255,255,0.05)", color: formData.request ? "white" : "#64748B", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next</button>
              </div>
            </div>)}
            {formStep === 3 && (<div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>How critical is this?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {PRIORITIES.map(function(p) { return (<button key={p.id} onClick={function() { setFormData(Object.assign({}, formData, {priority: p.id})); }} style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid " + (formData.priority === p.id ? p.color : "rgba(255,255,255,0.06)"), background: formData.priority === p.id ? p.color + "15" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left", color: "#E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 15, fontWeight: 700, color: formData.priority === p.id ? p.color : "#E2E8F0" }}>{p.label}</div><div style={{ fontSize: 12, color: "#64748B" }}>{p.desc}</div></div></button>); })}
              </div>
              <div style={{ background: "rgba(99,102,241,0.06)", borderRadius: 12, padding: 16, border: "1px solid rgba(99,102,241,0.12)", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#818CF8", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Summary</div>
                <div style={{ fontSize: 13, color: "#CBD5E1" }}>{selectedTheme ? selectedTheme.icon + " " + selectedTheme.label : ""} - {formData.product} - {formData.customer}<br />{formData.request}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={function() { setFormStep(2); }} style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#94A3B8", fontSize: 14, cursor: "pointer" }}>Back</button>
                <button onClick={function() { if (formData.priority) handleSubmit(); }} style={{ flex: 1, padding: "14px 20px", borderRadius: 10, border: "none", background: formData.priority ? "linear-gradient(135deg, #059669, #10B981)" : "rgba(255,255,255,0.05)", color: formData.priority ? "white" : "#64748B", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Submit Feedback</button>
              </div>
            </div>)}
          </div>)}
        </div>)}

        {view === "feed" && (<div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>Recent Feedback</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entries.map(function(entry) {
              var theme = THEMES.find(function(t) { return t.id === entry.theme; });
              var priority = PRIORITIES.find(function(p) { return p.id === entry.priority; });
              return (<div key={entry.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid " + (priority ? priority.color : "#6366F1") }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{theme ? theme.icon : ""}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme ? theme.color : "#fff" }}>{theme ? theme.label : ""}</span>
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>{entry.product}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{entry.date}</span>
                </div>
                <div style={{ fontSize: 14, color: "#E2E8F0", marginBottom: 8 }}>{entry.request}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 6, color: "#94A3B8" }}>{entry.customer}</span>
                  <span style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 6, color: "#94A3B8" }}>{entry.segment}</span>
                  <span style={{ fontSize: 11, background: (priority ? priority.color : "#666") + "20", padding: "3px 10px", borderRadius: 6, color: priority ? priority.color : "#fff", fontWeight: 600 }}>{priority ? priority.label : ""}</span>
                  <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>by {entry.submittedBy}</span>
                </div>
              </div>);
            })}
          </div>
        </div>)}
      </div>
    </div>
  );
}
