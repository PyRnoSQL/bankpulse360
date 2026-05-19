import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'
import { Users, TrendingDown, AlertTriangle, Activity, Gift, Smartphone } from 'lucide-react'
import { KPISkeletonGrid, TableSkeleton } from '@/components/ui/SkeletonCard'
import { DataViewer } from '@/components/ui/DataViewer'

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

/* ── RFM formatter — BigQuery returns as date string e.g. "0005-05-04" ── */
function formatRFM(raw: any): string {
  if (!raw) return "--"
  const s = String(raw)
  /* If it looks like a date "0005-05-04" extract the numbers */
  const dateMatch = s.match(/^(\d+)-(\d+)-(\d+)$/)
  if (dateMatch) {
    const r = parseInt(dateMatch[1], 10)
    const f = parseInt(dateMatch[2], 10)
    const m = parseInt(dateMatch[3], 10)
    return r + "-" + f + "-" + m
  }
  return s
}

function fcfa(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M"
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + "K"
  return String(v)
}

const SEG_COLOR: Record<string,string> = {
  Premium:      "#818CF8",
  "At-Risk":    "#F87171",
  Dormant:      "#475569",
  "Mass Market":"#60A5FA",
}

export default function CustomersPage() {
  const [churn,   setChurn]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    fetch("/api/customers/churn-risk", { headers: h })
      .then(r => r.json())
      .then(d => { setChurn(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalChurn  = churn.length
  const avgChurn    = churn.length ? (churn.reduce((s,c) => s + Number(c.Churn_Prob____ || 0), 0) / churn.length).toFixed(1) : "0"
  const dormant     = churn.filter(c => c.Segment === "Dormant").length
  const noMobile    = churn.filter(c => !c.Mobile_Banking).length
  const highCLV     = churn.filter(c => Number(c.CLV_Score__FCFA_ || 0) > 5_000_000).length
  const offerPend   = churn.filter(c => c.Offer_Sent && !c.Offer_Accepted).length

  const COLS = [
    { key: "Customer_ID",          label: "Customer ID",      w: 110 },
    { key: "Full_Name",            label: "Full Name",        w: 150 },
    { key: "Region",               label: "Region",           w: 130 },
    { key: "City",                 label: "City",             w: 110 },
    { key: "Neighbourhood",        label: "Neighbourhood",    w: 130 },
    { key: "Segment",              label: "Segment",          w: 110 },
    { key: "Age",                  label: "Age",              w: 60  },
    { key: "Gender",               label: "Gender",           w: 70  },
    { key: "Occupation",           label: "Occupation",       w: 150 },
    { key: "Income_Tier",          label: "Income Tier",      w: 100 },
    { key: "Account_Open_Date",    label: "Account Since",    w: 120 },
    { key: "Account_Types",        label: "Account Types",    w: 200 },
    { key: "Avg_Monthly_Bal__FCFA_",label:"Avg Bal (FCFA)",   w: 130 },
    { key: "Products_Held",        label: "Products",         w: 90  },
    { key: "Mobile_Banking",       label: "Mobile",           w: 80  },
    { key: "App_Logins_30d",       label: "App Logins 30d",  w: 120 },
    { key: "ATM_Txns_30d",         label: "ATM Txns 30d",    w: 110 },
    { key: "Branch_Visits_30d",    label: "Branch Visits",    w: 120 },
    { key: "Call_Centre_30d",      label: "Call Centre 30d",  w: 130 },
    { key: "Omni_Channel_Score",   label: "Omni Score",       w: 110 },
    { key: "Days_Since_Last_Txn",  label: "Days Inactive",    w: 120 },
    { key: "Churn_Prob____",       label: "Churn Prob %",     w: 110 },
    { key: "CLV_Score__FCFA_",     label: "CLV (FCFA)",       w: 120 },
    { key: "NPS_Score",            label: "NPS",              w: 70  },
    { key: "RFM_Score",            label: "RFM Score",        w: 100 },
    { key: "Recommended_Product",  label: "Recommendation",   w: 170 },
    { key: "Offer_Sent",           label: "Offer Sent",       w: 100 },
    { key: "Offer_Accepted",       label: "Offer Accepted",   w: 120 },
    { key: "churn_risk_band",      label: "Churn Band",       w: 110 },
    { key: "digital_profile",      label: "Digital Profile",  w: 130 },
    { key: "clv_millions",         label: "CLV (M FCFA)",     w: 110 },
  ]

  function renderCell(col: typeof COLS[0], row: any) {
    const v = row[col.key]
    if (col.key === "Churn_Prob____") {
      const n = Number(v || 0)
      const c = n >= 70 ? "#F87171" : n >= 50 ? "#F59E0B" : "#34D399"
      return <span style={{ color: c, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{n}%</span>
    }
    if (col.key === "Segment") {
      const c = SEG_COLOR[v] || "#64748B"
      return <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: c + "18", color: c, border: "0.5px solid " + c + "40", whiteSpace: "nowrap" }}>{v}</span>
    }
    if (col.key === "Mobile_Banking" || col.key === "Offer_Sent" || col.key === "Offer_Accepted") {
      return <span style={{ color: v ? "#34D399" : "#F87171", fontWeight: 600 }}>{v ? "Yes" : "No"}</span>
    }
    if (col.key === "CLV_Score__FCFA_" || col.key === "Avg_Monthly_Bal__FCFA_") {
      return <span style={{ fontVariantNumeric: "tabular-nums", color: "#E2E8F0" }}>{fcfa(Number(v || 0))}</span>
    }
    if (col.key === "RFM_Score") return <span style={{ fontFamily: "monospace", color: "#818CF8", fontWeight: 600 }}>{formatRFM(v)}</span>
    if (col.key === "NPS_Score") {
      const n = Number(v || 0)
      return <span style={{ color: n >= 8 ? "#34D399" : n >= 6 ? "#F59E0B" : "#F87171", fontWeight: 600 }}>{n}</span>
    }
    if (col.key === "Recommended_Product") return <span style={{ color: "#60A5FA", fontSize: 11 }}>{v}</span>
    if (col.key === "Omni_Channel_Score") return <span style={{ color: "#94A3B8" }}>{Number(v || 0).toFixed(1)}</span>
    if (col.key === "Days_Since_Last_Txn") {
      const n = Number(v || 0)
      return <span style={{ color: n > 90 ? "#F87171" : n > 30 ? "#F59E0B" : "#34D399", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{n}d</span>
    }
    return <span style={{ color: "#E2E8F0", whiteSpace: "nowrap" }}>{v === null || v === undefined ? "--" : String(v)}</span>
  }

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)", margin: -24, padding: "20px 24px 24px" }}>
      <GreetingBar />
      {loading && <div><KPISkeletonGrid count={6} /><TableSkeleton rows={6} /></div>}
      {!loading && (
        <>
          <Section title="High Churn Risk — Summary" color="#F87171">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12 }}>
              {[
                { icon:<AlertTriangle size={14}/>, label:"At-Risk Accounts",   value:String(totalChurn),     sub:"churn prob >= 50%",    accent:"#F87171" },
                { icon:<Activity size={14}/>,      label:"Avg Churn Prob",     value:avgChurn+"%",           sub:"portfolio average",    accent:"#F59E0B" },
                { icon:<Users size={14}/>,         label:"Dormant Accounts",   value:String(dormant),        sub:"no recent activity",   accent:"#475569" },
                { icon:<Smartphone size={14}/>,    label:"No Mobile Banking",  value:String(noMobile),       sub:"digital gap",          accent:"#60A5FA" },
                { icon:<TrendingDown size={14}/>,  label:"High CLV at Risk",   value:String(highCLV),        sub:"CLV > 5M FCFA",        accent:"#818CF8" },
                { icon:<Gift size={14}/>,          label:"Offers Pending",     value:String(offerPend),      sub:"sent but not accepted",accent:"#34D399" },
              ].map(k => (
                <div key={k.label} style={{ background:"rgba(15,26,40,0.85)", border:"1px solid "+k.accent+"28", borderRadius:14, padding:"14px 16px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-24, right:-24, width:70, height:70, borderRadius:"50%", background:k.accent, opacity:0.07, filter:"blur(16px)" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:10, color:"#94A3B8", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{k.label}</span>
                    <span style={{ color:k.accent, opacity:0.8 }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize:24, fontWeight:700, color:"#F1F5F9", marginBottom:3 }}>{k.value}</div>
                  <div style={{ fontSize:11, color:"#64748B" }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="High Churn Risk Accounts — Full Profile" color="#F87171">
            <DataViewer
              sheetName="BP360_M1_Customer360"
              description="KPIs: churn probability, CLV, NPS, RFM, digital engagement"
              accentColor="#F87171"
              rows={churn}
              columns={COLS.map(col => ({ key: col.key, label: col.label, width: col.w, render: (v, row) => renderCell(col, row) }))}
            />
          </Section>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html:"@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
