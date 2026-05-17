import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'

interface Summary {
  customers: { avg_churn: number; total: number }
  credit:    { npl_ratio: number; total: number }
  fraud:     { critical: number; sar: number }
  branches:  { avg_sigma: number; avg_sla: number; ooc: number }
}

/* ── Themed KPI card ─────────────────────────────────────── */
interface KPIProps {
  label:   string
  value:   string
  sub?:    string
  icon:    string
  accent:  string   // CSS color
  trend?:  'up' | 'down' | 'neutral'
  trendLabel?: string
}

function KPICard({ label, value, sub, icon, accent, trend, trendLabel }: KPIProps) {
  const trendColor = trend === 'up' ? '#34D399' : trend === 'down' ? '#F87171' : '#94A3B8'
  const trendIcon  = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'
  return (
    <div style={{
      background: 'rgba(15,26,40,0.85)',
      border: `1px solid ${accent}28`,
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      backdropFilter: 'blur(8px)',
      boxShadow: `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${accent}40`
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`
    }}>
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 90, height: 90, borderRadius: '50%',
        background: accent, opacity: 0.08, filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{
          fontSize: 18, width: 34, height: 34, borderRadius: 9,
          background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </span>
      </div>
      {/* Value */}
      <div style={{ fontSize: 30, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {sub && <span style={{ fontSize: 11, color: '#64748B' }}>{sub}</span>}
        {trend && trendLabel && (
          <span style={{ fontSize: 11, color: trendColor, fontWeight: 500 }}>
            {trendIcon} {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Section header ──────────────────────────────────────── */
function SectionHeader({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '0.5px', background: `${color}20`, marginLeft: 4 }} />
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
/* ── Greeting + clock bar ───────────────────────────────── */
function GreetingBar() {
  const user = (() => {
    try {
      const t = localStorage.getItem('bp360_token')
      if (!t) return null
      return JSON.parse(atob(t.split('.')[1]))
    } catch { return null }
  })()
  const firstName = (user?.name || 'User').split(' ')[0]

  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 24, paddingBottom: 16,
      borderBottom: '0.5px solid rgba(255,255,255,0.07)',
    }}>
      {/* Left — greeting + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>👋</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#34D399', whiteSpace: 'nowrap' }}>
          Hello, {firstName}!
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>—</span>
        <span style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap' }}>
          {date}
        </span>
      </div>
      {/* Right — live clock */}
      <span style={{
        fontSize: 13, color: '#64748B',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em', fontWeight: 500,
      }}>
        {time}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [data,    setData]    = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetch('/api/dashboard/summary', { headers: authHeader() as any })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  return (
    <div style={{
      minHeight: '100%',
      background: 'linear-gradient(160deg, #060F1A 0%, #0A1628 40%, #06120E 100%)',
      margin: -24, padding: '20px 24px 24px',
    }}>

      {/* ── Greeting bar ── */}
      <GreetingBar />



      {/* ── States ── */}
      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          color: '#475569', fontSize: 13, padding: '40px 0',
        }}>
          <span style={{
            width: 16, height: 16, border: '2px solid #1D9E75',
            borderTopColor: 'transparent', borderRadius: '50%',
            display: 'inline-block', animation: 'dashspin 0.8s linear infinite',
          }} />
          Loading live data from BigQuery…
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          background: 'rgba(248,113,113,0.08)',
          border: '0.5px solid rgba(248,113,113,0.25)',
          color: '#FCA5A5', fontSize: 13,
        }}>
          ⚠ BigQuery: {error}
        </div>
      )}

      {/* ── KPI sections ── */}
      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Customer 360° */}
          <div>
            <SectionHeader icon="👥" label="Customer 360°" color="#818CF8" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <KPICard
                icon="📉" label="Avg Churn Probability"
                value={`${data.customers?.avg_churn ?? '--'}%`}
                sub="30-day rolling forecast"
                accent="#F59E0B"
                trend="up" trendLabel="vs last period"
              />
              <KPICard
                icon="👤" label="Total Customers"
                value={String(data.customers?.total ?? '--')}
                sub="across all regions"
                accent="#818CF8"
                trend="neutral" trendLabel="stable"
              />
              <KPICard
                icon="📱" label="Digital Adoption"
                value="53%"
                sub="mobile banking active"
                accent="#34D399"
                trend="up" trendLabel="+3% this month"
              />
              <KPICard
                icon="⭐" label="Avg NPS Score"
                value="6.8"
                sub="net promoter score"
                accent="#60A5FA"
                trend="neutral" trendLabel="target: 8.0"
              />
            </div>
          </div>

          {/* Credit Risk */}
          <div>
            <SectionHeader icon="📈" label="Credit Risk & NPL" color="#F87171" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <KPICard
                icon="⚠️" label="NPL Ratio"
                value={`${data.credit?.npl_ratio ?? '--'}%`}
                sub="non-performing loans"
                accent="#F87171"
                trend="down" trendLabel="above threshold"
              />
              <KPICard
                icon="📋" label="Active Loan Book"
                value={String(data.credit?.total ?? '--')}
                sub="total loan accounts"
                accent="#60A5FA"
                trend="neutral" trendLabel="stable"
              />
              <KPICard
                icon="🛡" label="ECL Coverage"
                value="68%"
                sub="provision coverage ratio"
                accent="#F59E0B"
                trend="up" trendLabel="improving"
              />
              <KPICard
                icon="🚨" label="EWS Alerts"
                value="5"
                sub="early warning flags"
                accent="#F87171"
                trend="down" trendLabel="high/critical"
              />
            </div>
          </div>

          {/* Fraud & AML */}
          <div>
            <SectionHeader icon="🛡" label="Fraud & AML" color="#FB923C" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <KPICard
                icon="🔴" label="Critical Alerts"
                value={String(data.fraud?.critical ?? '--')}
                sub="immediate action required"
                accent="#F87171"
                trend="down" trendLabel="this week"
              />
              <KPICard
                icon="📄" label="SAR Required"
                value={String(data.fraud?.sar ?? '--')}
                sub="suspicious activity reports"
                accent="#FB923C"
                trend="neutral" trendLabel="pending"
              />
              <KPICard
                icon="⚡" label="Avg MTTD"
                value="18 min"
                sub="mean time to detect"
                accent="#34D399"
                trend="up" trendLabel="target < 15 min"
              />
              <KPICard
                icon="🌍" label="Cross-Border Alerts"
                value="5"
                sub="international transactions"
                accent="#818CF8"
                trend="neutral" trendLabel="monitored"
              />
            </div>
          </div>

          {/* Branch Operations */}
          <div>
            <SectionHeader icon="🏦" label="Branch Operations" color="#34D399" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <KPICard
                icon="⚙️" label="Avg Sigma Level"
                value={String(data.branches?.avg_sigma ?? '--')}
                sub="DMAIC process quality"
                accent="#34D399"
                trend="up" trendLabel="target: 4.0"
              />
              <KPICard
                icon="✅" label="Avg SLA Compliance"
                value={`${data.branches?.avg_sla ?? '--'}%`}
                sub="service level target"
                accent="#60A5FA"
                trend="neutral" trendLabel="target: 90%"
              />
              <KPICard
                icon="🔴" label="Out-of-Control"
                value={String(data.branches?.ooc ?? '--')}
                sub="branches need intervention"
                accent="#F87171"
                trend="down" trendLabel="SPC flagged"
              />
              <KPICard
                icon="🕐" label="Avg Service Time"
                value="14.1 min"
                sub="teller transaction time"
                accent="#F59E0B"
                trend="up" trendLabel="above target"
              />
            </div>
          </div>

        </div>
      )}

      <style>{`
        @keyframes dashspin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
