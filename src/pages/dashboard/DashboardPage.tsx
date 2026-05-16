import { useEffect, useState } from 'react'
import { authHeader } from '@/lib/auth'

interface Summary {
  customers: { avg_churn: number; total: number }
  credit:    { npl_ratio: number; total: number }
  fraud:     { critical: number; sar: number }
  branches:  { avg_sigma: number; avg_sla: number; ooc: number }
}

function KPI({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="kpi-card">
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: color || 'var(--green-600)', marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--subtle)' }}>{sub}</div>}
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
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 4 }}>
        Bank health overview
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
        All regions · Cameroon · Live from BigQuery
      </p>

      {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading live data…</div>}
      {error   && <div style={{ color: 'var(--red)', fontSize: 13 }}>BigQuery: {error}</div>}

      {data && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Customer 360°
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <KPI label="Avg churn probability" value={`${data.customers?.avg_churn ?? '--'}%`} sub="30-day forecast" color="var(--amber)" />
              <KPI label="Total customers" value={String(data.customers?.total ?? '--')} sub="across all regions" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Credit Risk & NPL
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <KPI label="NPL ratio" value={`${data.credit?.npl_ratio ?? '--'}%`} sub="non-performing loans" color="var(--red)" />
              <KPI label="Loan book" value={String(data.credit?.total ?? '--')} sub="active loans" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fraud & AML
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <KPI label="Critical alerts" value={String(data.fraud?.critical ?? '--')} sub="require immediate action" color="var(--red)" />
              <KPI label="SAR required" value={String(data.fraud?.sar ?? '--')} sub="suspicious activity reports" color="var(--amber)" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Branch Operations
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <KPI label="Avg sigma level" value={String(data.branches?.avg_sigma ?? '--')} sub="DMAIC process quality" />
              <KPI label="Avg SLA compliance" value={`${data.branches?.avg_sla ?? '--'}%`} sub="service level target" />
              <KPI label="Out-of-control branches" value={String(data.branches?.ooc ?? '--')} sub="need intervention" color="var(--red)" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
