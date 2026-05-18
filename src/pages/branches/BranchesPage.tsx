import { useEffect, useState } from 'react'
import BranchGISMap from '@/components/maps/BranchGISMap'
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


const SPC_COLOR: Record<string,string> = { 'In Control': '#34D399', 'Watch': '#F59E0B', 'Out of Control': '#F87171' }
const sigmaColor = (s: number) => s >= 4 ? '#34D399' : s >= 3 ? '#60A5FA' : s >= 2.5 ? '#F59E0B' : '#F87171'

export default function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [flagged,  setFlagged]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const h = authHeader() as any
    Promise.all([
      fetch('/api/branches/performance', { headers: h }).then(r => r.json()).catch(() => []),
      fetch('/api/branches/flagged',     { headers: h }).then(r => r.json()).catch(() => []),
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
  const ooc      = branches.filter((b: any) => b.SPC_Flag === 'Out of Control').length
  const totalCust= branches.reduce((s: number, b: any) => s + Number(b.Customers_Served || 0), 0)

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin: -24, padding: '20px 24px 24px' }}>
      <GreetingBar />
      {loading && (
        <div style={{ color: '#475569', fontSize: 13, padding: '40px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 16, height: 16, border: '2px solid #1D9E75', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          Loading branch data from BigQuery...
        </div>
      )}
      {!loading && (
        <>
          <Section title="Network Summary" color="#34D399">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
              {[
                { icon:'🏦', label:'Total Branches',     value: String(branches.length || '--'), sub:'across all regions',    accent:'#60A5FA' },
                { icon:'⚙️', label:'Avg Sigma Level',    value: avgSigma,                        sub:'DMAIC process quality', accent:'#34D399' },
                { icon:'✅', label:'Avg SLA Compliance', value: avgSla + '%',                    sub:'service level target',  accent:'#60A5FA' },
                { icon:'🕐', label:'Avg Service Time',   value: avgSvc + ' min',                 sub:'per transaction',       accent:'#F59E0B' },
                { icon:'⚠️', label:'Out-of-Control',     value: String(ooc),                     sub:'need intervention',     accent:'#F87171' },
                { icon:'👥', label:'Customers Served',   value: String(totalCust),               sub:'total today',           accent:'#818CF8' },
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
          <Section title="Branch Performance Map — Cameroon" color="#60A5FA">
            <BranchGISMap branches={branches.filter((b: any) => b.latitude && b.longitude).map((b: any) => ({ branchId: b.Branch_ID, branchName: b.Branch_Name, region: b.Region, city: b.City, sigmaLevel: Number(b.Sigma_Level), spcFlag: b.SPC_Flag, slaCompliance: Number(b.sla_compliance), efficiencyScore: Number(b.efficiency_score || 0), latitude: Number(b.latitude), longitude: Number(b.longitude) }))} height={460} />
          </Section>
          {branches.length > 0 && (
            <Section title="Branch League Table" color="#60A5FA">
              <div style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 90px 80px 120px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                  {['Branch','Region','Sigma','SLA %','Svc Time','ATM %','SPC Flag'].map(h => (
                    <span key={h} style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {branches.map((b: any, i: number) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 70px 80px 90px 80px 120px', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#E2E8F0', fontWeight: 500 }}>{b.Branch_Name}</div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{b.City}</div>
                    </div>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{String(b.Region || '').slice(0,10)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sigmaColor(Number(b.Sigma_Level)) }}>{b.Sigma_Level}</span>
                    <span style={{ fontSize: 12, color: Number(b.sla_compliance) >= 80 ? '#34D399' : '#F59E0B' }}>{b.sla_compliance}%</span>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{b.avg_service_time} min</span>
                    <span style={{ fontSize: 12, color: Number(b.atm_uptime) >= 95 ? '#34D399' : '#F59E0B' }}>{b.atm_uptime}%</span>
                    <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: (SPC_COLOR[b.SPC_Flag] || '#64748B') + '15', color: SPC_COLOR[b.SPC_Flag] || '#64748B', border: '0.5px solid ' + (SPC_COLOR[b.SPC_Flag] || '#64748B') + '40' }}>{b.SPC_Flag}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {flagged.length > 0 && (
            <Section title="Branches Requiring Intervention" color="#F87171">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12 }}>
                {flagged.map((b: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(15,26,40,0.85)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 2 }}>{b.Branch_Name}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{b.City} · {b.Region}</div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '0.5px solid rgba(248,113,113,0.3)' }}>{b.SPC_Flag}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: sigmaColor(Number(b.Sigma_Level)) }}>σ {b.Sigma_Level}</span>
                      <span style={{ fontSize: 11, color: '#64748B' }}>SLA: {b.sla_compliance}%</span>
                    </div>
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
