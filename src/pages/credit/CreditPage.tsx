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

function StressTestPanel({ sectors }: { sectors: any[] }) {
  const [impact, setImpact] = useState(0)
  const baseTotalNpl = sectors.reduce((s: number, r: any) => s + Number(r.npl_count || 0), 0)
  const totalLoans   = sectors.reduce((s: number, r: any) => s + Number(r.loan_count || 1), 0)
  const simNpl   = Math.round(baseTotalNpl + (impact / 100) * 4)
  const simRatio = totalLoans > 0 ? ((simNpl / totalLoans) * 100).toFixed(1) : '0.0'
  const simEcl   = (sectors.reduce((s: number, r: any) => s + Number(r.total_ecl_millions || 0), 0) * (1 + impact / 100 * 0.6)).toFixed(1)
  const color = impact > 60 ? '#F87171' : impact > 30 ? '#F59E0B' : '#34D399'
  return (
    <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: '#F87171' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Portfolio stress-test simulator</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '0.5px solid rgba(248,113,113,0.3)' }}>What-if scenario</span>
      </div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Agriculture sector drought impact</span>
          <span style={{ fontSize: 13, fontWeight: 700, color }}>{impact}%</span>
        </div>
        <input type="range" min={0} max={100} value={impact} onChange={e => setImpact(Number(e.target.value))} style={{ width: '100%', accentColor: '#1D9E75' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#475569', marginTop: 4 }}>
          <span>No impact</span><span>Severe drought</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Simulated NPL ratio', value: simRatio + '%', base: 'of total portfolio' },
          { label: 'NPL accounts', value: String(simNpl), base: 'vs ' + baseTotalNpl + ' baseline' },
          { label: 'Required ECL (FCFA)', value: simEcl + 'M', base: 'provisions needed' },
        ].map(k => (
          <div key={k.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', border: '1px solid ' + color + '22' }}>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{k.base}</div>
          </div>
        ))}
      </div>
      {impact > 50 && (
        <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 9, background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.25)', color: '#FCA5A5', fontSize: 12 }}>
          Severe stress scenario - immediate portfolio review and provision top-up recommended.
        </div>
      )}
    </div>
  )
}

function XAIPanel({ loan, onClose }: { loan: any; onClose: () => void }) {
  const pd       = Number(loan.PD_Score____ || 0)
  const dpd      = Number(loan.Days_Past_Due || 0)
  const stage    = String(loan.IFRS9_Stage || '1')
  const clf      = String(loan.Loan_Classification || 'Pass')
  const ews      = String(loan.EWS_Flag || 'None')
  const coverage = Number(loan.Coverage_Ratio____ || 100)
  const decision = clf === 'Pass' || clf === 'Watch' ? 'APPROVE / WATCH' : clf === 'Substandard' ? 'ESCALATE' : 'DECLINE'
  const decColor = decision === 'APPROVE / WATCH' ? '#34D399' : decision === 'ESCALATE' ? '#F59E0B' : '#F87171'
  const reasons: string[] = []
  if (pd < 10)        reasons.push('Low probability of default (' + pd + '%)')
  if (pd > 25)        reasons.push('High PD score (' + pd + '%) - above 25% threshold')
  if (dpd === 0)      reasons.push('No missed payments on record')
  if (dpd > 30)       reasons.push(dpd + ' days past due - delinquency signal')
  if (coverage > 100) reasons.push('Collateral coverage ' + coverage + '% - fully secured')
  if (coverage < 60)  reasons.push('Collateral only ' + coverage + '% - undercollateralised')
  if (stage === '1')  reasons.push('IFRS 9 Stage 1 - performing loan')
  if (stage === '3')  reasons.push('IFRS 9 Stage 3 - credit-impaired')
  if (ews === 'None' || ews === 'Low') reasons.push('No significant early warning signals')
  if (ews === 'High' || ews === 'Critical') reasons.push('EWS flag: ' + ews + ' risk detected')
  const radar = [
    { label: 'Character',  score: ews === 'None' ? 80 : ews === 'Low' ? 65 : 30 },
    { label: 'Capital',    score: Math.max(0, 100 - pd * 2) },
    { label: 'Capacity',   score: dpd === 0 ? 85 : Math.max(0, 85 - dpd) },
    { label: 'Collateral', score: Math.min(100, coverage) },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#0A1628', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 18, padding: 24, width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 72px rgba(0,0,0,0.8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>XAI Credit Decision</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>{loan.Client_Name}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{loan.Loan_ID} - {loan.Sector}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#94A3B8', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
        </div>
        <div style={{ padding: '12px 16px', borderRadius: 10, background: decColor + '12', border: '1px solid ' + decColor + '30', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: decColor, marginBottom: 3 }}>{decision}</div>
          <div style={{ fontSize: 11, color: '#64748B' }}>Class: {clf} | Stage {stage} | EWS: {ews}</div>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Decision rationale</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
          {reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>
              <span style={{ color: '#1D9E75', flexShrink: 0, marginTop: 1 }}>›</span>{r}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>4C Risk Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 9 }}>
          {radar.map(r => (
            <div key={r.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '11px 13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 11, color: '#64748B' }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.score >= 70 ? '#34D399' : r.score >= 40 ? '#F59E0B' : '#F87171' }}>{r.score}/100</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: r.score + '%', borderRadius: 3, background: r.score >= 70 ? '#34D399' : r.score >= 40 ? '#F59E0B' : '#F87171', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CLF_COLOR: Record<string, string> = { Pass: '#34D399', Watch: '#60A5FA', Substandard: '#F59E0B', Doubtful: '#FB923C', Loss: '#F87171' }
const EWS_COLOR: Record<string, string> = { None: '#34D399', Low: '#60A5FA', Medium: '#F59E0B', High: '#FB923C', Critical: '#F87171' }

export default function CreditPage() {
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [sectors,   setSectors]   = useState<any[]>([])
  const [ews,       setEws]       = useState<any[]>([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState<any>(null)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch('/api/credit/portfolio',     { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/credit/npl-by-sector', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/credit/ews',           { headers: h }).then(r => r.json()).catch(() => []),
    ]).then(([p, s, e]) => {
      setPortfolio(Array.isArray(p) ? p : [])
      setSectors(Array.isArray(s) ? s : [])
      setEws(Array.isArray(e) ? e : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalOutstanding = portfolio.reduce((s: number, r: any) => s + Number(r.total_outstanding_millions || 0), 0)
  const totalEcl         = portfolio.reduce((s: number, r: any) => s + Number(r.total_ecl_millions || 0), 0)
  const nplCount         = portfolio.reduce((s: number, r: any) => s + Number(r.npl_count || 0), 0)
  const totalLoans       = portfolio.reduce((s: number, r: any) => s + Number(r.loan_count || 0), 0)
  const avgPd            = portfolio.length ? (portfolio.reduce((s: number, r: any) => s + Number(r.avg_pd_score || 0), 0) / portfolio.length).toFixed(1) : '--'
  const nplRatio         = totalLoans > 0 ? ((nplCount / totalLoans) * 100).toFixed(1) : '--'

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin: -24, padding: '20px 24px 24px' }}>
      <GreetingBar />
      {loading && (
        <div style={{ color: '#475569', fontSize: 13, padding: '40px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 16, height: 16, border: '2px solid #1D9E75', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          Loading credit data from BigQuery...
        </div>
      )}
      {!loading && (
        <>
          {sectors.length > 0 && <StressTestPanel sectors={sectors} />}
          <Section title="Portfolio Summary" color="#F87171">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
              {[
                { icon: '📋', label: 'Total Loans',       value: String(totalLoans || '--'),            sub: 'active accounts',       accent: '#60A5FA' },
                { icon: '💰', label: 'Outstanding (FCFA)', value: totalOutstanding.toFixed(0) + 'M',   sub: 'total exposure',        accent: '#818CF8' },
                { icon: '⚠️', label: 'NPL Ratio',         value: nplRatio + '%',                       sub: 'non-performing loans',  accent: '#F87171' },
                { icon: '🛡', label: 'ECL Provision',     value: totalEcl.toFixed(1) + 'M FCFA',       sub: 'expected credit loss',  accent: '#F59E0B' },
                { icon: '📊', label: 'Avg PD Score',      value: avgPd + '%',                          sub: 'probability of default',accent: '#FB923C' },
                { icon: '🚨', label: 'EWS Alerts',        value: String(ews.length || 0),              sub: 'high / critical flags', accent: '#F87171' },
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
          {sectors.length > 0 && (
            <Section title="NPL by Sector" color="#F59E0B">
              <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                {sectors.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500, width: 130, flexShrink: 0 }}>{s.Sector}</span>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: Math.min(Number(s.npl_ratio || 0), 100) + '%', background: Number(s.npl_ratio) > 25 ? '#F87171' : Number(s.npl_ratio) > 10 ? '#F59E0B' : '#34D399', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, width: 50, textAlign: 'right', color: Number(s.npl_ratio) > 25 ? '#F87171' : Number(s.npl_ratio) > 10 ? '#F59E0B' : '#34D399' }}>{s.npl_ratio}%</span>
                    <span style={{ fontSize: 11, color: '#475569', width: 80, textAlign: 'right' }}>{s.total_m}M</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {ews.length > 0 && (
            <Section title="Early Warning System — Click any loan to see XAI decision" color="#F87171">
              <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 80px 80px 90px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Client','Sector','PD %','DPD','Stage','EWS Flag'].map(h => (
                    <span key={h} style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {ews.slice(0, 10).map((r: any, i: number) => (
                  <div key={i} onClick={() => setSelected(r)} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 80px 80px 80px 90px', padding: '11px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(29,158,117,0.06)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                    <span style={{ fontSize: 12, color: '#34D399', fontWeight: 500, textDecoration: 'underline', textDecorationColor: 'rgba(52,211,153,0.3)' }}>{r.Client_Name}</span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{r.Sector}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: Number(r.PD_Score____) > 25 ? '#F87171' : '#F59E0B' }}>{r.PD_Score____}%</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{r.Days_Past_Due}d</span>
                    <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: '#34D399' + (r.IFRS9_Stage === '3' ? '' : '18'), color: r.IFRS9_Stage === '3' ? '#F87171' : r.IFRS9_Stage === '2' ? '#F59E0B' : '#34D399', border: '0.5px solid currentColor' }}>S{r.IFRS9_Stage}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: (EWS_COLOR[r.EWS_Flag] || '#64748B') + '15', color: EWS_COLOR[r.EWS_Flag] || '#64748B', border: '0.5px solid ' + (EWS_COLOR[r.EWS_Flag] || '#64748B') + '40' }}>{r.EWS_Flag}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
      {selected && <XAIPanel loan={selected} onClose={() => setSelected(null)} />}
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </div>
  )
}
