import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'
import { Users, TrendingDown, AlertTriangle, Activity, Gift, Smartphone } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'
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
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:12 }}>
              <KPICard icon={<AlertTriangle size={14}/>} label="At-Risk Accounts"  value={totalChurn}         suffix=""  decimals={0} sub="churn prob >= 50%"     accent="#F87171" trend="down" trendVal="action needed" alert={totalChurn > 3} />
              <KPICard icon={<Activity size={14}/>}      label="Avg Churn Prob"    value={parseFloat(avgChurn)} suffix="%" decimals={1} sub="portfolio average"     accent="#F59E0B" trend="down" trendVal="high risk" />
              <KPICard icon={<Users size={14}/>}         label="Dormant Accounts"  value={dormant}            suffix=""  decimals={0} sub="no recent activity"    accent="#475569" trend="neutral" />
              <KPICard icon={<Smartphone size={14}/>}    label="No Mobile Banking" value={noMobile}           suffix=""  decimals={0} sub="digital gap"            accent="#60A5FA" trend="neutral" />
              <KPICard icon={<TrendingDown size={14}/>}  label="High CLV at Risk"  value={highCLV}            suffix=""  decimals={0} sub="CLV > 5M FCFA"          accent="#818CF8" trend="down" trendVal="revenue risk" />
              <KPICard icon={<Gift size={14}/>}          label="Offers Pending"    value={offerPend}          suffix=""  decimals={0} sub="sent but not accepted"  accent="#34D399" trend="neutral" />
            </div>
          </Section>

          <Section title="High Churn Risk Accounts — Full Profile" color="#F87171">
            <div style={{ background:"rgba(15,26,40,0.92)", border:"1px solid rgba(248,113,113,0.22)", borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", background:"rgba(10,18,32,0.99)", borderBottom:"0.5px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"#94A3B8" }}>Sheet: <strong style={{ color:"#F1F5F9" }}>BP360_M1_Customer360</strong></span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>{churn.length} rows · 31 columns</span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>KPIs: churn probability, CLV, NPS, RFM, digital engagement</span>
                <button onClick={() => {
                  const keys = ["Customer_ID","Full_Name","Region","City","Neighbourhood","Segment","Age","Gender","Occupation","Income_Tier","Account_Open_Date","Account_Types","Avg_Monthly_Bal__FCFA_","Products_Held","Mobile_Banking","App_Logins_30d","ATM_Txns_30d","Branch_Visits_30d","Call_Centre_30d","Omni_Channel_Score","Days_Since_Last_Txn","Churn_Prob____","CLV_Score__FCFA_","NPS_Score","RFM_Score","Recommended_Product","Offer_Sent","Offer_Accepted","clv_millions","churn_risk_band","digital_profile"]
                  const rows = [keys.join(","), ...churn.map((r:any) => keys.map(k => { const v = String(r[k] ?? ""); return v.includes(",") ? '"'+v+'"' : v }).join(","))]
                  navigator.clipboard.writeText(rows.join("\n"))
                }} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#94A3B8", cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"inherit" }}>
                  ⎘ Copy CSV
                </button>
              </div>
              <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:480 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:3400 }}>
                  <thead>
                    <tr>
                      {([
                        {l:"CUSTOMER ID",w:120},{l:"FULL NAME",w:150},{l:"REGION",w:130},{l:"CITY",w:110},
                        {l:"NEIGHBOURHOOD",w:140},{l:"SEGMENT",w:110},{l:"AGE",w:60},{l:"GENDER",w:75},
                        {l:"OCCUPATION",w:150},{l:"INCOME TIER",w:110},{l:"ACCOUNT SINCE",w:130},
                        {l:"ACCOUNT TYPES",w:200},{l:"AVG BAL (FCFA)",w:130},{l:"PRODUCTS",w:90},
                        {l:"MOBILE",w:80},{l:"APP LOGINS 30D",w:130},{l:"ATM TXNS 30D",w:120},
                        {l:"BRANCH VISITS",w:120},{l:"CALL CENTRE 30D",w:140},{l:"OMNI SCORE",w:110},
                        {l:"DAYS INACTIVE",w:120},{l:"CHURN PROB %",w:120},{l:"CLV (FCFA)",w:120},
                        {l:"NPS",w:70},{l:"RFM SCORE",w:100},{l:"RECOMMENDATION",w:170},
                        {l:"OFFER SENT",w:100},{l:"OFFER ACCEPTED",w:130},{l:"CLV (M FCFA)",w:120},
                        {l:"CHURN BAND",w:120},{l:"DIGITAL PROFILE",w:140},
                      ] as {l:string;w:number}[]).map(h => (
                        <th key={h.l} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", borderBottom:"1px solid rgba(255,255,255,0.1)", whiteSpace:"nowrap", minWidth:h.w, position:"sticky", top:0, background:"rgba(10,18,32,0.99)", zIndex:2 }}>{h.l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {churn.map((r:any, i:number) => {
                      const churnColor = Number(r.Churn_Prob____)>=70?"#F87171":Number(r.Churn_Prob____)>=50?"#F59E0B":"#34D399"
                      const segColor:Record<string,string> = {Premium:"#818CF8","At-Risk":"#F87171",Dormant:"#475569","Mass Market":"#60A5FA"}
                      const sc = segColor[r.Segment]||"#64748B"
                      return (
                        <tr key={i} style={{ borderBottom:"0.5px solid rgba(255,255,255,0.04)", transition:"background 0.12s" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="rgba(248,113,113,0.04)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:10, color:"#64748B" }}>{r.Customer_ID}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, color:"#F1F5F9", fontWeight:600 }}>{r.Full_Name}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Region}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.City}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.Neighbourhood}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:sc+"18", color:sc }}>{r.Segment}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", textAlign:"right" }}>{r.Age}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.Gender}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0" }}>{r.Occupation}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Income_Tier}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{r.Account_Open_Date}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{r.Account_Types}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{Number(r.Avg_Monthly_Bal__FCFA_||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", textAlign:"right" }}>{r.Products_Held}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ color:r.Mobile_Banking?"#34D399":"#F87171", fontWeight:600 }}>{r.Mobile_Banking?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#60A5FA", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{r.App_Logins_30d}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{r.ATM_Txns_30d}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{r.Branch_Visits_30d}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{r.Call_Centre_30d}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:Number(r.Omni_Channel_Score)>=4?"#34D399":Number(r.Omni_Channel_Score)>=2.5?"#F59E0B":"#F87171", textAlign:"right" }}>{r.Omni_Channel_Score}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}><span style={{ fontWeight:600, color:Number(r.Days_Since_Last_Txn)>90?"#F87171":Number(r.Days_Since_Last_Txn)>30?"#F59E0B":"#34D399", fontVariantNumeric:"tabular-nums" }}>{r.Days_Since_Last_Txn}d</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}><span style={{ fontWeight:700, color:churnColor, fontVariantNumeric:"tabular-nums" }}>{r.Churn_Prob____}%</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{Number(r.CLV_Score__FCFA_||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:600, color:Number(r.NPS_Score)>=8?"#34D399":Number(r.NPS_Score)>=6?"#F59E0B":"#F87171" }}>{r.NPS_Score}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", color:"#818CF8", fontWeight:600 }}>{(() => { const s=String(r.RFM_Score||""); const m=s.match(/^(\d+)-(\d+)-(\d+)$/); return m?`${parseInt(m[1])}-${parseInt(m[2])}-${parseInt(m[3])}`:s })()}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#60A5FA" }}>{r.Recommended_Product}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ color:r.Offer_Sent?"#34D399":"#334155", fontWeight:600 }}>{r.Offer_Sent?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ color:r.Offer_Accepted?"#34D399":"#F87171", fontWeight:600 }}>{r.Offer_Accepted?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right", fontWeight:600, color:"#818CF8", fontVariantNumeric:"tabular-nums" }}>{r.clv_millions}M</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:r.churn_risk_band==="Critical"?"rgba(248,113,113,0.15)":r.churn_risk_band==="High"?"rgba(251,146,60,0.15)":r.churn_risk_band==="Medium"?"rgba(245,158,11,0.15)":"rgba(52,211,153,0.12)", color:r.churn_risk_band==="Critical"?"#F87171":r.churn_risk_band==="High"?"#FB923C":r.churn_risk_band==="Medium"?"#F59E0B":"#34D399" }}>{r.churn_risk_band}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:r.digital_profile==="Highly Digital"?"rgba(96,165,250,0.15)":r.digital_profile==="Digital"?"rgba(52,211,153,0.12)":"rgba(100,116,139,0.15)", color:r.digital_profile==="Highly Digital"?"#60A5FA":r.digital_profile==="Digital"?"#34D399":"#64748B" }}>{r.digital_profile}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"7px 16px", background:"rgba(10,18,32,0.99)", borderTop:"0.5px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#334155" }}>Scroll horizontally for all 31 columns · Green/Amber/Red = risk threshold · RFM reformatted from BigQuery date format</span>
                <span style={{ fontSize:10, color:"#1e3a5f" }}>BankPulse 360° · BigQuery Live</span>
              </div>
            </div>
          </Section>
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html:"@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
