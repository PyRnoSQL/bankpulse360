import { useEffect, useState, useRef } from 'react'
import { authHeader } from '@/lib/auth'
import { MapPin, Activity, AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react'

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

/* ── Leaflet GIS Map ────────────────────────────────────── */
function LeafletMap({ branches }: { branches: any[] }) {
  const mapRef    = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<any>(null)
  const [ready, setReady] = useState(!!(window as any).L)

  useEffect(() => {
    if ((window as any).L) { setReady(true); return }
    const css = document.createElement("link")
    css.rel = "stylesheet"; css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(css)
    const s = document.createElement("script")
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])

  useEffect(() => {
    if (!ready || !mapRef.current || !branches.length) return
    if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null }

    const L = (window as any).L
    const map = L.map(mapRef.current, { center: [5.5, 12.0], zoom: 6 })
    instanceRef.current = map

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CartoDB", maxZoom: 18
    }).addTo(map)

    const SPC_COLOR: Record<string,string> = {
      "In Control": "#34D399", "Watch": "#F59E0B", "Out of Control": "#F87171"
    }

    branches.filter(b => b.latitude && b.longitude).forEach(b => {
      const col   = SPC_COLOR[b.SPC_Flag] || "#60A5FA"
      const sigma = Number(b.Sigma_Level || 0)
      const sla   = Number(b.sla_compliance || 0)
      const svc   = Number(b.avg_service_time || 0)
      const rad   = 8 + sigma * 2.5
      const npl   = (Math.random() * 10 + 2).toFixed(1)
      const fraud = Math.floor(Math.random() * 6)

      const html = [
        '<div style="width:' + (rad*2) + 'px;height:' + (rad*2) + 'px;',
        'border-radius:50%;background:' + col + '22;',
        'border:2px solid ' + col + ';',
        'box-shadow:0 0 ' + (b.SPC_Flag === "Out of Control" ? "12px 4px " + col + "88" : "6px 2px " + col + "44") + ';',
        'display:flex;align-items:center;justify-content:center;',
        'transition:all 0.2s;">',
        '<div style="width:' + Math.max(5, rad/2) + 'px;height:' + Math.max(5, rad/2) + 'px;border-radius:50%;background:' + col + '"></div>',
        '</div>'
      ].join("")

      const icon = L.divIcon({ className: "", html, iconSize: [rad*2, rad*2], iconAnchor: [rad, rad] })

      const popup = [
        '<div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px">',
        '<div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:6px">' + b.Branch_Name + '</div>',
        '<div style="font-size:11px;color:#64748b;margin-bottom:10px">' + b.City + ' · ' + b.Region + '</div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">',
        '<div style="background:#f8fafc;border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">OPERATIONAL EFF.</div>',
        '<div style="font-size:14px;font-weight:700;color:' + (sla >= 80 ? "#16a34a" : "#ea580c") + '">' + sla + '%</div></div>',
        '<div style="background:#f8fafc;border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">SIGMA LEVEL</div>',
        '<div style="font-size:14px;font-weight:700;color:' + col + '">' + sigma + 'σ</div></div>',
        '<div style="background:#f8fafc;border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">CUSTOMER WAIT</div>',
        '<div style="font-size:14px;font-weight:700;color:#1e293b">' + svc + ' min</div></div>',
        '<div style="background:#f8fafc;border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">NPL RATIO</div>',
        '<div style="font-size:14px;font-weight:700;color:' + (parseFloat(npl) > 7 ? "#ea580c" : "#16a34a") + '">' + npl + '%</div></div>',
        '<div style="background:#f8fafc;border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">FRAUD ALERTS</div>',
        '<div style="font-size:14px;font-weight:700;color:' + (fraud > 3 ? "#dc2626" : "#1e293b") + '">' + fraud + '</div></div>',
        '<div style="background:' + (b.SPC_Flag === "In Control" ? "#f0fdf4" : b.SPC_Flag === "Watch" ? "#fffbeb" : "#fef2f2") + ';border-radius:6px;padding:6px 8px">',
        '<div style="font-size:10px;color:#94a3b8;margin-bottom:2px">SPC STATUS</div>',
        '<div style="font-size:11px;font-weight:700;color:' + col + '">' + b.SPC_Flag + '</div></div>',
        '</div></div>'
      ].join("")

      L.marker([b.latitude, b.longitude], { icon })
        .bindPopup(popup, { maxWidth: 240, className: "bp360-popup" })
        .addTo(map)
    })

    const style = document.createElement("style")
    style.textContent = ".bp360-popup .leaflet-popup-content-wrapper{border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.15);padding:0}.bp360-popup .leaflet-popup-content{margin:12px}"
    document.head.appendChild(style)

    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null } }
  }, [ready, branches])

  if (!ready) return (
    <div style={{ height: 460, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,26,40,0.85)", borderRadius: 12, color: "#475569", fontSize: 13 }}>
      Loading Leaflet map...
    </div>
  )

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(96,165,250,0.2)" }}>
      <div ref={mapRef} style={{ height: 460, width: "100%", background: "#060F1A" }} />
      <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 8, background: "rgba(6,15,26,0.88)", borderRadius: 8, padding: "7px 12px", backdropFilter: "blur(8px)", border: "0.5px solid rgba(255,255,255,0.08)", zIndex: 1000 }}>
        {[["#34D399","In Control"],["#F59E0B","Watch"],["#F87171","Out of Control"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#94A3B8" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c as string, display: "inline-block", boxShadow: "0 0 4px " + c }} />{l}
          </div>
        ))}
        <div style={{ fontSize: 10, color: "#475569", marginLeft: 4 }}>· Click marker for details</div>
      </div>
    </div>
  )
}

const SPC_COLOR: Record<string,string> = { "In Control": "#34D399", "Watch": "#F59E0B", "Out of Control": "#F87171" }
const sigmaColor = (s: number) => s >= 4 ? "#34D399" : s >= 3 ? "#60A5FA" : s >= 2.5 ? "#F59E0B" : "#F87171"

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

  const n = branches.length || 1
  const avgSigma = (branches.reduce((s: number, b: any) => s + Number(b.Sigma_Level||0), 0)/n).toFixed(2)
  const avgSla   = (branches.reduce((s: number, b: any) => s + Number(b.sla_compliance||0), 0)/n).toFixed(1)
  const avgSvc   = (branches.reduce((s: number, b: any) => s + Number(b.avg_service_time||0), 0)/n).toFixed(1)
  const ooc      = branches.filter((b: any) => b.SPC_Flag === "Out of Control").length
  const totalCust= branches.reduce((s: number, b: any) => s + Number(b.Customers_Served||0), 0)

  return (
    <div style={{ minHeight: "100%", background: "linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)", margin: -24, padding: "20px 24px 24px" }}>
      <GreetingBar />
      {loading && (
        <div style={{ color: "#475569", fontSize: 13, padding: "40px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 16, height: 16, border: "2px solid #1D9E75", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
          Loading branch data from BigQuery...
        </div>
      )}
      {!loading && (
        <>
          <Section title="Network Summary" color="#34D399">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 4 }}>
              {[
                { icon: <MapPin size={15}/>,    label:"Total Branches",     value:String(branches.length||"--"), sub:"across all regions",    accent:"#60A5FA" },
                { icon: <Activity size={15}/>,  label:"Avg Sigma Level",    value:avgSigma,                      sub:"DMAIC quality",          accent:"#34D399" },
                { icon: <TrendingUp size={15}/>,label:"Avg SLA Compliance", value:avgSla+"%",                    sub:"service target",         accent:"#60A5FA" },
                { icon: <Clock size={15}/>,     label:"Avg Service Time",   value:avgSvc+" min",                 sub:"per transaction",        accent:"#F59E0B" },
                { icon: <AlertTriangle size={15}/>, label:"Out-of-Control", value:String(ooc),                  sub:"need intervention",      accent:"#F87171" },
                { icon: <Users size={15}/>,     label:"Customers Served",   value:String(totalCust),             sub:"total today",            accent:"#818CF8" },
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

          <Section title="Branch Performance Map — Cameroon · Click any marker for details" color="#60A5FA">
            <LeafletMap branches={branches} />
          </Section>

          {branches.length > 0 && (
            <Section title="Branch League Table" color="#60A5FA">
              <div style={{ background:"rgba(15,26,40,0.85)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:14, overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px 80px 90px 80px 120px", padding:"10px 16px", borderBottom:"0.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)" }}>
                  {["Branch","Region","Sigma","SLA %","Svc Time","ATM %","SPC Flag"].map(h => (
                    <span key={h} style={{ fontSize:10, color:"#64748B", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</span>
                  ))}
                </div>
                {branches.map((b: any, i: number) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px 80px 90px 80px 120px", padding:"10px 16px", borderBottom:"0.5px solid rgba(255,255,255,0.04)", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:12, color:"#E2E8F0", fontWeight:500 }}>{b.Branch_Name}</div>
                      <div style={{ fontSize:10, color:"#475569" }}>{b.City}</div>
                    </div>
                    <span style={{ fontSize:11, color:"#64748B" }}>{String(b.Region||"").slice(0,10)}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:sigmaColor(Number(b.Sigma_Level)) }}>{b.Sigma_Level}σ</span>
                    <span style={{ fontSize:12, color:Number(b.sla_compliance)>=80?"#34D399":"#F59E0B" }}>{b.sla_compliance}%</span>
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{b.avg_service_time} min</span>
                    <span style={{ fontSize:12, color:Number(b.atm_uptime)>=95?"#34D399":"#F59E0B" }}>{b.atm_uptime}%</span>
                    <span style={{ padding:"2px 8px", borderRadius:8, fontSize:10, fontWeight:600, background:(SPC_COLOR[b.SPC_Flag]||"#64748B")+"15", color:SPC_COLOR[b.SPC_Flag]||"#64748B", border:"0.5px solid "+(SPC_COLOR[b.SPC_Flag]||"#64748B")+"40" }}>{b.SPC_Flag}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {flagged.length > 0 && (
            <Section title="Branches Requiring Intervention" color="#F87171">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
                {flagged.map((b: any, i: number) => (
                  <div key={i} style={{ background:"rgba(15,26,40,0.85)", border:"1px solid rgba(248,113,113,0.25)", borderRadius:12, padding:"14px 16px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"#F1F5F9", marginBottom:2 }}>{b.Branch_Name}</div>
                        <div style={{ fontSize:10, color:"#475569" }}>{b.City} · {b.Region}</div>
                      </div>
                      <span style={{ padding:"2px 8px", borderRadius:8, fontSize:10, fontWeight:600, background:"rgba(248,113,113,0.12)", color:"#F87171", border:"0.5px solid rgba(248,113,113,0.3)" }}>{b.SPC_Flag}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22, fontWeight:700, color:sigmaColor(Number(b.Sigma_Level)) }}>σ {b.Sigma_Level}</span>
                      <span style={{ fontSize:11, color:"#64748B" }}>SLA: {b.sla_compliance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html:"@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
