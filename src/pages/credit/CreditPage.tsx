import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'
import { KPISkeletonGrid, TableSkeleton } from '@/components/ui/SkeletonCard'
import { AlertTriangle, TrendingDown, TrendingUp, Shield, DollarSign, Activity, ChevronRight } from 'lucide-react'

function GreetingBar() {
  const user = (() => { try { const t = localStorage.getItem("bp360_token"); if (!t) return null; return JSON.parse(atob(t.split(".")[1])) } catch { return null } })()
  const firstName = (user?.name || "User").split(" ")[0]
  const [time, setTime] = useState(""); const [date, setDate] = useState("")
  useEffect(() => { const tick = () => { const n = new Date(); setTime(n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })); setDate(n.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })) }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id) }, [])
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>👋</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#34D399" }}>Hello, {firstName}!</span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>—</span>
        <span style={{ fontSize: 13, color: "#64748B" }}>{date}</span>
      </div>
      <span style={{ fontSize: 13, color: "#64748B", fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em", fontWeight: 500 }}>{time}</span>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: color }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</span>
        <div style={{ flex: 1, height: "0.5px", background: color + "25" }} />
      </div>
      {children}
    </div>
  )
}

/* ── Interest Rate Shock Stress Test ────────────────────── */
function StressTestPanel({ sectors, portfolio }: { sectors: any[]; portfolio: any[] }) {
  const [shock, setShock] = useState(0)

  const baseNpl     = sectors.reduce((s: number, r: any) => s + Number(r.npl_count || 0), 0)
  const totalLoans  = Math.max(sectors.reduce((s: number, r: any) => s + Number(r.loan_count || 1), 0), 1)
  const baseEcl     = sectors.reduce((s: number, r: any) => s + Number(r.total_ecl_millions || 0), 0)
  const totalExp    = sectors.reduce((s: number, r: any) => s + Number(r.total_outstanding_millions || 0), 0)

  const nplMultiplier       = 1 + shock * 0.045
  const liquidityPressure   = shock * 2.8
  const capitalAdequacy     = Math.max(8, 14.5 - shock * 0.42)
  const branchRisk          = Math.min(20, ooc => ooc + Math.floor(shock * 0.25))

  const simNpl      = Math.min((baseNpl * nplMultiplier / totalLoans * 100), 60).toFixed(1)
  const simEcl      = (baseEcl * (1 + shock * 0.07)).toFixed(1)
  const simLiquidity= (100 - liquidityPressure).toFixed(1)
  const simCapital  = capitalAdequacy.toFixed(1)

  const shock20     = shock >= 15
  const warn        = shock >= 8

  const metricColor = (v: number, bad: number, good: number) =>
    v >= bad ? "#F87171" : v >= good ? "#F59E0B" : "#34D399"

  return (
    <div style={{ background: "rgba(15,26,40,0.9)", border: "1px solid " + (shock20 ? "rgba(248,113,113,0.5)" : "rgba(248,113,113,0.2)"), borderRadius: 14, padding: "20px 22px", marginBottom: 28, transition: "border-color 0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: "#F87171" }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Interest rate shock stress-test simulator</span>
        <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", borderRadius: 8, background: shock20 ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.1)", color: "#F87171", border: "0.5px solid rgba(248,113,113,0.4)", fontWeight: 600 }}>
          {shock20 ? "⚠ SEVERE" : warn ? "⚡ MODERATE" : "● BASELINE"}
        </span>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 500 }}>
            Interest Rate Shock: <span style={{ color: shock > 0 ? "#F59E0B" : "#34D399", fontWeight: 700 }}>+{shock}%</span>
          </span>
          <span style={{ fontSize: 11, color: "#475569" }}>0% → +20%</span>
        </div>
        <div style={{ position: "relative" }}>
          <input type="range" min={0} max={20} step={0.5} value={shock}
            onChange={e => setShock(Number(e.target.value))}
            style={{ width: "100%", accentColor: shock20 ? "#F87171" : shock > 5 ? "#F59E0B" : "#1D9E75", height: 4 }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", marginTop: 4 }}>
            <span>Baseline</span><span>+5%</span><span>+10%</span><span>+15%</span><span>Severe +20%</span>
          </div>
        </div>
      </div>

      {/* Impact grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
        {[
          { label: "NPL Ratio", value: simNpl+"%", icon: <TrendingDown size={13}/>, color: metricColor(parseFloat(simNpl), 20, 10), delta: "+" + (parseFloat(simNpl) - baseNpl/totalLoans*100).toFixed(1) + "%" },
          { label: "ECL Provision", value: simEcl+"M FCFA", icon: <DollarSign size={13}/>, color: metricColor(shock, 15, 8), delta: "+" + ((parseFloat(simEcl) - baseEcl)).toFixed(1) + "M" },
          { label: "Liquidity Ratio", value: simLiquidity+"%", icon: <Activity size={13}/>, color: metricColor(100-parseFloat(simLiquidity), 15, 8), delta: "-" + liquidityPressure.toFixed(1) + "%" },
          { label: "Capital Adequacy", value: simCapital+"%", icon: <Shield size={13}/>, color: parseFloat(simCapital) < 10 ? "#F87171" : parseFloat(simCapital) < 12 ? "#F59E0B" : "#34D399", delta: "-" + (14.5 - parseFloat(simCapital)).toFixed(1) + "%" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", border: "1px solid " + k.color + "22", transition: "border-color 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ color: k.color }}>{k.icon}</span>
              <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color, marginBottom: 3, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
            <div style={{ fontSize: 10, color: k.color, opacity: 0.7, fontWeight: 500 }}>{k.delta} from baseline</div>
          </div>
        ))}
      </div>

      {shock20 && (
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 9, background: "rgba(248,113,113,0.08)", border: "0.5px solid rgba(248,113,113,0.3)", color: "#FCA5A5", fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={14} />
          Severe stress scenario — NPL exceeds regulatory threshold. Immediate capital injection and loan restructuring required.
        </div>
      )}
    </div>
  )
}

/* ── XAI Decision Panel ─────────────────────────────────── */
function XAIPanel({ loan, onClose }: { loan: any; onClose: () => void }) {
  const pd       = Number(loan.PD_Score____ || 0)
  const dpd      = Number(loan.Days_Past_Due || 0)
  const stage    = String(loan.IFRS9_Stage || "1")
  const clf      = String(loan.Loan_Classification || "Pass")
  const ews      = String(loan.EWS_Flag || "None")
  const coverage = Number(loan.Coverage_Ratio____ || 100)
  const sector   = String(loan.Sector || "")
  const loanId   = String(loan.Loan_ID || "")

  const decision = clf === "Pass" || clf === "Watch" ? "APPROVE / WATCH" : clf === "Substandard" ? "ESCALATE" : "DECLINE"
  const decColor = decision === "APPROVE / WATCH" ? "#34D399" : decision === "ESCALATE" ? "#F59E0B" : "#F87171"

  const riskScore = pd > 30 ? "HIGH" : pd > 15 ? "MEDIUM" : "LOW"
  const riskColor = riskScore === "HIGH" ? "#F87171" : riskScore === "MEDIUM" ? "#F59E0B" : "#34D399"

  const reasons: { icon: string; text: string; severity: "high"|"medium"|"low" }[] = []
  if (dpd > 60)      reasons.push({ icon: "⚠", text: dpd + " days past due — severe delinquency", severity: "high" })
  else if (dpd > 30) reasons.push({ icon: "⚡", text: dpd + " days past due — payment delay", severity: "medium" })
  else if (dpd === 0) reasons.push({ icon: "✓", text: "No missed payments on record", severity: "low" })
  if (pd > 30)       reasons.push({ icon: "⚠", text: "PD score " + pd + "% — above 30% critical threshold", severity: "high" })
  else if (pd > 15)  reasons.push({ icon: "⚡", text: "PD score " + pd + "% — elevated default risk", severity: "medium" })
  else               reasons.push({ icon: "✓", text: "PD score " + pd + "% — within acceptable range", severity: "low" })
  if (coverage < 50) reasons.push({ icon: "⚠", text: "Collateral coverage only " + coverage + "% — severely undercollateralised", severity: "high" })
  else if (coverage < 75) reasons.push({ icon: "⚡", text: "Collateral coverage " + coverage + "% — below 80% benchmark", severity: "medium" })
  else               reasons.push({ icon: "✓", text: "Collateral coverage " + coverage + "% — adequately secured", severity: "low" })
  if (stage === "3") reasons.push({ icon: "⚠", text: "IFRS 9 Stage 3 — credit-impaired loan", severity: "high" })
  else if (stage === "2") reasons.push({ icon: "⚡", text: "IFRS 9 Stage 2 — significant credit risk increase", severity: "medium" })
  else               reasons.push({ icon: "✓", text: "IFRS 9 Stage 1 — performing loan", severity: "low" })
  if (["Agriculture","Livestock"].includes(sector)) reasons.push({ icon: "⚡", text: "Sector risk elevated — " + sector + " faces seasonal drought exposure", severity: "medium" })
  if (ews === "Critical") reasons.push({ icon: "⚠", text: "EWS Critical flag — mobile money inflow dropped, revenue decline detected", severity: "high" })
  else if (ews === "High") reasons.push({ icon: "⚡", text: "EWS High flag — regional inflation spike detected in portfolio region", severity: "medium" })

  const radar = [
    { label: "Character",  score: ews === "None" ? 80 : ews === "Low" ? 65 : ews === "Medium" ? 45 : 25 },
    { label: "Capital",    score: Math.max(5, 100 - pd * 2.2) },
    { label: "Capacity",   score: dpd === 0 ? 85 : Math.max(5, 85 - dpd * 0.8) },
    { label: "Collateral", score: Math.min(100, coverage) },
  ]

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0A1628", border: "0.5px solid rgba(255,255,255,0.15)", borderRadius: 18, padding: 24, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 32px 72px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>XAI Credit Decision Explainer</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>{loan.Client_Name}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{loanId} · {sector} · {loan.Loan_Type}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#94A3B8", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Risk + Decision badges */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: riskColor + "12", border: "1px solid " + riskColor + "30" }}>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Risk Score</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: riskColor, letterSpacing: "0.05em" }}>{riskScore}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>PD: {pd}% · DPD: {dpd}d</div>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", borderRadius: 10, background: decColor + "12", border: "1px solid " + decColor + "30" }}>
            <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>Decision</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: decColor }}>{decision}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>Class: {clf} · S{stage} · {ews}</div>
          </div>
        </div>

        {/* WHY FLAGGED */}
        <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Why flagged?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
          {reasons.map((r, i) => {
            const rc = r.severity === "high" ? "#F87171" : r.severity === "medium" ? "#F59E0B" : "#34D399"
            return (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8, background: rc + "08", border: "0.5px solid " + rc + "25", alignItems: "flex-start" }}>
                <span style={{ color: rc, flexShrink: 0, fontSize: 13, marginTop: 1 }}>{r.icon}</span>
                <span style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>{r.text}</span>
                <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 9, padding: "1px 6px", borderRadius: 4, background: rc + "18", color: rc, fontWeight: 600, textTransform: "uppercase" }}>{r.severity}</span>
              </div>
            )
          })}
        </div>

        {/* 4C Radar bars */}
        <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>4C Risk Profile</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9, marginBottom: 16 }}>
          {radar.map(r => {
            const rc = r.score >= 70 ? "#34D399" : r.score >= 40 ? "#F59E0B" : "#F87171"
            return (
              <div key={r.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: rc, fontVariantNumeric: "tabular-nums" }}>{r.score}/100</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: r.score + "%", borderRadius: 3, background: rc, transition: "width 0.8s ease" }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recommended action */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(29,158,117,0.08)", border: "0.5px solid rgba(29,158,117,0.25)" }}>
          <div style={{ fontSize: 10, color: "#34D399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Recommended action</div>
          <div style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.6 }}>
            {decision === "DECLINE" ? "Reject application. Schedule restructuring meeting. Refer to Special Assets Unit for recovery planning." :
             decision === "ESCALATE" ? "Escalate to Credit Committee. Request updated financial statements. Consider partial collateral liquidation." :
             "Approve with standard monitoring. Schedule 90-day review. Enable EWS alerts for this account."}
          </div>
        </div>
      </div>
    </div>
  )
}

const EWS_COLOR: Record<string, string> = { None: "#34D399", Low: "#60A5FA", Medium: "#F59E0B", High: "#FB923C", Critical: "#F87171" }

export default function CreditPage() {
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [sectors,   setSectors]   = useState<any[]>([])
  const [ews,       setEws]       = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<any>(null)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch("/api/credit/portfolio",     { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/credit/npl-by-sector", { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/credit/ews",           { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([p, s, e]) => {
      setPortfolio(Array.isArray(p) ? p : [])
      setSectors(Array.isArray(s) ? s : [])
      setEws(Array.isArray(e) ? e : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalOut = portfolio.reduce((s: number, r: any) => s + Number(r.total_outstanding_millions||0), 0)
  const totalEcl = portfolio.reduce((s: number, r: any) => s + Number(r.total_ecl_millions||0), 0)
  const nplCount = portfolio.reduce((s: number, r: any) => s + Number(r.npl_count||0), 0)
  const totalLoans= portfolio.reduce((s: number, r: any) => s + Number(r.loan_count||0), 0)
  const avgPd    = portfolio.length ? (portfolio.reduce((s: number, r: any) => s + Number(r.avg_pd_score||0), 0)/portfolio.length).toFixed(1) : "0"
  const nplRatio = totalLoans > 0 ? ((nplCount/totalLoans)*100).toFixed(1) : "0"

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)", margin: -24, padding: "20px 24px 24px" }}>
      <GreetingBar />
      {loading && (
        <div><KPISkeletonGrid count={6} /><TableSkeleton rows={5} /></div>
      )}
      {!loading && (
        <>
          {sectors.length > 0 && <StressTestPanel sectors={sectors} portfolio={portfolio} />}

          <Section title="Portfolio Summary" color="#F87171">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12 }}>
              {[
                { icon:<Activity size={14}/>,      label:"Total Loans",       value:String(totalLoans||"--"),         sub:"active accounts",       accent:"#60A5FA" },
                { icon:<DollarSign size={14}/>,    label:"Outstanding (FCFA)", value:totalOut.toFixed(0)+"M",          sub:"total exposure",         accent:"#818CF8" },
                { icon:<AlertTriangle size={14}/>, label:"NPL Ratio",         value:nplRatio+"%",                     sub:"non-performing loans",  accent:"#F87171" },
                { icon:<Shield size={14}/>,        label:"ECL Provision",     value:totalEcl.toFixed(1)+"M",          sub:"expected credit loss",  accent:"#F59E0B" },
                { icon:<TrendingDown size={14}/>,  label:"Avg PD Score",      value:avgPd+"%",                        sub:"probability of default",accent:"#FB923C" },
                { icon:<AlertTriangle size={14}/>, label:"EWS Alerts",        value:String(ews.length||0),            sub:"high / critical flags", accent:"#F87171" },
              ].map(k => (
                <div key={k.label} style={{ background:"rgba(15,26,40,0.85)", border:"1px solid "+k.accent+"28", borderRadius:14, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-30, right:-30, width:80, height:80, borderRadius:"50%", background:k.accent, opacity:0.07, filter:"blur(20px)" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:10, color:"#94A3B8", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{k.label}</span>
                    <span style={{ color:k.accent, opacity:0.8 }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize:26, fontWeight:700, color:"#F1F5F9", letterSpacing:"-0.02em", marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"#64748B" }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          {sectors.length > 0 && (
            <Section title="NPL by Sector" color="#F59E0B">
              <div style={{ background:"rgba(15,26,40,0.85)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:14, overflow:"hidden" }}>
                {sectors.map((s: any, i: number) => (
                  <div key={i} style={{ padding:"12px 16px", borderBottom:"0.5px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:12, color:"#E2E8F0", fontWeight:500, width:130, flexShrink:0 }}>{s.Sector}</span>
                    <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3 }}>
                      <div style={{ height:"100%", width:Math.min(Number(s.npl_ratio||0),100)+"%", background:Number(s.npl_ratio)>25?"#F87171":Number(s.npl_ratio)>10?"#F59E0B":"#34D399", borderRadius:3, transition:"width 0.8s ease" }} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, width:50, textAlign:"right", color:Number(s.npl_ratio)>25?"#F87171":Number(s.npl_ratio)>10?"#F59E0B":"#34D399", fontVariantNumeric:"tabular-nums" }}>{s.npl_ratio}%</span>
                    <span style={{ fontSize:11, color:"#475569", width:80, textAlign:"right" }}>{s.total_m}M</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {ews.length > 0 && (
            <Section title="Early Warning System — Click any loan to open XAI decision panel" color="#F87171">
              <div style={{ background:"rgba(15,26,40,0.85)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:14, overflow:"hidden" }}>
                <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:420 }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11, minWidth:1100 }}>
                    <thead>
                      <tr style={{ background:"rgba(15,26,40,0.98)" }}>
                        {[
                          {label:"Loan ID",       w:120},
                          {label:"Client",        w:150},
                          {label:"Region",        w:120},
                          {label:"City",          w:100},
                          {label:"Sector",        w:110},
                          {label:"Loan Type",     w:110},
                          {label:"Outstanding",   w:120},
                          {label:"DPD",           w:70},
                          {label:"PD %",          w:70},
                          {label:"Stage",         w:70},
                          {label:"Coverage %",    w:100},
                          {label:"Classification",w:120},
                          {label:"EWS Flag",      w:90},
                          {label:"Rel. Manager",  w:140},
                          {label:"Branch",        w:140},
                        ].map(h => (
                          <th key={h.label} style={{ padding:"10px 12px", textAlign:"left", fontSize:10, color:"#64748B", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", borderBottom:"1px solid rgba(255,255,255,0.1)", whiteSpace:"nowrap", minWidth:h.w, position:"sticky", top:0, background:"rgba(15,26,40,0.98)", zIndex:2 }}>
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ews.map((r: any, i: number) => (
                        <tr key={i} onClick={() => setSelected(r)} style={{ borderBottom:"0.5px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"background 0.15s" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="rgba(29,158,117,0.06)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ fontSize:11, color:"#60A5FA", fontFamily:"monospace" }}>{r.Loan_ID}</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <div style={{ fontSize:12, color:"#34D399", fontWeight:600 }}>{r.Client_Name}</div>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Region}</td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.City}</td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0" }}>{r.Sector}</td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Loan_Type}</td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0", fontVariantNumeric:"tabular-nums" }}>
                            {(Number(r.Outstanding_Bal__FCFA_||0)/1000000).toFixed(1)}M
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ fontWeight:700, color:Number(r.Days_Past_Due)>60?"#F87171":Number(r.Days_Past_Due)>30?"#F59E0B":"#94A3B8", fontVariantNumeric:"tabular-nums" }}>{r.Days_Past_Due}d</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ fontWeight:700, color:Number(r.PD_Score____)>30?"#F87171":Number(r.PD_Score____)>15?"#F59E0B":"#34D399", fontVariantNumeric:"tabular-nums" }}>{r.PD_Score____}%</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:700, background:r.IFRS9_Stage==="3"?"rgba(248,113,113,0.15)":r.IFRS9_Stage==="2"?"rgba(245,158,11,0.15)":"rgba(52,211,153,0.12)", color:r.IFRS9_Stage==="3"?"#F87171":r.IFRS9_Stage==="2"?"#F59E0B":"#34D399" }}>S{r.IFRS9_Stage}</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ fontWeight:600, color:Number(r.Coverage_Ratio____)>=80?"#34D399":Number(r.Coverage_Ratio____)>=60?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{r.Coverage_Ratio____}%</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:r.Loan_Classification==="Loss"?"rgba(248,113,113,0.15)":r.Loan_Classification==="Doubtful"?"rgba(251,146,60,0.15)":r.Loan_Classification==="Substandard"?"rgba(245,158,11,0.15)":"rgba(52,211,153,0.12)", color:r.Loan_Classification==="Loss"?"#F87171":r.Loan_Classification==="Doubtful"?"#FB923C":r.Loan_Classification==="Substandard"?"#F59E0B":"#34D399" }}>{r.Loan_Classification}</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                            <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:(EWS_COLOR[r.EWS_Flag]||"#64748B")+"15", color:EWS_COLOR[r.EWS_Flag]||"#64748B", border:"0.5px solid "+(EWS_COLOR[r.EWS_Flag]||"#64748B")+"40" }}>{r.EWS_Flag}</span>
                          </td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Relationship_Manager}</td>
                          <td style={{ padding:"9px 12px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.Branch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding:"8px 14px", borderTop:"0.5px solid rgba(255,255,255,0.06)", fontSize:10, color:"#334155" }}>
                  {ews.length} alerts · Scroll to see all columns · Click any row to open XAI decision panel
                </div>
              </div>
            </Section>
          )}
        </>
      )}
      {selected && <XAIPanel loan={selected} onClose={() => setSelected(null)} />}
      <style dangerouslySetInnerHTML={{ __html:"@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
