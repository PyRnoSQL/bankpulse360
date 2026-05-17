import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'

function GreetingBar() {
  const user = (() => {
    try { const t = localStorage.getItem('bp360_token'); if (!t) return null; return JSON.parse(atob(t.split('.')[1])) } catch { return null }
  })()
  const firstName = (user?.name || 'User').split(' ')[0]
  const [time, setTime] = useState(''); const [date, setDate] = useState('')
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setTime(n.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(n.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
    }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
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

function StatCard({ icon, label, value, sub, accent }: { icon: string; label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', border: `1px solid ${accent}28`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)', boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(24px)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 18, width: 34, height: 34, borderRadius: 9, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748B' }}>{sub}</div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: color }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        <div style={{ flex: 1, height: '0.5px', background: `${color}25` }} />
      </div>
      {children}
    </div>
  )
}

export default function CustomersPage() {
  const [segments, setSegments] = useState<any[]>([])
  const [churn,    setChurn]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch('/api/customers/segments', { headers: h }).then(r => r.json()),
      fetch('/api/customers/churn-risk', { headers: h }).then(r => r.json()),
    ]).then(([s, c]) => { setSegments(Array.isArray(s) ? s : []); setChurn(Array.isArray(c) ? c : []); setLoading(false) })
    .catch(() => setLoading(false))
  }, [])

  const total    = segments.reduce((s, r) => s + Number(r.count || 0), 0)
  const premium  = segments.find(s => s.Segment === 'Premium')
  const atRisk   = segments.find(s => s.Segment === 'At-Risk')
  const dormant  = segments.find(s => s.Segment === 'Dormant')

  const SEGMENT_COLORS: Record<string, string> = {
    'Premium': '#818CF8', 'Mass Market': '#34D399', 'At-Risk': '#F59E0B', 'Dormant': '#64748B'
  }

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin: -24, padding: '20px 24px 24px' }}>
      <GreetingBar />

      {loading && <div style={{ color: '#475569', fontSize: 13, padding: '40px 0', display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 16, height: 16, border: '2px solid #1D9E75', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Loading customer data…</div>}

      {!loading && (
        <>
          {/* KPI strip */}
          <Section title="Key Metrics" color="#818CF8">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              <StatCard icon="👤" label="Total Customers"     value={String(total || '--')}                          sub="across all regions"         accent="#818CF8" />
              <StatCard icon="💎" label="Premium Clients"     value={String(premium?.count || '--')}                sub="high-value segment"         accent="#A78BFA" />
              <StatCard icon="⚠️" label="At-Risk Accounts"   value={String(atRisk?.count || '--')}                 sub="churn probability ≥ 50%"    accent="#F59E0B" />
              <StatCard icon="💤" label="Dormant Accounts"   value={String(dormant?.count || '--')}                sub="inactive customers"         accent="#64748B" />
              <StatCard icon="📱" label="Digital Adoption"   value="53%"                                            sub="mobile banking active"      accent="#34D399" />
              <StatCard icon="🎯" label="NBO Conversion"     value="36%"                                            sub="offer acceptance rate"      accent="#60A5FA" />
            </div>
          </Section>

          {/* Segment breakdown */}
          {segments.length > 0 && (
            <Section title="Segment Distribution" color="#34D399">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                {segments.map((s: any) => {
                  const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                  const color = SEGMENT_COLORS[s.Segment] || '#60A5FA'
                  return (
                    <div key={s.Segment} style={{ background: 'rgba(15,26,40,0.85)', border: `1px solid ${color}28`, borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{s.Segment}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color }}>   {pct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 8 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#64748B' }}>{s.count} customers</span>
                        <span style={{ fontSize: 11, color: '#64748B' }}>Avg CLV: {s.avg_clv_m}M</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Churn risk table */}
          {churn.length > 0 && (
            <Section title="High Churn Risk Accounts" color="#F59E0B">
              <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 120px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Customer', 'Region', 'Segment', 'Churn %', 'Recommendation'].map(h => (
                    <span key={h} style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {churn.slice(0, 8).map((c: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 120px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{c.Full_Name}</span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{c.Region}</span>
                    <span style={{ fontSize: 11 }}>
                      <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '0.5px solid rgba(245,158,11,0.3)' }}>{c.Segment}</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: Number(c.Churn_Prob____) >= 70 ? '#F87171' : '#F59E0B' }}>{c.Churn_Prob____}%</span>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>{c.Recommended_Product}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
