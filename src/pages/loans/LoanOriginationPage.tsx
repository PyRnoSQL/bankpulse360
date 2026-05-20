import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, User, DollarSign, BarChart2, Shield, CheckCircle, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react'

/* ── Helpers ─────────────────────────────────────────── */
function genLoanID() {
  return 'LN-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*9000)+1000)
}
function calcInstallment(amount: number, rateAnnual: number, tenorMonths: number) {
  if (!amount || !tenorMonths) return 0
  const r = rateAnnual / 100 / 12
  if (r === 0) return amount / tenorMonths
  return (amount * r * Math.pow(1+r, tenorMonths)) / (Math.pow(1+r, tenorMonths) - 1)
}
function riskScore(pd: number, coverage: number, dti: number) {
  const score = Math.max(0, Math.min(100, 100 - pd*1.5 - Math.max(0, dti-40)*0.8 + Math.min(coverage,150)*0.2))
  return Math.round(score)
}

/* ── Step indicators ─────────────────────────────────── */
const STEPS = ['Customer Identity','Loan Details','Financial Assessment','Approval Workflow']

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center', flex: i < STEPS.length-1 ? 1 : 0 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, background: i < current ? '#1D9E75' : i === current ? 'linear-gradient(135deg,#1D9E75,#0F6E56)' : 'rgba(255,255,255,0.06)', color: i <= current ? '#fff' : '#475569', border: i === current ? '2px solid #34D399' : '1px solid rgba(255,255,255,0.1)', boxShadow: i === current ? '0 0 12px rgba(29,158,117,0.4)' : 'none', transition:'all 0.3s' }}>
              {i < current ? <CheckCircle size={16}/> : i+1}
            </div>
            <span style={{ fontSize:9, color: i === current ? '#34D399' : i < current ? '#1D9E75' : '#334155', fontWeight: i === current ? 700 : 400, whiteSpace:'nowrap', letterSpacing:'0.04em', textTransform:'uppercase' }}>{s}</span>
          </div>
          {i < STEPS.length-1 && <div style={{ flex:1, height:2, background: i < current ? '#1D9E75' : 'rgba(255,255,255,0.06)', margin:'0 8px', marginBottom:22, transition:'background 0.3s' }} />}
        </div>
      ))}
    </div>
  )
}

/* ── Risk Gauge ──────────────────────────────────────── */
function RiskGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#34D399' : score >= 45 ? '#F59E0B' : '#F87171'
  const label = score >= 70 ? 'LOW RISK' : score >= 45 ? 'MEDIUM RISK' : 'HIGH RISK'
  const angle = (score / 100) * 180 - 90
  return (
    <div style={{ textAlign:'center', padding:'16px 0' }}>
      <svg width="160" height="90" viewBox="0 0 160 90">
        <path d="M10 80 A70 70 0 0 1 150 80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round"/>
        <path d="M10 80 A70 70 0 0 1 150 80" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(score/100)*220} 220`} style={{ transition:'stroke-dasharray 0.8s ease, stroke 0.5s' }}/>
        <g transform={`rotate(${angle}, 80, 80)`}>
          <line x1="80" y1="80" x2="80" y2="18" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="80" cy="80" r="5" fill={color}/>
        </g>
        <text x="80" y="72" textAnchor="middle" fill="#F1F5F9" fontSize="22" fontWeight="700">{score}</text>
      </svg>
      <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:'0.08em', marginTop:4 }}>{label}</div>
      <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>Credit Risk Score</div>
    </div>
  )
}

/* ── Field component ─────────────────────────────────── */
function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ marginBottom:14, width: half ? 'calc(50% - 6px)' : '100%' }}>
      <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#64748B', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

const inp = { width:'100%', padding:'9px 12px', fontSize:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#F1F5F9', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const, transition:'border-color 0.2s' }
const sel = { ...inp, cursor:'pointer' }

/* ── Main page ───────────────────────────────────────── */
export default function LoanOriginationPage() {
  const [step, setStep]   = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm]   = useState({
    loanId: genLoanID(), cifId:'', fullName:'', nationalId:'', phone:'', email:'', branch:'Bastos', rm:'', sector:'Commerce',
    loanType:'SME Loan', amount:0, currency:'FCFA', interestRate:12.5, tenor:24, gracePeriod:0, repayFreq:'Monthly', collateralType:'Real Estate', collateralValue:0,
    monthlyRevenue:0, monthlyExpenses:0, existingLoans:0, employerName:'', analystNotes:'', recommendation:'Approve', decision:'Pending',
  })

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  const installment  = calcInstallment(form.amount, form.interestRate, form.tenor)
  const dti          = form.monthlyRevenue > 0 ? (installment / form.monthlyRevenue) * 100 : 0
  const coverage     = form.collateralValue > 0 && form.amount > 0 ? (form.collateralValue / form.amount) * 100 : 0
  const pdEst        = Math.min(95, Math.max(2, 60 - coverage*0.15 + dti*0.4 + (form.existingLoans > 0 ? 10 : 0)))
  const score        = riskScore(pdEst, coverage, dti)
  const riskLabel    = score >= 70 ? 'Low Risk' : score >= 45 ? 'Medium Risk' : 'High Risk'
  const riskColor    = score >= 70 ? '#34D399' : score >= 45 ? '#F59E0B' : '#F87171'

  if (submitted) return (
    <div style={{ minHeight:'100%', background:'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin:-24, padding:'40px 24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(29,158,117,0.15)', border:'2px solid #1D9E75', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 40px rgba(29,158,117,0.3)' }}>
          <CheckCircle size={40} color="#34D399"/>
        </div>
        <div style={{ fontSize:24, fontWeight:700, color:'#F1F5F9', marginBottom:8 }}>Loan Application Submitted</div>
        <div style={{ fontSize:13, color:'#64748B', marginBottom:4 }}>Loan ID: <span style={{ color:'#60A5FA', fontFamily:'monospace', fontWeight:600 }}>{form.loanId}</span></div>
        <div style={{ fontSize:13, color:'#64748B', marginBottom:24 }}>Risk Score: <span style={{ color:riskColor, fontWeight:700 }}>{score} — {riskLabel}</span></div>
        <div style={{ padding:'16px 20px', borderRadius:12, background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.2)', marginBottom:24, fontSize:12, color:'#94A3B8', lineHeight:1.6 }}>
          Estimated Monthly Installment: <strong style={{ color:'#F1F5F9' }}>{installment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')} FCFA</strong><br/>
          DTI Ratio: <strong style={{ color: dti > 40 ? '#F87171' : '#34D399' }}>{dti.toFixed(1)}%</strong> · Coverage: <strong style={{ color: coverage >= 80 ? '#34D399' : '#F59E0B' }}>{coverage.toFixed(0)}%</strong>
        </div>
        <button onClick={() => { setSubmitted(false); setStep(0); setForm(f => ({ ...f, loanId: genLoanID() })) }}
          style={{ padding:'10px 28px', borderRadius:10, background:'linear-gradient(135deg,#1D9E75,#0F6E56)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>
          New Application
        </button>
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight:'100%', background:'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin:-24, padding:'20px 24px 32px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, color:'#64748B', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>Credit Risk & NPL</div>
        <div style={{ fontSize:20, fontWeight:700, color:'#F1F5F9' }}>Intelligent Loan Origination</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, alignItems:'start' }}>

        {/* ── LEFT: Form ── */}
        <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24 }}>
          <StepBar current={step} />

          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>

            {step === 0 && (
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.07em' }}>Step 1 — Customer Identity</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                  <Field label="Loan ID (Auto-generated)" half><input style={{ ...inp, color:'#60A5FA', fontFamily:'monospace' }} value={form.loanId} readOnly /></Field>
                  <Field label="CIF / Customer ID" half><input style={inp} value={form.cifId} onChange={e=>set('cifId',e.target.value)} placeholder="e.g. CL-10041" /></Field>
                  <Field label="Full Name"><input style={inp} value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Customer full name" /></Field>
                  <Field label="National ID / Passport" half><input style={inp} value={form.nationalId} onChange={e=>set('nationalId',e.target.value)} placeholder="ID number" /></Field>
                  <Field label="Phone" half><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+237 6XX XXX XXX" /></Field>
                  <Field label="Email"><input style={inp} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="customer@email.com" /></Field>
                  <Field label="Branch" half>
                    <select style={sel} value={form.branch} onChange={e=>set('branch',e.target.value)}>
                      {['Bastos','Akwa Plateau','Bonabéri','Bafoussam Centre','Garoua Plateau','Maroua Domayo','Limbé Centre','Ngousso'].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </Field>
                  <Field label="Relationship Manager" half><input style={inp} value={form.rm} onChange={e=>set('rm',e.target.value)} placeholder="RM name" /></Field>
                  <Field label="Sector of Activity">
                    <select style={sel} value={form.sector} onChange={e=>set('sector',e.target.value)}>
                      {['Commerce','Agriculture','Transport','Real Estate','Services','Industry','Livestock','Education'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.07em' }}>Step 2 — Loan Details</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                  <Field label="Loan Type" half>
                    <select style={sel} value={form.loanType} onChange={e=>set('loanType',e.target.value)}>
                      {['SME Loan','Agri Loan','Consumer Loan','Mortgage','Overdraft','Trade Finance'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Currency" half>
                    <select style={sel} value={form.currency} onChange={e=>set('currency',e.target.value)}>
                      {['FCFA','USD','EUR'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Amount Requested"><input style={inp} type="number" value={form.amount||''} onChange={e=>set('amount',Number(e.target.value))} placeholder="e.g. 5000000" /></Field>
                  <Field label="Interest Rate (% p.a.)" half><input style={inp} type="number" step="0.1" value={form.interestRate} onChange={e=>set('interestRate',Number(e.target.value))} /></Field>
                  <Field label="Tenor (months)" half><input style={inp} type="number" value={form.tenor} onChange={e=>set('tenor',Number(e.target.value))} /></Field>
                  <Field label="Grace Period (months)" half><input style={inp} type="number" value={form.gracePeriod} onChange={e=>set('gracePeriod',Number(e.target.value))} /></Field>
                  <Field label="Repayment Frequency" half>
                    <select style={sel} value={form.repayFreq} onChange={e=>set('repayFreq',e.target.value)}>
                      {['Monthly','Quarterly','Semi-Annual','Annual'].map(f=><option key={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Collateral Type" half>
                    <select style={sel} value={form.collateralType} onChange={e=>set('collateralType',e.target.value)}>
                      {['Real Estate','Vehicle','Equipment','Cash Deposit','Guarantee','Inventory'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Collateral Value (FCFA)"><input style={inp} type="number" value={form.collateralValue||''} onChange={e=>set('collateralValue',Number(e.target.value))} placeholder="e.g. 8000000" /></Field>
                </div>
                {installment > 0 && (
                  <div style={{ marginTop:12, padding:'12px 16px', borderRadius:10, background:'rgba(29,158,117,0.08)', border:'1px solid rgba(29,158,117,0.2)', display:'flex', gap:20, flexWrap:'wrap' }}>
                    <div><div style={{ fontSize:10, color:'#64748B', marginBottom:3 }}>MONTHLY INSTALLMENT</div><div style={{ fontSize:18, fontWeight:700, color:'#34D399' }}>{installment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')} FCFA</div></div>
                    <div><div style={{ fontSize:10, color:'#64748B', marginBottom:3 }}>COVERAGE RATIO</div><div style={{ fontSize:18, fontWeight:700, color: coverage>=80?'#34D399':coverage>=60?'#F59E0B':'#F87171' }}>{coverage.toFixed(0)}%</div></div>
                    <div><div style={{ fontSize:10, color:'#64748B', marginBottom:3 }}>TOTAL REPAYMENT</div><div style={{ fontSize:18, fontWeight:700, color:'#F1F5F9' }}>{(installment*form.tenor).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')} FCFA</div></div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.07em' }}>Step 3 — Financial Assessment</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                  <Field label="Monthly Revenue (FCFA)" half><input style={inp} type="number" value={form.monthlyRevenue||''} onChange={e=>set('monthlyRevenue',Number(e.target.value))} placeholder="e.g. 800000" /></Field>
                  <Field label="Monthly Expenses (FCFA)" half><input style={inp} type="number" value={form.monthlyExpenses||''} onChange={e=>set('monthlyExpenses',Number(e.target.value))} placeholder="e.g. 350000" /></Field>
                  <Field label="Existing Loan Balance (FCFA)"><input style={inp} type="number" value={form.existingLoans||''} onChange={e=>set('existingLoans',Number(e.target.value))} placeholder="0 if none" /></Field>
                  <Field label="Employer / Business Name"><input style={inp} value={form.employerName} onChange={e=>set('employerName',e.target.value)} placeholder="Employer or business" /></Field>
                </div>
                {form.monthlyRevenue > 0 && (
                  <div style={{ marginTop:12, padding:'12px 16px', borderRadius:10, background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize:11, color:'#64748B', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Debt-to-Income Ratio</div>
                    <div style={{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                      <motion.div animate={{ width: Math.min(dti, 100)+'%' }} transition={{ duration:0.8 }} style={{ height:'100%', borderRadius:4, background: dti>40?'#F87171':dti>25?'#F59E0B':'#34D399' }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
                      <span style={{ fontSize:11, fontWeight:700, color: dti>40?'#F87171':dti>25?'#F59E0B':'#34D399' }}>DTI: {dti.toFixed(1)}%</span>
                      <span style={{ fontSize:10, color:'#475569' }}>Threshold: 40%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#94A3B8', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.07em' }}>Step 4 — Approval Workflow</div>
                <Field label="Credit Analyst Notes">
                  <textarea style={{ ...inp, height:100, resize:'vertical' }} value={form.analystNotes} onChange={e=>set('analystNotes',e.target.value)} placeholder="Enter analysis observations, risk factors, mitigants..." />
                </Field>
                <Field label="Approval Recommendation" half>
                  <select style={sel} value={form.recommendation} onChange={e=>set('recommendation',e.target.value)}>
                    {['Approve','Approve with Conditions','Refer to Credit Committee','Decline'].map(r=><option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Risk Committee Decision" half>
                  <select style={sel} value={form.decision} onChange={e=>set('decision',e.target.value)}>
                    {['Pending','Approved','Conditionally Approved','Declined'].map(d=><option key={d}>{d}</option>)}
                  </select>
                </Field>
                <div style={{ marginTop:8, padding:'14px 16px', borderRadius:10, background: score>=70?'rgba(52,211,153,0.08)':score>=45?'rgba(245,158,11,0.08)':'rgba(248,113,113,0.08)', border:'1px solid '+(score>=70?'rgba(52,211,153,0.25)':score>=45?'rgba(245,158,11,0.25)':'rgba(248,113,113,0.25)') }}>
                  <div style={{ fontSize:11, color:'#94A3B8', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Risk Assessment Summary</div>
                  <div style={{ fontSize:12, color:'#CBD5E1', lineHeight:1.6 }}>
                    Loan <span style={{ color:'#60A5FA', fontFamily:'monospace' }}>{form.loanId}</span> for <strong>{form.fullName||'[Customer]'}</strong> in the {form.sector} sector.<br/>
                    Estimated PD: <span style={{ color: pdEst>25?'#F87171':'#34D399', fontWeight:600 }}>{pdEst.toFixed(1)}%</span> · DTI: <span style={{ color: dti>40?'#F87171':'#34D399', fontWeight:600 }}>{dti.toFixed(1)}%</span> · Coverage: <span style={{ color: coverage>=80?'#34D399':'#F59E0B', fontWeight:600 }}>{coverage.toFixed(0)}%</span><br/>
                    Recommendation: <span style={{ color:riskColor, fontWeight:700 }}>{form.recommendation}</span>
                  </div>
                </div>
              </div>
            )}

          </motion.div>

          {/* Navigation buttons */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
            <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color: step===0?'#334155':'#94A3B8', cursor: step===0?'not-allowed':'pointer', fontSize:12, fontFamily:'inherit' }}>
              <ChevronLeft size={14}/>Previous
            </button>
            {step < 3
              ? <button onClick={() => setStep(s => s+1)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:9, background:'linear-gradient(135deg,#1D9E75,#0F6E56)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit' }}>
                  Next<ChevronRight size={14}/>
                </button>
              : <button onClick={() => setSubmitted(true)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 24px', borderRadius:9, background:'linear-gradient(135deg,#1D9E75,#0F6E56)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', boxShadow:'0 4px 16px rgba(29,158,117,0.35)' }}>
                  <CheckCircle size={14}/>Submit Application
                </button>
            }
          </div>
        </div>

        {/* ── RIGHT: Analytics Sidebar ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Risk Gauge */}
          <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 12px' }}>
            <RiskGauge score={score} />
          </div>

          {/* Eligibility Meter */}
          <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:'#64748B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Eligibility Meter</div>
            {[
              { label:'Collateral Coverage', val: Math.min(coverage, 100), good:80 },
              { label:'DTI Ratio', val: Math.max(0, 100-dti), good:60 },
              { label:'PD Score', val: Math.max(0, 100-pdEst), good:70 },
            ].map(m => (
              <div key={m.label} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'#94A3B8' }}>{m.label}</span>
                  <span style={{ fontSize:11, fontWeight:600, color: m.val>=m.good?'#34D399':'#F59E0B' }}>{m.val.toFixed(0)}%</span>
                </div>
                <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                  <motion.div animate={{ width: m.val+'%' }} transition={{ duration:0.7 }} style={{ height:'100%', borderRadius:3, background: m.val>=m.good?'#34D399':'#F59E0B' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Repayment Simulator */}
          <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:'#64748B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Repayment Simulator</div>
            <div style={{ fontSize:22, fontWeight:700, color:'#34D399', fontVariantNumeric:'tabular-nums', marginBottom:4 }}>
              {installment > 0 ? installment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',') : '--'} FCFA
            </div>
            <div style={{ fontSize:10, color:'#475569', marginBottom:12 }}>estimated monthly payment</div>
            <div style={{ fontSize:10, color:'#64748B', marginBottom:4 }}>Adjust Tenor</div>
            <input type="range" min={6} max={120} value={form.tenor} onChange={e=>set('tenor',Number(e.target.value))} style={{ width:'100%', accentColor:'#1D9E75' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#334155', marginTop:3 }}>
              <span>6 mo</span><span style={{ color:'#60A5FA', fontWeight:600 }}>{form.tenor} mo</span><span>120 mo</span>
            </div>
          </div>

          {/* Risk Badge */}
          <div style={{ background:'rgba(15,26,40,0.9)', border:`1px solid ${riskColor}30`, borderRadius:14, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:10, color:'#64748B', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Risk Level</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:20, background:riskColor+'18', border:`1px solid ${riskColor}40` }}>
              {score < 45 && <AlertTriangle size={13} color={riskColor}/>}
              {score >= 70 && <CheckCircle size={13} color={riskColor}/>}
              <span style={{ fontSize:13, fontWeight:700, color:riskColor }}>{riskLabel}</span>
            </div>
            <div style={{ fontSize:10, color:'#475569', marginTop:8 }}>PD Est: {pdEst.toFixed(1)}% · Sector: {form.sector}</div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html:'@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </div>
  )
}
