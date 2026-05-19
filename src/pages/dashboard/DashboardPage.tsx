import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { authHeader } from '@/lib/auth'
import { KPISkeletonGrid } from '@/components/ui/SkeletonCard'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Users, Building2, Shield, Activity } from 'lucide-react'

interface Summary {
  customers: { avg_churn: number; total: number }
  credit:    { npl_ratio: number; total: number }
  fraud:     { critical: number; sar: number }
  branches:  { avg_sigma: number; avg_sla: number; ooc: number }
}

/* ── Animated count-up hook ─────────────────────────────── */
function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (!target) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(parseFloat((ease * target).toFixed(decimals)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  return value
}

/* ── Single animated KPI card ───────────────────────────── */
interface KPIProps {
  icon:       React.ReactNode
  label:      string
  value:      number
  suffix:     string
  decimals:   number
  sub:        string
  accent:     string
  trend:      'up' | 'down' | 'neutral'
  trendVal?:  string
  alert?:     boolean
  sigma?:     number
}

function KPICard({ icon, label, value, suffix, decimals, sub, accent, trend, trendVal, alert, sigma }: KPIProps) {
  const animated = useCountUp(value, 1400, decimals)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    if (!alert) return
    const id = setInterval(() => setBlink(b => !b), 900)
    return () => clearInterval(id)
  }, [alert])

  const trendColor = trend === 'up' ? '#34D399' : trend === 'down' ? '#F87171' : '#94A3B8'
  const TrendIcon  = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: `0 0 24px ${accent}30` }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'rgba(15,26,40,0.9)',
        border: `1px solid ${alert && blink ? accent : accent + '30'}`,
        borderRadius: 14,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.3s',
        boxShadow: alert && blink ? `0 0 16px ${accent}40` : 'none',
        cursor: 'default',
      }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', background: accent, opacity: 0.07, filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ color: accent, opacity: 0.85 }}>{icon}</div>
          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        {alert && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: accent, fontWeight: 600, letterSpacing: '0.06em', opacity: blink ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            <AlertTriangle size={10} />ALERT
          </div>
        )}
      </div>

      <div style={{ fontSize: 32, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
        {animated}{suffix}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#475569' }}>{sub}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {sigma !== undefined && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 6, background: 'rgba(29,158,117,0.12)', color: '#34D399', border: '0.5px solid rgba(29,158,117,0.3)', fontWeight: 600 }}>
              {sigma}σ
            </span>
          )}
          {trendVal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: trendColor, fontWeight: 500 }}>
              <TrendIcon size={12} />{trendVal}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Section header ─────────────────────────────────────── */
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: '0.5px', background: color + '20' }} />
    </div>
  )
}

/* ── ECharts mini sparkline ─────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ec = (window as any).echarts
    if (!ec || !ref.current) return
    const chart = ec.init(ref.current, null, { renderer: 'svg' })
    chart.setOption({
      animation: true,
      grid: { top: 2, bottom: 2, left: 2, right: 2 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data,
        smooth: true,
        symbol: 'none',
        lineStyle: { color, width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + '40' }, { offset: 1, color: color + '00' }] } },
      }]
    })
    return () => chart.dispose()
  }, [data, color])
  return <div ref={ref} style={{ width: '100%', height: 50, marginTop: 8 }} />
}

/* ── Main page ──────────────────────────────────────────── */
export default function DashboardPage() {
  const [data,    setData]    = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [echartsLoaded, setEchartsLoaded] = useState(!!(window as any).echarts)

  useEffect(() => {
    fetch('/api/dashboard/summary', { headers: authHeader() as any })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))

    if (!(window as any).echarts) {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
      s.onload = () => setEchartsLoaded(true)
      document.head.appendChild(s)
    }
  }, [])

  return (
    <div style={{ minHeight: '100%', background: 'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin: -24, padding: '20px 24px 32px' }}>

      {/* Greeting bar */}
      <GreetingBar />

      {loading && (
        <div>
          <KPISkeletonGrid count={4} />
          <KPISkeletonGrid count={4} />
          <KPISkeletonGrid count={4} />
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Customer 360 */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader icon={<Users size={14} />} label="Customer 360°" color="#818CF8" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              <KPICard icon={<Activity size={15}/>} label="Avg Churn Probability" value={data.customers?.avg_churn ?? 0} suffix="%" decimals={1} sub="30-day rolling forecast" accent="#F59E0B" trend="down" trendVal="high risk" alert={(data.customers?.avg_churn ?? 0) > 25} />
              <KPICard icon={<Users size={15}/>} label="Total Customers" value={data.customers?.total ?? 0} suffix="" decimals={0} sub="across all regions" accent="#818CF8" trend="neutral" />
              <KPICard icon={<TrendingUp size={15}/>} label="Digital Adoption" value={53} suffix="%" decimals={0} sub="mobile banking active" accent="#34D399" trend="up" trendVal="+3% MoM" />
              <KPICard icon={<Activity size={15}/>} label="Avg NPS Score" value={6.8} suffix="" decimals={1} sub="net promoter score" accent="#60A5FA" trend="neutral" trendVal="target: 8.0" />
            </div>
            {echartsLoaded && <Sparkline data={[22,26,28,24,30,29,28.4]} color="#818CF8" />}
          </div>

          {/* Credit Risk */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader icon={<TrendingDown size={14} />} label="Credit Risk & NPL" color="#F87171" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              <KPICard icon={<AlertTriangle size={15}/>} label="NPL Ratio" value={data.credit?.npl_ratio ?? 0} suffix="%" decimals={1} sub="non-performing loans" accent="#F87171" trend="down" trendVal="above 5% threshold" alert={(data.credit?.npl_ratio ?? 0) > 5} />
              <KPICard icon={<Activity size={15}/>} label="Loan Book" value={data.credit?.total ?? 0} suffix="" decimals={0} sub="active loan accounts" accent="#60A5FA" trend="neutral" />
              <KPICard icon={<Shield size={15}/>} label="ECL Coverage" value={68} suffix="%" decimals={0} sub="provision coverage ratio" accent="#F59E0B" trend="up" trendVal="improving" />
              <KPICard icon={<AlertTriangle size={15}/>} label="EWS Alerts" value={5} suffix="" decimals={0} sub="high / critical flags" accent="#F87171" trend="down" trendVal="action needed" alert />
            </div>
            {echartsLoaded && <Sparkline data={[4.2,4.8,5.1,5.5,5.8,5.9,5.8]} color="#F87171" />}
          </div>

          {/* Fraud */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader icon={<Shield size={14} />} label="Fraud & AML" color="#FB923C" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              <KPICard icon={<AlertTriangle size={15}/>} label="Critical Alerts" value={data.fraud?.critical ?? 0} suffix="" decimals={0} sub="immediate action required" accent="#F87171" trend="down" trendVal="this week" alert={(data.fraud?.critical ?? 0) > 0} />
              <KPICard icon={<Activity size={15}/>} label="SAR Required" value={data.fraud?.sar ?? 0} suffix="" decimals={0} sub="suspicious activity reports" accent="#FB923C" trend="neutral" trendVal="pending" />
              <KPICard icon={<TrendingDown size={15}/>} label="Avg MTTD" value={18} suffix=" min" decimals={0} sub="mean time to detect" accent="#34D399" trend="down" trendVal="target < 15 min" />
              <KPICard icon={<Shield size={15}/>} label="SIM Swap Alerts" value={3} suffix="" decimals={0} sub="within 48h of transaction" accent="#F59E0B" trend="neutral" />
            </div>
          </div>

          {/* Branches */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader icon={<Building2 size={14} />} label="Branch Operations" color="#34D399" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
              <KPICard icon={<Building2 size={15}/>} label="Avg Sigma Level" value={data.branches?.avg_sigma ?? 0} suffix="" decimals={2} sub="DMAIC process quality" accent="#34D399" trend="up" trendVal="target: 4.0" sigma={data.branches?.avg_sigma ?? 0} />
              <KPICard icon={<Activity size={15}/>} label="Avg SLA Compliance" value={data.branches?.avg_sla ?? 0} suffix="%" decimals={1} sub="service level target" accent="#60A5FA" trend="neutral" trendVal="target: 90%" />
              <KPICard icon={<AlertTriangle size={15}/>} label="Out-of-Control" value={data.branches?.ooc ?? 0} suffix="" decimals={0} sub="branches need intervention" accent="#F87171" trend="down" trendVal="SPC flagged" alert={(data.branches?.ooc ?? 0) > 3} />
              <KPICard icon={<Building2 size={15}/>} label="Total Branches" value={20} suffix="" decimals={0} sub="across 9 regions" accent="#818CF8" trend="neutral" />
            </div>
            {echartsLoaded && <Sparkline data={[3.1,2.9,2.8,2.84,2.9,2.85,2.84]} color="#34D399" />}
          </div>
        </motion.div>
      )}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes spin{to{transform:rotate(360deg)}} @keyframes livePing{0%,100%{opacity:1;box-shadow:0 0 6px #34D399}50%{opacity:0.4;box-shadow:0 0 14px #34D399}}` }} />
    </div>
  )
}

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
