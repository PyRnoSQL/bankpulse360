import { useEffect, useState, useRef } from 'react'
import { authHeader } from '@/lib/auth'
import { DataViewer } from '@/components/ui/DataViewer'
import { KPISkeletonGrid, NetworkSkeleton, TableSkeleton } from '@/components/ui/SkeletonCard'
import { AlertTriangle, Shield, Zap, Clock, Smartphone, Ban } from 'lucide-react'

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

/* ── AML Network with suspicious cluster highlighting ────── */
function AMLNetworkGraph({ nodes, links }: { nodes: any[]; links: any[] }) {
  const W = 620; const H = 420
  const TIER: Record<string,string> = { Red: "#F87171", Amber: "#F59E0B", Green: "#34D399" }
  const [positions, setPositions] = useState<Record<string,{x:number;y:number}>>({})
  const [selected,  setSelected]  = useState<string|null>(null)
  const [tick,      setTick]      = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!nodes.length) return
    const pos: Record<string,{x:number;y:number;vx:number;vy:number}> = {}
    nodes.forEach((n, i) => {
      const a = (i / nodes.length) * 2 * Math.PI - Math.PI/2
      const r = Math.min(W, H) * 0.32
      pos[n.id] = { x: W/2 + r * Math.cos(a), y: H/2 + r * Math.sin(a), vx: 0, vy: 0 }
    })
    let t = 0
    const run = () => {
      t++; if (t > 250) return
      const alpha = Math.max(0.005, 1 - t/250)
      nodes.forEach(a => nodes.forEach(b => {
        if (a.id === b.id) return
        const dx = pos[a.id].x-pos[b.id].x; const dy = pos[a.id].y-pos[b.id].y
        const d = Math.sqrt(dx*dx+dy*dy)||1; const f = 55*55/(d*d)*alpha
        pos[a.id].vx += dx/d*f; pos[a.id].vy += dy/d*f
      }))
      links.forEach(l => {
        const s = pos[l.source]; const t2 = pos[l.target]; if (!s||!t2) return
        const dx=t2.x-s.x; const dy=t2.y-s.y; const d=Math.sqrt(dx*dx+dy*dy)||1
        const f=(d-110)*0.05*alpha; const fx=dx/d*f; const fy=dy/d*f
        s.vx+=fx; s.vy+=fy; t2.vx-=fx; t2.vy-=fy
      })
      nodes.forEach(n => {
        pos[n.id].vx += (W/2-pos[n.id].x)*0.012*alpha
        pos[n.id].vy += (H/2-pos[n.id].y)*0.012*alpha
        pos[n.id].vx *= 0.72; pos[n.id].vy *= 0.72
        pos[n.id].x = Math.max(22, Math.min(W-22, pos[n.id].x+pos[n.id].vx))
        pos[n.id].y = Math.max(22, Math.min(H-22, pos[n.id].y+pos[n.id].vy))
      })
      const snap: Record<string,{x:number;y:number}> = {}
      nodes.forEach(n => { snap[n.id] = { x: pos[n.id].x, y: pos[n.id].y } })
      setPositions({...snap})
      raf.current = requestAnimationFrame(run)
    }
    raf.current = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf.current)
  }, [nodes, links])

  /* Pulse animation for red nodes */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t+1), 800)
    return () => clearInterval(id)
  }, [])

  if (!nodes.length) return (
    <div style={{ height: H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(15,26,40,0.85)", borderRadius: 12, color: "#475569", fontSize: 13, gap: 10 }}>
      <span style={{ fontSize: 32 }}>🕸</span>No high-risk transaction edges in current data
    </div>
  )

  /* Identify suspicious clusters: nodes with 2+ red links */
  const redLinkCount: Record<string,number> = {}
  links.forEach(l => {
    if (l.riskTier === "Red") {
      redLinkCount[l.source] = (redLinkCount[l.source]||0)+1
      redLinkCount[l.target] = (redLinkCount[l.target]||0)+1
    }
  })
  const isSuspicious = (id: string) => (redLinkCount[id]||0) >= 2
  const isMule = (id: string, type: string) => type === "counterparty" && (redLinkCount[id]||0) >= 1

  const selNode  = selected ? nodes.find(n => n.id === selected) : null
  const selLinks = selected ? links.filter(l => l.source===selected||l.target===selected) : []
  const pulse    = tick % 2 === 0

  return (
    <div style={{ background: "rgba(15,26,40,0.9)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(129,140,248,0.25)" }}>
      {/* Header */}
      <div style={{ padding: "10px 16px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Transaction network</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: "rgba(248,113,113,0.12)", color: "#F87171", border: "0.5px solid rgba(248,113,113,0.3)" }}>{nodes.length} nodes · {links.length} edges</span>
          {Object.values(redLinkCount).filter(v => v>=2).length > 0 && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: pulse ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.08)", color: "#F87171", border: "0.5px solid rgba(248,113,113,0.5)", fontWeight: 600, transition: "background 0.4s" }}>
              ⚠ {Object.values(redLinkCount).filter(v=>v>=2).length} SUSPICIOUS CLUSTERS
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: "#475569" }}>Click a node to inspect · Glowing = high-risk cluster</span>
      </div>

      {/* SVG graph */}
      <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display: "block" }}>
        <defs>
          <marker id="aml-arr-red"   viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="aml-arr-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="aml-arr-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L9 5L1 8" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/></marker>
        </defs>

        {/* Cluster halos */}
        {nodes.map(n => {
          const p = positions[n.id]; if (!p) return null
          if (!isSuspicious(n.id) && !isMule(n.id, n.type)) return null
          return (
            <circle key={"halo-"+n.id}
              cx={p.x} cy={p.y} r={pulse ? 22 : 18}
              fill="rgba(248,113,113,0.06)"
              stroke="rgba(248,113,113,0.35)"
              strokeWidth="1"
              strokeDasharray="3 2"
              style={{ transition: "r 0.4s" }}
            />
          )
        })}

        {/* Links */}
        {links.map((l, i) => {
          const s = positions[l.source]; const t = positions[l.target]
          if (!s||!t) return null
          const col = TIER[l.riskTier]||"#64748B"
          const mid = "aml-arr-"+(l.riskTier==="Red"?"red":l.riskTier==="Amber"?"amber":"green")
          const dx=t.x-s.x; const dy=t.y-s.y; const len=Math.sqrt(dx*dx+dy*dy)||1
          const pad=14; const tx=t.x-(dx/len)*pad; const ty=t.y-(dy/len)*pad
          const hl = selected===l.source||selected===l.target
          const dim = selected && !hl
          return (
            <line key={i} x1={s.x} y1={s.y} x2={tx} y2={ty}
              stroke={col} strokeWidth={hl?2.5:l.riskTier==="Red"?1.8:1}
              strokeOpacity={dim?0.1:0.65}
              markerEnd={"url(#"+mid+")"}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const p = positions[n.id]; if (!p) return null
          const col   = TIER[n.riskTier]||"#60A5FA"
          const r     = n.type==="account"?13:9
          const isSel = selected===n.id
          const susp  = isSuspicious(n.id)
          const mule  = isMule(n.id, n.type)
          const dim   = selected && !isSel && !selLinks.some(l=>l.source===n.id||l.target===n.id)
          return (
            <g key={n.id} style={{ cursor:"pointer" }} onClick={() => setSelected(s => s===n.id?null:n.id)}>
              {isSel && <circle cx={p.x} cy={p.y} r={r+9} fill={col+"20"} stroke={col} strokeWidth="1" strokeDasharray="3 2"/>}
              <circle cx={p.x} cy={p.y} r={r}
                fill={col+(isSel?"40":"18")}
                stroke={col}
                strokeWidth={susp?2:isSel?2:1.2}
                opacity={dim?0.2:1}
                style={{ filter: susp && !dim ? "drop-shadow(0 0 6px "+col+")" : undefined }}
              />
              <circle cx={p.x} cy={p.y} r={r/3} fill={col} opacity={dim?0.2:1}/>
              {(susp||mule) && (
                <text x={p.x} y={p.y-r-12} textAnchor="middle" fontSize="8" fill="#F87171" fontWeight="700" opacity={dim?0.2:1}>
                  {susp?"CLUSTER":mule?"MULE?":""}
                </text>
              )}
              <text x={p.x} y={p.y-r-4+(susp||mule?8:0)} textAnchor="middle" fontSize="8" fill={dim?"#334155":"#CBD5E1"} fontWeight="500">
                {String(n.label||"").slice(0,10)}
              </text>
              <text x={p.x} y={p.y+r+11} textAnchor="middle" fontSize="7.5" fill={dim?"#1e3a5f":n.riskTier==="Red"?"#F87171":"#64748B"}>
                {String(n.city||"").slice(0,10)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Selected node detail */}
      {selNode && (
        <div style={{ padding:"12px 16px", borderTop:"0.5px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:TIER[selNode.riskTier]||"#60A5FA" }} />
            <span style={{ fontSize:13, fontWeight:600, color:"#F1F5F9" }}>{selNode.label||selNode.id}</span>
            <span style={{ fontSize:10, color:"#64748B" }}>{selNode.city} · {selNode.type}</span>
            <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:(TIER[selNode.riskTier]||"#64748B")+"18", color:TIER[selNode.riskTier]||"#64748B", border:"0.5px solid "+(TIER[selNode.riskTier]||"#64748B")+"40" }}>{selNode.riskTier} Risk</span>
            {isSuspicious(selNode.id) && <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:"rgba(248,113,113,0.15)", color:"#F87171", border:"0.5px solid rgba(248,113,113,0.4)", fontWeight:600 }}>⚠ SUSPICIOUS CLUSTER</span>}
            {isMule(selNode.id, selNode.type) && <span style={{ fontSize:10, padding:"1px 7px", borderRadius:6, background:"rgba(248,113,113,0.15)", color:"#F87171", border:"0.5px solid rgba(248,113,113,0.4)", fontWeight:600 }}>⚠ POSSIBLE MULE</span>}
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            {selLinks.map((l, i) => {
              const other = l.source===selNode.id ? nodes.find(n=>n.id===l.target) : nodes.find(n=>n.id===l.source)
              const isOut = l.source===selNode.id
              const rc = TIER[l.riskTier]||"#64748B"
              return (
                <div key={i} style={{ fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:isOut?"#F59E0B":"#60A5FA", fontWeight:700 }}>{isOut?"→":"←"}</span>
                  <span>{other?.city||other?.id}</span>
                  <span style={{ color:"#F1F5F9", fontWeight:600, fontVariantNumeric:"tabular-nums" }}>{(l.amount/1000000).toFixed(1)}M FCFA</span>
                  <span style={{ color:rc, fontSize:10 }}>{l.typology}</span>
                  {l.sarFlag===true && <span style={{ color:"#F87171", fontSize:9, fontWeight:700 }}>SAR</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ padding:"8px 16px", borderTop:"0.5px solid rgba(255,255,255,0.06)", display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
        {[["#F87171","Red — High risk"],["#F59E0B","Amber — Medium"],["#34D399","Green — Low"]].map(([c,l]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"#64748B" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:c as string, display:"inline-block" }} />{l}
          </div>
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:"#F87171" }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#F87171", display:"inline-block", boxShadow:"0 0 6px #F87171" }} />Glowing = suspicious cluster / possible mule
        </div>
        <div style={{ fontSize:10, color:"#334155", marginLeft:"auto" }}>Large = account · Small = counterparty</div>
      </div>
    </div>
  )
}

const BAND: Record<string,string>  = { Low:"#34D399", Medium:"#F59E0B", High:"#FB923C", Critical:"#F87171" }
const TIER2: Record<string,string> = { Green:"#34D399", Amber:"#F59E0B", Red:"#F87171" }

export default function FraudPage() {
  const [alerts,  setAlerts]  = useState<any[]>([])
  const [network, setNetwork] = useState<{nodes:any[];links:any[]}>({nodes:[],links:[]})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch("/api/fraud/alerts",  { headers: h }).then(r => r.json()).catch(() => []),
      fetch("/api/fraud/network", { headers: h }).then(r => r.json()).catch(() => ({nodes:[],links:[]})),
    ]).then(([a, n]) => {
      setAlerts(Array.isArray(a) ? a : [])
      if (n?.nodes) setNetwork(n)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const critical  = alerts.filter(a => a.Fraud_Band==="Critical").length
  const sarNeeded = alerts.filter(a => a.SAR_Required===true).length
  const redTier   = alerts.filter(a => a.AML_Risk_Tier==="Red").length
  const avgMttd   = alerts.length ? Math.round(alerts.reduce((s,a) => s+Number(a.MTTD__min_||0),0)/alerts.length) : 0
  const simSwap   = alerts.filter(a => a.SIM_Swap_Within_48h===true).length
  const sanctions = alerts.filter(a => a.Sanctions_Hit===true).length

  return (
    <div style={{ minHeight:"100%", background:"linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)", margin:-24, padding:"20px 24px 24px" }}>
      <GreetingBar />
      {loading && (
        <div style={{ color:"#475569", fontSize:13, padding:"40px 0", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:16, height:16, border:"2px solid #1D9E75", borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
          Loading fraud data from BigQuery...
        </div>
      )}
      {!loading && (
        <>
          <Section title="Alert Summary" color="#F87171">
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))", gap:12 }}>
              {[
                { icon:<AlertTriangle size={14}/>, label:"Critical Alerts",  value:String(critical),    sub:"immediate action",    accent:"#F87171" },
                { icon:<Shield size={14}/>,        label:"SAR Required",     value:String(sarNeeded),   sub:"pending reports",     accent:"#FB923C" },
                { icon:<Ban size={14}/>,           label:"Red Risk Tier",    value:String(redTier),     sub:"high-risk accounts",  accent:"#F87171" },
                { icon:<Clock size={14}/>,         label:"Avg MTTD",         value:avgMttd+" min",      sub:"mean time to detect", accent:"#34D399" },
                { icon:<Smartphone size={14}/>,    label:"SIM Swap Alerts",  value:String(simSwap),     sub:"within 48h",          accent:"#F59E0B" },
                { icon:<Zap size={14}/>,           label:"Sanctions Hits",   value:String(sanctions),   sub:"watchlist matches",   accent:"#F87171" },
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

          <Section title="AML Transaction Network — Suspicious cluster + mule account detection" color="#818CF8">
            <AMLNetworkGraph nodes={network.nodes} links={network.links} />
          </Section>

          {alerts.length > 0 && (
            <Section title="Recent Alerts — Full Detail" color="#FB923C">
            <div style={{ background:"rgba(15,26,40,0.92)", border:"1px solid rgba(251,146,60,0.22)", borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", background:"rgba(10,18,32,0.99)", borderBottom:"0.5px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:12, color:"#94A3B8" }}>Sheet: <strong style={{ color:"#F1F5F9" }}>BP360_M3_Fraud_AML</strong></span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>{alerts.length} rows · 30 columns</span>
                <span style={{ color:"#334155" }}>·</span>
                <span style={{ fontSize:12, color:"#64748B" }}>KPIs: fraud score, AML typology, SAR status, MTTD, sanctions, PEP flags</span>
                <button onClick={() => {
                  const keys = ["Alert_ID","Account_ID","Customer_Name","Region","City","Alert_Date","Alert_Time","Channel","Transaction_Type","Amount__FCFA_","Counterparty_Account","Counterparty_Country","Fraud_Score","Fraud_Band","Alert_Type","AML_Typology","AML_Risk_Tier","SIM_Swap_Within_48h","New_Beneficiary","Velocity_Flag__24h_","Sanctions_Hit","PEP_Linked","Case_Status","SAR_Required","SAR_Filed_Date","MTTD__min_","Investigator","amount_millions","risk_category","escalation_required"]
                  const rows = [keys.join(","), ...alerts.map((r:any) => keys.map(k => { const v = String(r[k] ?? ""); return v.includes(",") ? '"'+v+'"' : v }).join(","))]
                  navigator.clipboard.writeText(rows.join("\n"))
                }} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"0.5px solid rgba(255,255,255,0.12)", color:"#94A3B8", cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"inherit" }}>
                  ⎘ Copy CSV
                </button>
              </div>
              <div style={{ overflowX:"auto", overflowY:"auto", maxHeight:460 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:3800 }}>
                  <thead>
                    <tr>
                      {([
                        {l:"ALERT ID",w:130},{l:"ACCOUNT ID",w:120},{l:"CUSTOMER",w:150},{l:"REGION",w:130},
                        {l:"CITY",w:110},{l:"DATE",w:110},{l:"TIME",w:80},{l:"CHANNEL",w:100},
                        {l:"TXN TYPE",w:160},{l:"AMOUNT (FCFA)",w:130},{l:"COUNTERPARTY",w:140},
                        {l:"COUNTRY",w:110},{l:"FRAUD SCORE",w:120},{l:"BAND",w:100},
                        {l:"ALERT TYPE",w:170},{l:"AML TYPOLOGY",w:150},{l:"RISK TIER",w:100},
                        {l:"SIM SWAP",w:100},{l:"NEW BENEF.",w:100},{l:"VELOCITY",w:90},
                        {l:"SANCTIONS",w:100},{l:"PEP LINKED",w:100},{l:"CASE STATUS",w:130},
                        {l:"SAR REQ.",w:90},{l:"SAR FILED",w:110},{l:"MTTD (MIN)",w:110},
                        {l:"INVESTIGATOR",w:150},{l:"AMOUNT (M)",w:120},{l:"RISK CATEGORY",w:140},
                        {l:"ESCALATION",w:120},
                      ] as {l:string;w:number}[]).map(h => (
                        <th key={h.l} style={{ padding:"11px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:"0.08em", borderBottom:"1px solid rgba(255,255,255,0.1)", whiteSpace:"nowrap", minWidth:h.w, position:"sticky", top:0, background:"rgba(10,18,32,0.99)", zIndex:2 }}>{h.l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((a:any, i:number) => {
                      const band:Record<string,string>  = {Low:"#34D399",Medium:"#F59E0B",High:"#FB923C",Critical:"#F87171"}
                      const tier:Record<string,string>  = {Green:"#34D399",Amber:"#F59E0B",Red:"#F87171"}
                      const rcat:Record<string,string>  = {Low:"#34D399",Medium:"#F59E0B",High:"#FB923C",Critical:"#F87171"}
                      const bc = band[a.Fraud_Band]||"#64748B"
                      const tc = tier[a.AML_Risk_Tier]||"#64748B"
                      const rc = rcat[a.risk_category]||"#64748B"
                      return (
                        <tr key={i} style={{ borderBottom:"0.5px solid rgba(255,255,255,0.04)", transition:"background 0.12s" }}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="rgba(251,146,60,0.05)"}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:10, color:"#60A5FA" }}>{a.Alert_ID}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:10, color:"#475569" }}>{a.Account_ID}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:12, color:"#E2E8F0", fontWeight:500 }}>{a.Customer_Name}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Region}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{a.City}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Alert_Date}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{a.Alert_Time}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#E2E8F0" }}>{a.Channel}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Transaction_Type}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontWeight:600, color:"#E2E8F0", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{Number(a.Amount__FCFA_||0).toLocaleString()}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontFamily:"monospace", fontSize:10, color:"#64748B" }}>{a.Counterparty_Account}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Counterparty_Country}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}><span style={{ fontWeight:700, color:Number(a.Fraud_Score)>=0.8?"#F87171":Number(a.Fraud_Score)>=0.6?"#F59E0B":"#34D399", fontVariantNumeric:"tabular-nums" }}>{Number(a.Fraud_Score||0).toFixed(2)}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:600, background:bc+"15", color:bc, border:"0.5px solid "+bc+"40" }}>{a.Fraud_Band}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Alert_Type}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{a.AML_Typology}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:600, background:tc+"15", color:tc, border:"0.5px solid "+tc+"40" }}>{a.AML_Risk_Tier}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:600, color:a.SIM_Swap_Within_48h?"#F87171":"#334155" }}>{a.SIM_Swap_Within_48h?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:600, color:a.New_Beneficiary?"#F59E0B":"#334155" }}>{a.New_Beneficiary?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:600, color:a.Velocity_Flag__24h_?"#F59E0B":"#334155" }}>{a.Velocity_Flag__24h_?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:700, color:a.Sanctions_Hit?"#F87171":"#334155" }}>{a.Sanctions_Hit?"HIT":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:600, color:a.PEP_Linked?"#F87171":"#334155" }}>{a.PEP_Linked?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ fontSize:10, fontWeight:600, color:a.Case_Status==="SAR Filed"?"#34D399":String(a.Case_Status).includes("FP")?"#475569":a.Case_Status==="Open"?"#F87171":"#F59E0B" }}>{a.Case_Status}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:700, color:a.SAR_Required?"#F87171":"#334155" }}>{a.SAR_Required?"Yes":"No"}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#64748B" }}>{a.SAR_Filed_Date||"--"}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"right" }}><span style={{ fontWeight:600, color:Number(a.MTTD__min_)<=10?"#34D399":Number(a.MTTD__min_)<=20?"#F59E0B":"#F87171", fontVariantNumeric:"tabular-nums" }}>{a.MTTD__min_} min</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontSize:11, color:"#94A3B8" }}>{a.Investigator}</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", fontWeight:600, color:"#E2E8F0", textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{a.amount_millions}M</td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap" }}><span style={{ padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:600, background:rc+"15", color:rc }}>{a.risk_category}</span></td>
                          <td style={{ padding:"9px 14px", whiteSpace:"nowrap", textAlign:"center" }}><span style={{ fontWeight:700, color:a.escalation_required?"#F87171":"#334155" }}>{a.escalation_required?"Yes":"No"}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:"7px 16px", background:"rgba(10,18,32,0.99)", borderTop:"0.5px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#334155" }}>Scroll horizontally for all 30 columns · Green/Amber/Red = risk threshold · HIT = sanctions match</span>
                <span style={{ fontSize:10, color:"#1e3a5f" }}>BankPulse 360° · BigQuery Live</span>
              </div>
            </div>
          </Section>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html:"@keyframes spin{to{transform:rotate(360deg)}}" }} />
    </div>
  )
}
