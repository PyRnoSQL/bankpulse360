import { useEffect, useState, useRef } from 'react'
import { authHeader } from '@/lib/auth'
import { DataViewer } from '@/components/ui/DataViewer'
import { KPISkeletonGrid, MapSkeleton, TableSkeleton } from '@/components/ui/SkeletonCard'
import { MapPin, Activity, AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react'

function GreetingBar() {
  const user = (() => { try { const t = localStorage.getItem("bp360_token"); if (!t) return null; return JSON.parse(atob(t.split(".")[1])) } catch { return null } })()
  const firstName = (user?.name || "User").split(" ")[0]
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setDate(n.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>Hello</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#34D399" }}>{firstName}!</span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>-</span>
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

function LeafletMap({ branches }: { branches: any[] }) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<any>(null)
  const [ready,   setReady]   = useState(!!(window as any).L)
  const [mapLoading, setMapLoading] = useState(true)

  useEffect(() => {
    if ((window as any).L) { setReady(true); setMapLoading(false); return }
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(css)
    const s = document.createElement("script")
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    s.onload  = () => { setReady(true); setMapLoading(false) }
    s.onerror = () => setMapLoading(false)
    document.head.appendChild(s)
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || !branches.length) return
    if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null }
    const L = (window as any).L
    const map = L.map(mapRef.current, { center: [5.5, 12.0], zoom: 6, zoomControl: true })
    instanceRef.current = map
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "CartoDB", subdomains: "abcd", maxZoom: 19
    }).addTo(map)

    const SPC: Record<string,string> = { "In Control": "#34D399", "Watch": "#F59E0B", "Out of Control": "#F87171" }

    branches.filter(b => b.latitude && b.longitude).forEach(b => {
      const col   = SPC[b.SPC_Flag] || "#60A5FA"
      const sigma = Number(b.Sigma_Level || 0)
      const sla   = Number(b.sla_compliance || 0)
      const svc   = Number(b.avg_service_time || 0)
      const atm   = Number(b.atm_uptime || 0)
      const cust  = Number(b.Customers_Served || 0)
      const eff   = Number(b.efficiency_score || 0)
      const rad   = Math.round(8 + sigma * 2.8)
      const glow  = b.SPC_Flag === "Out of Control" ? "0 0 14px 4px " : "0 0 7px 2px "

      const iconHtml = (
        "<div style=\"width:" + (rad*2) + "px;height:" + (rad*2) + "px;border-radius:50%;" +
        "background:" + col + "22;border:2px solid " + col + ";" +
        "box-shadow:" + glow + col + "99;" +
        "display:flex;align-items:center;justify-content:center;\">" +
        "<div style=\"width:" + Math.max(4, rad/2.5) + "px;height:" + Math.max(4, rad/2.5) + "px;" +
        "border-radius:50%;background:" + col + "\"></div></div>"
      )

      const icon = L.divIcon({ className: "", html: iconHtml, iconSize: [rad*2, rad*2], iconAnchor: [rad, rad], popupAnchor: [0, -(rad+4)] })

      const slaCol  = sla >= 80 ? "#16a34a" : sla >= 60 ? "#ea580c" : "#dc2626"
      const atmCol  = atm >= 95 ? "#16a34a" : atm >= 85 ? "#ea580c" : "#dc2626"
      const spcBg   = b.SPC_Flag === "In Control" ? "#f0fdf4" : b.SPC_Flag === "Watch" ? "#fffbeb" : "#fef2f2"
      const spcTxt  = b.SPC_Flag === "In Control" ? "#15803d" : b.SPC_Flag === "Watch" ? "#b45309" : "#b91c1c"

      const popup = (
        "<div style=\"font-family:system-ui,sans-serif;min-width:230px;padding:2px\">" +
        "<div style=\"border-bottom:1px solid #f1f5f9;padding-bottom:8px;margin-bottom:10px\">" +
        "<div style=\"font-size:15px;font-weight:700;color:#0f172a;margin-bottom:3px\">" + b.Branch_Name + "</div>" +
        "<div style=\"font-size:11px;color:#64748b\">" + b.City + " - " + b.Region + "</div></div>" +
        "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:7px\">" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">Operational Eff.</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:" + slaCol + "\">" + sla + "%</div></div>" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">Sigma Level</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:" + col + "\">" + sigma + "</div></div>" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">Customer Wait</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:#0f172a\">" + svc + " min</div></div>" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">ATM Uptime</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:" + atmCol + "\">" + atm + "%</div></div>" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">Customers Today</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:#0f172a\">" + cust + "</div></div>" +
        "<div style=\"background:#f8fafc;border-radius:7px;padding:7px 9px\">" +
        "<div style=\"font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;margin-bottom:3px\">Efficiency Score</div>" +
        "<div style=\"font-size:16px;font-weight:800;color:#0f172a\">" + eff + "</div></div>" +
        "</div>" +
        "<div style=\"margin-top:9px;background:" + spcBg + ";border-radius:7px;padding:6px 10px;display:flex;align-items:center;justify-content:space-between\">" +
        "<span style=\"font-size:10px;color:#64748b\">SPC Status</span>" +
        "<span style=\"font-size:11px;font-weight:700;color:" + spcTxt + "\">" + b.SPC_Flag + "</span></div></div>"
      )

      const marker = L.marker([b.latitude, b.longitude], { icon })
      marker.bindPopup(popup, { maxWidth: 260, minWidth: 240, className: "bp360-popup", closeButton: true })
      marker.on("mouseover", function(this: any) { this.openPopup() })
      marker.addTo(map)
    })

    if (!document.getElementById("bp360-leaflet-style")) {
      const style = document.createElement("style")
      style.id = "bp360-leaflet-style"
      style.textContent = (
        ".bp360-popup .leaflet-popup-content-wrapper{border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.18);padding:0;border:none}" +
        ".bp360-popup .leaflet-popup-content{margin:14px 14px 12px}" +
        ".bp360-popup .leaflet-popup-tip-container{display:none}" +
        ".leaflet-control-attribution{font-size:9px!important}"
      )
      document.head.appendChild(style)
    }

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null } }
  }, [ready, branches])

  return (
    <div style={{ background: "rgba(15,26,40,0.9)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(96,165,250,0.25)" }}>
      <div style={{ padding: "10px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MapPin size={13} color="#60A5FA" />
          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Branch Performance Map - Cameroon</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "rgba(96,165,250,0.12)", color: "#60A5FA", border: "0.5px solid rgba(96,165,250,0.3)" }}>
            {branches.filter(b => b.latitude && b.longitude).length} locations
          </span>
        </div>
        <span style={{ fontSize: 10, color: "#475569" }}>Hover marker for details - dot size = sigma level</span>
      </div>
      <div style={{ position: "relative" }}>
        {mapLoading && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#060F1A", zIndex: 5, gap: 10 }}>
            <span style={{ width: 20, height: 20, border: "2px solid #1D9E75", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 12, color: "#475569" }}>Loading Leaflet + OpenStreetMap...</span>
          </div>
        )}
        <div ref={mapRef} style={{ height: 480, width: "100%", background: "#060F1A" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", flexDirection: "column", gap: 5, background: "rgba(6,15,26,0.92)", borderRadius: 9, padding: "8px 12px", backdropFilter: "blur(10px)", border: "0.5px solid rgba(255,255,255,0.08)", zIndex: 1000 }}>
          {[["#34D399","In Control"],["#F59E0B","Watch"],["#F87171","Out of Control"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10, color: "#94A3B8" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", boxShadow: "0 0 5px " + c + "99" }} />{l}
            </div>
          ))}
          <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", marginTop: 3, paddingTop: 5, fontSize: 9, color: "#334155" }}>Circle size = sigma level</div>
        </div>
      </div>
    </div>
  )
}

const sigmaColor = (s: number) => s >= 4 ? "#34D399" : s >= 3 ? "#60A5FA" : s >= 2.5 ? "#F59E0B" : "#F87171"
const SPC_COLOR: Record<string,string> = { "In Control": "#34D399", "Watch": "#F59E0B", "Out of Control": "#F87171" }

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [flagged,  setFlagged]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch("/api/branches/performance", { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/branches/flagged",     { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([b, f]) => {
      setBranches(Array.isArray(b) ? b : [])
      setFlagged(Array.isArray(f) ? f : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const n        = branches.length || 1
  const avgSigma = (branches.reduce((s: number, b: any) => s + Number(b.Sigma_Level || 0), 0) / n).toFixed(2)
  const avgSla   = (branches.reduce((s: number, b: any) => s + Number(b.sla_compliance || 0), 0) / n).toFixed(1)
  const avgSvc   = (branches.reduce((s: number, b: any) => s + Number(b.avg_service_time || 0), 0) / n).toFixed(1)
  const ooc      = branches.filter((b: any) => b.SPC_Flag === "Out of Control").length
  const totalCust= branches.reduce((s: number, b: any) => s + Number(b.Customers_Served || 0), 0)

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)", margin: -24, padding: "20px 24px 24px" }}>
      <GreetingBar />
      {loading && (
        <div><KPISkeletonGrid count={6} /><MapSkeleton /><TableSkeleton rows={5} /></div>
      )}
      {!loading && (
        <>
          <Section title="Network Summary" color="#34D399">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {[
                { icon: <MapPin size={15}/>,         label: "Total Branches",     value: String(branches.length || "--"), sub: "across all regions",   accent: "#60A5FA" },
                { icon: <Activity size={15}/>,       label: "Avg Sigma Level",    value: avgSigma + "σ",                  sub: "DMAIC process quality", accent: "#34D399" },
                { icon: <TrendingUp size={15}/>,     label: "Avg SLA Compliance", value: avgSla + "%",                    sub: "service level target",  accent: "#60A5FA" },
                { icon: <Clock size={15}/>,          label: "Avg Service Time",   value: avgSvc + " min",                 sub: "per transaction",       accent: "#F59E0B" },
                { icon: <AlertTriangle size={15}/>,  label: "Out-of-Control",     value: String(ooc),                     sub: "need intervention",     accent: "#F87171" },
                { icon: <Users size={15}/>,          label: "Customers Served",   value: String(totalCust),               sub: "total today",           accent: "#818CF8" },
              ].map(k => (
                <div key={k.label} style={{ background: "rgba(15,26,40,0.85)", border: "1px solid " + k.accent + "28", borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: k.accent, opacity: 0.07, filter: "blur(20px)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k.label}</span>
                    <span style={{ color: k.accent, opacity: 0.8 }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em", marginBottom: 4 }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Branch Performance Map - Cameroon" color="#60A5FA">
            <LeafletMap branches={branches} />
          </Section>

          {branches.length > 0 && (
            <Section title="Branch League Table — Full Performance Data" color="#60A5FA">
            <div style={{ background:"rgba(15,26,40,0.92)", border:"1px solid rgba(96,165,250,0.22)", borderRadius:14, overflow:"hidden" }}>

              {/* Metadata bar */}
              <div style={{ padding:"10px 16px", borderBottom:"0.5px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"#94A3B8" }}>Sheet: <strong style={{ color:"#F1F5F9" }}>BP360_M4_Branch_Operations</strong></span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>20 rows</span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>35 columns</span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>KPIs: service time, sigma level, teller productivity, loan TAT, SPC flags</span>
                <button
                  onClick={() => {
                    const headers = ["Branch_ID","Branch_Name","Region","City","Branch_Tier","Date","Tellers_Scheduled","Tellers_Present","Customers_Served","Total_Txns","Manual_Txns","Digital_Txns","avg_service_time","p90_service_time","Max_Queue_Length","Avg_Wait_Time__min_","Queue_Abandonment","teller_utilisation","teller_error_rate","Rework_Count","sla_compliance","Loan_Apps_Received","Loan_Apps_Decided_Same_Day","loan_tat","Loan_Rework_Rate____","atm_uptime","Overtime_Hours","Absenteeism____","Sigma_Level","SPC_Flag","efficiency_score","digital_txn_pct","same_day_decision_rate","latitude","longitude"]
                    const csv = [headers.join(","), ...branches.map(r => headers.map(h => { const v = (r as any)[h]; return String(v ?? "").includes(",") ? '"'+v+'"' : String(v ?? "") }).join(","))].join("\n")
                    navigator.clipboard.writeText(csv)
                  }}
                  style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#94A3B8", cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"inherit" }}>
                  Copy CSV
                </button>
              </div>

              {/* Scrollable table */}
              <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:480 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:3800 }}>
                  <thead>
                    <tr>
                      {([
                        {label:"BRANCH ID",             w:110},
                        {label:"BRANCH NAME",           w:150},
                        {label:"REGION",                w:130},
                        {label:"CITY",                  w:110},
                        {label:"BRANCH TIER",           w:110},
                        {label:"DATE",                  w:110},
                        {label:"TELLERS SCHEDULED",     w:150},
                        {label:"TELLERS PRESENT",       w:140},
                        {label:"CUSTOMERS SERVED",      w:150},
                        {label:"TOTAL TXNS",            w:110},
                        {label:"MANUAL TXNS",           w:120},
                        {label:"DIGITAL TXNS",          w:120},
                        {label:"AVG SVC (MIN)",         w:130},
                        {label:"P90 SVC (MIN)",         w:130},
                        {label:"MAX QUEUE",             w:110},
                        {label:"AVG WAIT (MIN)",        w:130},
                        {label:"QUEUE ABND.",           w:120},
                        {label:"TELLER UTIL %",         w:120},
                        {label:"ERROR RATE %",          w:120},
                        {label:"REWORK COUNT",          w:130},
                        {label:"SLA %",                 w:90},
                        {label:"LOAN APPS",             w:110},
                        {label:"SAME DAY DECISION",     w:160},
                        {label:"LOAN TAT (DAYS)",       w:140},
                        {label:"LOAN REWORK %",         w:130},
                        {label:"ATM UPTIME %",          w:120},
                        {label:"OVERTIME HRS",          w:130},
                        {label:"ABSENTEEISM %",         w:130},
                        {label:"SIGMA",                 w:90},
                        {label:"SPC FLAG",              w:140},
                        {label:"EFF. SCORE",            w:110},
                        {label:"DIGITAL TXN %",         w:130},
                        {label:"SAME DAY RATE %",       w:150},
                        {label:"LATITUDE",              w:100},
                        {label:"LONGITUDE",             w:100},
                      ] as {label:string;w:number}[]).map(h => (
                        <th key={h.label} style={{
                          padding:"11px 14px",
                          textAlign:"left",
                          fontSize:10,
                          fontWeight:700,
                          color:"#64748B",
                          letterSpacing:"0.08em",
                          borderBottom:"1px solid rgba(255,255,255,0.1)",
                          whiteSpace:"nowrap",
                          minWidth:h.w,
                          position:"sticky",
                          top:0,
                          background:"rgba(10,18,32,0.99)",
                          zIndex:2,
                        }}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {branches.map((b: any, i: number) => {
                      const sc = (v: number, g: number, w: number) => v >= g ? "#34D399" : v >= w ? "#F59E0B" : "#F87171"
                      const tc = {"In Control":"#34D399","Watch":"#F59E0B","Out of Control":"#F87171"}
                      const bc = b.Branch_Tier==="Premium"?"#818CF8":b.Branch_Tier==="Flagship"?"#F59E0B":b.Branch_Tier==="Urban"?"#60A5FA":b.Branch_Tier==="Standard"?"#34D399":"#64748B"
                      const spcCol = (tc as any)[b.SPC_Flag] || "#64748B"
                      const sigCol = Number(b.Sigma_Level)>=4?"#34D399":Number(b.Sigma_Level)>=3?"#60A5FA":Number(b.Sigma_Level)>=2.5?"#F59E0B":"#F87171"
                      return (
                        <tr key={i}
                          style={{ borderBottom:"0.5px solid rgba(255,255,255,0.04)", transition:"background 0.12s" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="rgba(96,165,250,0.05)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:10, color:"#64748B" }}>{b.Branch_ID}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, color:"#F1F5F9", fontWeight:600 }}>{b.Branch_Name}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{b.Region}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{b.City}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}>
                            <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:bc+"18", color:bc }}>{b.Branch_Tier}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{b.Date}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, color:"#E2E8F0", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Tellers_Scheduled}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, fontVariantNumeric:"tabular-nums", textAlign:"right", color:b.Tellers_Present>=b.Tellers_Scheduled?"#34D399":"#F59E0B", fontWeight:600 }}>{b.Tellers_Present}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, color:"#F1F5F9", fontVariantNumeric:"tabular-nums", fontWeight:600, textAlign:"right" }}>{b.Customers_Served}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Total_Txns}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Manual_Txns}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#60A5FA", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Digital_Txns}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:sc(Number(b.avg_service_time),0,8), fontVariantNumeric:"tabular-nums" }}>{b.avg_service_time}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.p90_service_time}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Max_Queue_Length}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Avg_Wait_Time__min_}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:sc(0,5,Number(b.Queue_Abandonment)), fontVariantNumeric:"tabular-nums" }}>{b.Queue_Abandonment}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:sc(Number(b.teller_utilisation),85,70), fontVariantNumeric:"tabular-nums" }}>{b.teller_utilisation}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:Number(b.teller_error_rate)<=1?"#34D399":Number(b.teller_error_rate)<=3?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{b.teller_error_rate}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:Number(b.Rework_Count)<=2?"#34D399":Number(b.Rework_Count)<=5?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Rework_Count}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:700, color:sc(Number(b.sla_compliance),90,75), fontVariantNumeric:"tabular-nums" }}>{b.sla_compliance}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Loan_Apps_Received}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#60A5FA", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Loan_Apps_Decided_Same_Day}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:Number(b.loan_tat)<=3?"#34D399":Number(b.loan_tat)<=5?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{b.loan_tat}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ color:Number(b.Loan_Rework_Rate____)<=5?"#34D399":Number(b.Loan_Rework_Rate____)<=10?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{b.Loan_Rework_Rate____}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:700, color:sc(Number(b.atm_uptime),98,92), fontVariantNumeric:"tabular-nums" }}>{b.atm_uptime}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:Number(b.Overtime_Hours)<=4?"#64748B":"#F59E0B", fontVariantNumeric:"tabular-nums", textAlign:"right" }}>{b.Overtime_Hours}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ color:Number(b.Absenteeism____)<=3?"#34D399":Number(b.Absenteeism____)<=8?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{b.Absenteeism____}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}>
                            <span style={{ fontSize:13, fontWeight:700, color:sigCol }}>{b.Sigma_Level}σ</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}>
                            <span style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontWeight:600, background:spcCol+"15", color:spcCol, border:"0.5px solid "+spcCol+"40" }}>{b.SPC_Flag}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:700, color:sc(Number(b.efficiency_score),80,65), fontVariantNumeric:"tabular-nums" }}>{b.efficiency_score}</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:sc(Number(b.digital_txn_pct),60,40), fontVariantNumeric:"tabular-nums" }}>{b.digital_txn_pct}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}>
                            <span style={{ fontWeight:600, color:sc(Number(b.same_day_decision_rate),80,60), fontVariantNumeric:"tabular-nums" }}>{b.same_day_decision_rate}%</span>
                          </td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:10, color:"#334155", fontVariantNumeric:"tabular-nums", fontFamily:"monospace" }}>{b.latitude}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:10, color:"#334155", fontVariantNumeric:"tabular-nums", fontFamily:"monospace" }}>{b.longitude}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ padding:"7px 16px", borderTop:"0.5px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#334155" }}>Scroll horizontally to see all 35 columns · Scroll vertically for all 20 rows · Green/Amber/Red = performance threshold</span>
                <span style={{ fontSize:10, color:"#1e3a5f" }}>BankPulse 360° · BigQuery Live</span>
              </div>
            </div>
          </Section>
          )}

          {flagged.length > 0 && (
            <Section title="Branches Requiring Intervention" color="#F87171">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
                {flagged.map((b: any, i: number) => (
                  <div key={i} style={{ background: "rgba(15,26,40,0.85)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 2 }}>{b.Branch_Name}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>{b.City} - {b.Region}</div>
                      </div>
                      <span style={{ padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 600, background: "rgba(248,113,113,0.12)", color: "#F87171", border: "0.5px solid rgba(248,113,113,0.3)" }}>{b.SPC_Flag}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: sigmaColor(Number(b.Sigma_Level)) }}>{b.Sigma_Level}σ</span>
                      <span style={{ fontSize: 11, color: "#64748B" }}>SLA: {b.sla_compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: "@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
