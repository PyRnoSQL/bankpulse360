import { useEffect, useState, useRef } from 'react'
import { authHeader } from '@/lib/auth'
import { motion } from 'framer-motion'
import { FileText, Download, BarChart2, AlertTriangle, TrendingUp, Shield, Building2, RefreshCw } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'

function Section({ title, color, children }: { title:string; color:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
        <div style={{ width:3, height:18, borderRadius:2, background:color }} />
        <span style={{ fontSize:11, fontWeight:600, color:'#94A3B8', letterSpacing:'0.08em', textTransform:'uppercase' }}>{title}</span>
        <div style={{ flex:1, height:'0.5px', background:color+'25' }} />
      </div>
      {children}
    </div>
  )
}

const REPORTS = [
  { name:'COBAC Prudential Report',     period:'Q1 2025', status:'Ready',    format:'PDF+Excel', color:'#34D399' },
  { name:'IFRS 9 ECL Summary',          period:'May 2025', status:'Ready',   format:'Excel',     color:'#34D399' },
  { name:'NPL Exposure by Sector',      period:'May 2025', status:'Ready',   format:'PDF',       color:'#34D399' },
  { name:'Branch Performance Report',   period:'May 2025', status:'Ready',   format:'Excel+PPT', color:'#34D399' },
  { name:'AML Suspicious Activity',     period:'May 2025', status:'Pending', format:'PDF',       color:'#F59E0B' },
  { name:'Capital Adequacy Ratio',      period:'Q1 2025', status:'Ready',    format:'PDF',       color:'#34D399' },
  { name:'Liquidity Coverage Ratio',    period:'May 2025', status:'Draft',   format:'Excel',     color:'#60A5FA' },
  { name:'BEAC Statutory Return',       period:'Q1 2025', status:'Ready',    format:'XML+PDF',   color:'#34D399' },
]

const TICKER_ITEMS = [
  '🟢 Loan LN-2024-1421 APPROVED — Essama Electronics · 19.2M FCFA',
  '🔴 FRAUD ALERT — ALT-2025-0167 · Critical · Mvondo Claire · 12.4M FCFA',
  '🟡 EWS FLAG — LN-2023-0567 · Stage 3 · Fotso Agritech · Bafoussam',
  '🟢 Branch Bastos SLA 96% — In Control · σ 4.3',
  '🔴 SAR FILED — ALT-2025-0041 · Layering · 4.85M FCFA · Douala',
  '🟢 Policy POL-2025-10041 RENEWED — Nkemdirim Adaeze · 25M coverage',
  '🟡 NPL WATCH — Agriculture sector · 35.2% NPL ratio · action required',
  '🟢 BigQuery sync OK — 20 branches · 20 loans · 20 alerts · live',
]

export default function ReportingPage() {
  const [data, setData]     = useState<any>(null)
  const [ticker, setTicker] = useState(0)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing]   = useState(false)

  useEffect(() => {
    loadData()
    const id = setInterval(loadData, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTicker(t => (t+1) % TICKER_ITEMS.length), 3000)
    return () => clearInterval(id)
  }, [])

  function loadData() {
    setRefreshing(true)
    const h = authHeader() as any
    fetch('/api/dashboard/summary', { headers: h })
      .then(r => r.json())
      .then(d => { setData(d); setLastRefresh(new Date()); setRefreshing(false) })
      .catch(() => setRefreshing(false))
  }

  return (
    <div style={{ minHeight:'100%', background:'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin:-24, padding:'20px 24px 32px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, paddingBottom:16, borderBottom:'0.5px solid rgba(255,255,255,0.07)', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:11, color:'#64748B', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>Executive Intelligence</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#F1F5F9' }}>Institutional Reporting Center</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:10, color:'#334155' }}>Last refresh: {lastRefresh.toLocaleTimeString()}</div>
          <button onClick={loadData} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8, background:'rgba(255,255,255,0.06)', border:'0.5px solid rgba(255,255,255,0.1)', color:'#94A3B8', cursor:'pointer', fontSize:11, fontFamily:'inherit' }}>
            <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}/> Refresh
          </button>
        </div>
      </div>

      {/* Live ticker */}
      <div style={{ marginBottom:24, padding:'10px 16px', borderRadius:10, background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:10, fontWeight:700, color:'#34D399', letterSpacing:'0.08em', flexShrink:0 }}>● LIVE</span>
          <motion.div key={ticker} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.4 }}
            style={{ fontSize:12, color:'#94A3B8', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {TICKER_ITEMS[ticker]}
          </motion.div>
        </div>
      </div>

      {/* Executive KPIs from live BigQuery */}
      {data && (
        <Section title="Executive Dashboard — Live BigQuery Data" color="#60A5FA">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:12 }}>
            <KPICard icon={<TrendingUp size={14}/>}    label="NPL Ratio"          value={data.credit?.npl_ratio ?? 0}   suffix="%" decimals={1} sub="non-performing loans"  accent="#F87171" trend="down" trendVal="above 5%" alert={(data.credit?.npl_ratio??0)>5} />
            <KPICard icon={<BarChart2 size={14}/>}     label="Total Customers"    value={data.customers?.total ?? 0}    suffix=""  decimals={0} sub="portfolio size"          accent="#818CF8" trend="neutral" />
            <KPICard icon={<AlertTriangle size={14}/>} label="Critical Fraud"     value={data.fraud?.critical ?? 0}     suffix=""  decimals={0} sub="immediate action"        accent="#F87171" trend="down" alert={(data.fraud?.critical??0)>0} />
            <KPICard icon={<Shield size={14}/>}        label="SAR Pending"        value={data.fraud?.sar ?? 0}          suffix=""  decimals={0} sub="regulatory reports"      accent="#FB923C" trend="neutral" />
            <KPICard icon={<Building2 size={14}/>}     label="Avg Sigma"          value={data.branches?.avg_sigma ?? 0} suffix="σ" decimals={2} sub="branch quality"          accent="#34D399" trend="up" sigma={data.branches?.avg_sigma??0} />
            <KPICard icon={<TrendingUp size={14}/>}    label="Avg SLA"            value={data.branches?.avg_sla ?? 0}   suffix="%" decimals={1} sub="service level"           accent="#60A5FA" trend="neutral" trendVal="target 90%" />
          </div>
        </Section>
      )}

      {/* Reporting Center */}
      <Section title="Regulatory Reporting Center — One-Click Export" color="#34D399">
        <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 120px 140px 160px 120px', padding:'10px 16px', background:'rgba(10,18,32,0.99)', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
            {['Report Name','Period','Status','Format','Export'].map(h => (
              <span key={h} style={{ fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.07em', textTransform:'uppercase' }}>{h}</span>
            ))}
          </div>
          {REPORTS.map((r,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 120px 140px 160px 120px', padding:'11px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.04)', alignItems:'center', transition:'background 0.12s' }}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(52,211,153,0.04)'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <FileText size={13} color="#475569"/>
                <span style={{ fontSize:12, color:'#E2E8F0', fontWeight:500 }}>{r.name}</span>
              </div>
              <span style={{ fontSize:11, color:'#64748B' }}>{r.period}</span>
              <span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:600, background:r.color+'15', color:r.color, width:'fit-content' }}>{r.status}</span>
              <span style={{ fontSize:11, color:'#475569', fontFamily:'monospace' }}>{r.format}</span>
              <button onClick={() => alert('Demo: ' + r.name + ' export triggered')}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, background: r.status==='Ready'?'rgba(52,211,153,0.12)':'rgba(255,255,255,0.05)', border:'0.5px solid '+(r.status==='Ready'?'rgba(52,211,153,0.3)':'rgba(255,255,255,0.08)'), color: r.status==='Ready'?'#34D399':'#475569', cursor: r.status==='Ready'?'pointer':'not-allowed', fontSize:11, fontFamily:'inherit' }}>
                <Download size={11}/>{r.status==='Ready'?'Export':'Pending'}
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Branch Intelligence */}
      <Section title="Branch Intelligence Explorer" color="#60A5FA">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
          {[
            { name:'Bastos',          region:'Centre',       sigma:4.3, sla:96, npl:'Low',    spc:'In Control' },
            { name:'Akwa Plateau',    region:'Littoral',     sigma:4.1, sla:94, npl:'Low',    spc:'In Control' },
            { name:'Bafoussam Centre',region:'Ouest',        sigma:2.3, sla:68, npl:'High',   spc:'Out of Control' },
            { name:'Maroua Domayo',   region:'Extrême-Nord', sigma:2.0, sla:58, npl:'High',   spc:'Out of Control' },
            { name:'Garoua Plateau',  region:'Nord',         sigma:2.8, sla:74, npl:'Medium', spc:'Watch' },
            { name:'Ngousso',         region:'Centre',       sigma:2.8, sla:76, npl:'Medium', spc:'Watch' },
          ].map((b,i) => {
            const sc = b.spc==='In Control'?'#34D399':b.spc==='Watch'?'#F59E0B':'#F87171'
            const nc = b.npl==='Low'?'#34D399':b.npl==='Medium'?'#F59E0B':'#F87171'
            return (
              <motion.div key={i} whileHover={{ scale:1.02, boxShadow:`0 0 20px ${sc}20` }} transition={{ duration:0.2 }}
                style={{ background:'rgba(15,26,40,0.9)', border:`1px solid ${sc}28`, borderRadius:14, padding:'16px', cursor:'default' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#F1F5F9' }}>{b.name}</div>
                    <div style={{ fontSize:10, color:'#475569' }}>{b.region}</div>
                  </div>
                  <span style={{ padding:'2px 7px', borderRadius:6, fontSize:9, fontWeight:700, background:sc+'15', color:sc }}>{b.spc}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div><div style={{ fontSize:9, color:'#64748B', marginBottom:2 }}>SIGMA</div><div style={{ fontSize:18, fontWeight:700, color:sc }}>{b.sigma}σ</div></div>
                  <div><div style={{ fontSize:9, color:'#64748B', marginBottom:2 }}>SLA</div><div style={{ fontSize:18, fontWeight:700, color:b.sla>=90?'#34D399':b.sla>=75?'#F59E0B':'#F87171' }}>{b.sla}%</div></div>
                </div>
                <div style={{ marginTop:10, height:4, background:'rgba(255,255,255,0.06)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:(b.sigma/6*100)+'%', background:sc, borderRadius:2, transition:'width 0.8s ease' }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </Section>

      <style dangerouslySetInnerHTML={{ __html:'@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </div>
  )
}
