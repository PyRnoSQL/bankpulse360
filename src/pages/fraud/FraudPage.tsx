import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'

function GreetingBar() {
  const user = (() => { try { const t = localStorage.getItem('bp360_token'); if (!t) return null; return JSON.parse(atob(t.split('.')[1])) } catch { return null } })()
  const firstName = (user?.name || 'User').split(' ')[0]
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(n.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>👋</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#34D399' }}>Hello, {firstName}!</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>—</span>
        <span style={{ fontSize: 13, color: '#64748B' }}>{date}</span>
      </div>
      <span style={{ fontSize: 13, color: '#64748B', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', fontWeight: 500 }}>{time}</span>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: color }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        <div style={{ flex: 1, height: '0.5px', background: color + '25' }} />
      </div>
      {children}
    </div>
  )
}

function AMLGraph({ nodes, links }: { nodes: any[]; links: any[] }) {
  const W = 580
  const H = 380
  const TIER: Record<string,string> = { Red: '#F87171', Amber: '#F59E0B', Green: '#34D399' }
  if (!nodes.length) return (
    <div style={{ height: H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,26,40,0.85)', borderRadius: 12, color: '#475569', fontSize: 13, gap: 8 }}>
      <span style={{ fontSize: 28 }}>🕸</span>
      No high-risk network edges found in current data
    </div>
  )
  const cx = W / 2
  const cy = H / 2
  const r  = Math.min(cx, cy) * 0.72
  const pos: Record<string, {x:number;y:number}> = {}
  nodes.forEach((n, i) => {
    const a = (i / nodes.length) * 2 * Math.PI - Math.PI / 2
    pos[n.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', borderRadius: 12, padding: 12 }}>
      <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display: 'block' }}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 1L9 5L1 9" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          </marker>
        </defs>
        {links.map((l, i) => {
          const s = pos[l.source]; const t = pos[l.target]
          if (!s || !t) return null
          const col = TIER[l.riskTier] || '#475569'
          const dx = t.x - s.x; const dy = t.y - s.y
          const len = Math.sqrt(dx*dx+dy*dy)
          const tx = t.x - (dx/len)*14; const ty = t.y - (dy/len)*14
          return <line key={i} x1={s.x} y1={s.y} x2={tx} y2={ty} stroke={col} strokeWidth={l.riskTier === 'Red' ? 1.5 : 1} strokeOpacity={0.5} markerEnd="url(#ah)" />
        })}
        {nodes.map(n => {
          const p = pos[n.id]; if (!p) return null
          const col = TIER[n.riskTier] || '#60A5FA'
          const rad = n.type === 'account' ? 11 : 8
          const label = String(n.label || n.id).slice(0, 10)
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={rad} fill={col + '22'} stroke={col} strokeWidth={1.5} />
              <circle cx={p.x} cy={p.y} r={3} fill={col} />
              <text x={p.x} y={p.y - rad - 4} textAnchor="middle" fill="#94A3B8" fontSize={8.5} fontFamily="monospace">{label}</text>
            </g>
          )
        })}
        <text x={W/2} y={H-6} textAnchor="middle" fill="#334155" fontSize={9}>High/Critical AML alerts — node size indicates account type</text>
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[['#F87171','Red — High risk'],['#F59E0B','Amber — Medium'],['#34D399','Green — Low'],['#60A5FA','Counterparty']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#64748B' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c as string, display: 'inline-block' }} />{l}
          </div>
        ))}
      </div>
    </div>
  )
}

const BAND: Record<string,string>  = { Low:'#34D399', Medium:'#F59E0B', High:'#FB923C', Critical:'#F87171' }
const TIER2: Record<string,string> = { Green:'#34D399', Amber:'#F59E0B', Red:'#F87171' }

export default function FraudPage() {
  const [alerts,  setAlerts]  = useState<any[]>([])
  const [network, setNetwork] = useState<{nodes:any[];links:any[]}>({nodes:[],links:[]})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch('/api/fraud/alerts',  { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/fraud/network', { headers: h }).then(r => r.json()).catch(() => ({nodes:[],links:[]})),
    ]).then(([a, n]) => {
      setAlerts(Array.isArray(a) ? a : [])
      if (n && Array.isArray(n.nodes)) setNetwork(n)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const critical  = alerts.filter(a => a.Fraud_Band === 'Critical').length
  const sarNeeded = alerts.filter(a => a.SAR_Required === true).length
  const redTier   = alerts.filter(a => a.AML_Risk_Tier === 'Red').length
  const avgMttd   = alerts.length ? Math.round(alerts.reduce((s,a) => s + Number(a.MTTD__min_ || 0), 0) / alerts.length) : 0
  const simSwap   = alerts.filter(a => a.SIM_Swap_Within_48h === true).length
  const sanctions = alerts.filter(a => a.Sanctions_Hit === true).length

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin: -24, padding: '20px 24px 24px' }}>
      <GreetingBar />
      {loading && (
        <div style={{ color: '#475569', fontSize: 13, padding: '40px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 16, height: 16, border: '2px solid #1D9E75', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          Loading fraud data from BigQuery...
        </div>
      )}
      {!loading && (
        <>
          <Section title="Alert Summary" color="#F87171">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
              {[
                { icon:'🔴', label:'Critical Alerts',  value: String(critical),    sub:'immediate action',    accent:'#F87171' },
                { icon:'📄', label:'SAR Required',     value: String(sarNeeded),   sub:'pending reports',     accent:'#FB923C' },
                { icon:'🛑', label:'Red Risk Tier',    value: String(redTier),     sub:'high-risk accounts',  accent:'#F87171' },
                { icon:'⚡', label:'Avg MTTD',         value: avgMttd + ' min',    sub:'mean time to detect', accent:'#34D399' },
                { icon:'📲', label:'SIM Swap Alerts',  value: String(simSwap),     sub:'within 48h',          accent:'#F59E0B' },
                { icon:'🚫', label:'Sanctions Hits',   value: String(sanctions),   sub:'watchlist matches',   accent:'#F87171' },
              ].map(k => (
                <div key={k.label} style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid ' + k.accent + '28', borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: k.accent, opacity: 0.07, filter: 'blur(20px)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{k.label}</span>
                    <span style={{ fontSize: 16, width: 30, height: 30, borderRadius: 8, background: k.accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{k.icon}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em', marginBottom: 4 }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{k.sub}</div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="AML Transaction Network — High and Critical Alerts" color="#818CF8">
            <AMLGraph nodes={network.nodes} links={network.links} />
          </Section>
          {alerts.length > 0 && (
            <Section title="Recent Alerts" color="#FB923C">
              <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 90px 90px 80px 110px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Customer','Channel','Amount','Band','Risk Tier','MTTD','Status'].map(h => (
                    <span key={h} style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {alerts.slice(0, 10).map((a: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 90px 90px 80px 110px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{a.Customer_Name}</span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{a.Channel}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{(Number(a.Amount__FCFA_)/1000000).toFixed(1)}M</span>
                    <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: (BAND[a.Fraud_Band] || '#64748B') + '15', color: BAND[a.Fraud_Band] || '#64748B', border: '0.5px solid ' + (BAND[a.Fraud_Band] || '#64748B') + '40' }}>{a.Fraud_Band}</span>
                    <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: (TIER2[a.AML_Risk_Tier] || '#64748B') + '15', color: TIER2[a.AML_Risk_Tier] || '#64748B', border: '0.5px solid ' + (TIER2[a.AML_Risk_Tier] || '#64748B') + '40' }}>{a.AML_Risk_Tier}</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{a.MTTD__min_} min</span>
                    <span style={{ fontSize: 10, color: a.Case_Status === 'SAR Filed' ? '#34D399' : a.Case_Status?.includes('FP') ? '#64748B' : '#F59E0B' }}>{a.Case_Status}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </div>
  )
}
