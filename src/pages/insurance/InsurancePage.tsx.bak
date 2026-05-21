import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, AlertTriangle, TrendingUp, CheckCircle, ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'

function genPolicyID() {
  return 'POL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*90000)+10000)
}

const inp = { width:'100%', padding:'9px 12px', fontSize:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#F1F5F9', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }
const sel = { ...inp, cursor:'pointer' }

function Field({ label, children, half }: { label:string; children:React.ReactNode; half?:boolean }) {
  return (
    <div style={{ marginBottom:14, width: half?'calc(50% - 6px)':'100%' }}>
      <label style={{ display:'block', fontSize:10, fontWeight:600, color:'#64748B', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

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

const POLICIES = [
  { id:'POL-2025-10041', name:'Nkemdirim Adaeze', type:'Life', coverage:25000000, premium:85000, status:'Active', risk:'Low', expiry:'2027-04-12' },
  { id:'POL-2025-10078', name:'Mbouombouo Serge', type:'Property', coverage:45000000, premium:120000, status:'Active', risk:'Low', expiry:'2026-09-03' },
  { id:'POL-2025-10134', name:'Hamidou Fatime',   type:'Health', coverage:5000000,  premium:25000,  status:'Lapsed', risk:'High', expiry:'2025-02-28' },
  { id:'POL-2025-10192', name:'Essomba Claude',   type:'SME',    coverage:80000000, premium:210000, status:'Active', risk:'Medium', expiry:'2027-11-15' },
  { id:'POL-2025-10215', name:'Ngono Brigitte',   type:'Life',   coverage:10000000, premium:45000,  status:'Pending', risk:'Medium', expiry:'2028-06-20' },
]

export default function InsurancePage() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    policyId: genPolicyID(), fullName:'', dob:'', gender:'F', phone:'', email:'', beneficiary:'', nationalId:'',
    insuranceType:'Life', coverageAmount:0, premium:0, startDate:'', endDate:'', paymentFreq:'Monthly',
    claimHistory:'None', fraudFlags:'None', analystNotes:'',
  })
  function set(k:string, v:any) { setForm(f => ({ ...f, [k]:v })) }

  const premiumEst = form.coverageAmount > 0
    ? Math.round(form.coverageAmount * (form.insuranceType==='Life'?0.004:form.insuranceType==='Health'?0.006:0.003))
    : 0

  const STEPS = ['Policyholder','Policy Details','Claims & Risk','Summary']

  if (submitted) return (
    <div style={{ minHeight:'100%', background:'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin:-24, padding:'60px 24px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:'center', maxWidth:440 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(129,140,248,0.15)', border:'2px solid #818CF8', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 0 40px rgba(129,140,248,0.3)' }}>
          <Shield size={40} color="#818CF8"/>
        </div>
        <div style={{ fontSize:22, fontWeight:700, color:'#F1F5F9', marginBottom:8 }}>Policy Created Successfully</div>
        <div style={{ fontSize:13, color:'#64748B', marginBottom:20 }}>Policy ID: <span style={{ color:'#818CF8', fontFamily:'monospace', fontWeight:600 }}>{form.policyId}</span></div>
        <button onClick={() => { setSubmitted(false); setStep(0); setForm(f => ({ ...f, policyId:genPolicyID() })) }}
          style={{ padding:'10px 28px', borderRadius:10, background:'linear-gradient(135deg,#818CF8,#534AB7)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:600 }}>
          New Policy
        </button>
      </motion.div>
    </div>
  )

  return (
    <div style={{ minHeight:'100%', background:'linear-gradient(160deg,#060F1A 0%,#0A1628 40%,#06120E 100%)', margin:-24, padding:'20px 24px 32px' }}>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:11, color:'#64748B', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>Insurance Module</div>
        <div style={{ fontSize:20, fontWeight:700, color:'#F1F5F9' }}>Insurance Portfolio & Policy Management</div>
      </div>

      <Section title="Portfolio KPIs" color="#818CF8">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:12, marginBottom:4 }}>
          <KPICard icon={<Shield size={14}/>}        label="Active Policies"   value={3}    suffix=""  decimals={0} sub="in force"             accent="#818CF8" trend="up" trendVal="+2 this month" />
          <KPICard icon={<TrendingUp size={14}/>}    label="Premium Volume"    value={485}  suffix="K" decimals={0} sub="FCFA monthly"         accent="#34D399" trend="up" trendVal="+8% MoM" />
          <KPICard icon={<FileText size={14}/>}      label="Claims Ratio"      value={18.4} suffix="%" decimals={1} sub="loss ratio"            accent="#F59E0B" trend="neutral" trendVal="target <25%" />
          <KPICard icon={<AlertTriangle size={14}/>} label="Pending Claims"    value={2}    suffix=""  decimals={0} sub="awaiting assessment"   accent="#FB923C" trend="neutral" alert />
          <KPICard icon={<Users size={14}/>}         label="High-Risk Clients" value={1}    suffix=""  decimals={0} sub="fraud indicators"      accent="#F87171" trend="down" alert />
          <KPICard icon={<CheckCircle size={14}/>}   label="Renewal Rate"      value={87}   suffix="%" decimals={0} sub="client retention"      accent="#34D399" trend="up" trendVal="+3% YoY" />
        </div>
      </Section>

      <Section title="Policy Register" color="#818CF8">
        <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(129,140,248,0.2)', borderRadius:14, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'rgba(10,18,32,0.99)' }}>
                  {['Policy ID','Policyholder','Type','Coverage (FCFA)','Premium/mo','Status','Risk','Expiry'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#64748B', letterSpacing:'0.07em', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.1)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {POLICIES.map((p,i) => {
                  const sc = p.status==='Active'?'#34D399':p.status==='Lapsed'?'#F87171':'#F59E0B'
                  const rc = p.risk==='Low'?'#34D399':p.risk==='Medium'?'#F59E0B':'#F87171'
                  return (
                    <tr key={i} style={{ borderBottom:'0.5px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='rgba(129,140,248,0.05)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
                      <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:10, color:'#818CF8' }}>{p.id}</td>
                      <td style={{ padding:'9px 14px', fontSize:12, color:'#F1F5F9', fontWeight:500 }}>{p.name}</td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:'#94A3B8' }}>{p.type}</td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:'#E2E8F0', fontVariantNumeric:'tabular-nums', textAlign:'right' }}>{p.coverage.toLocaleString()}</td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:'#34D399', fontVariantNumeric:'tabular-nums', textAlign:'right' }}>{p.premium.toLocaleString()}</td>
                      <td style={{ padding:'9px 14px' }}><span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:600, background:sc+'15', color:sc }}>{p.status}</span></td>
                      <td style={{ padding:'9px 14px' }}><span style={{ padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:600, background:rc+'15', color:rc }}>{p.risk}</span></td>
                      <td style={{ padding:'9px 14px', fontSize:11, color:'#64748B' }}>{p.expiry}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <Section title="New Policy — Step-by-Step Form" color="#818CF8">
        <div style={{ background:'rgba(15,26,40,0.9)', border:'1px solid rgba(129,140,248,0.2)', borderRadius:16, padding:24 }}>
          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:24 }}>
            {STEPS.map((s,i) => (
              <div key={s} style={{ display:'flex', alignItems:'center', flex: i<STEPS.length-1?1:0 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: i<step?'#818CF8':i===step?'linear-gradient(135deg,#818CF8,#534AB7)':'rgba(255,255,255,0.06)', color: i<=step?'#fff':'#475569', border: i===step?'2px solid #AFA9EC':'1px solid rgba(255,255,255,0.1)', transition:'all 0.3s' }}>
                    {i<step?<CheckCircle size={14}/>:i+1}
                  </div>
                  <span style={{ fontSize:9, color:i===step?'#AFA9EC':'#334155', fontWeight:i===step?700:400, whiteSpace:'nowrap', textTransform:'uppercase', letterSpacing:'0.04em' }}>{s}</span>
                </div>
                {i<STEPS.length-1 && <div style={{ flex:1, height:2, background:i<step?'#818CF8':'rgba(255,255,255,0.06)', margin:'0 8px', marginBottom:20, transition:'background 0.3s' }} />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.25 }}>
            {step===0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                <Field label="Policy ID" half><input style={{ ...inp, color:'#818CF8', fontFamily:'monospace' }} value={form.policyId} readOnly /></Field>
                <Field label="Gender" half><select style={sel} value={form.gender} onChange={e=>set('gender',e.target.value)}><option value="F">Female</option><option value="M">Male</option></select></Field>
                <Field label="Full Name"><input style={inp} value={form.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Policyholder full name" /></Field>
                <Field label="Date of Birth" half><input style={inp} type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} /></Field>
                <Field label="National ID" half><input style={inp} value={form.nationalId} onChange={e=>set('nationalId',e.target.value)} placeholder="ID number" /></Field>
                <Field label="Phone" half><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+237 6XX XXX XXX" /></Field>
                <Field label="Email" half><input style={inp} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@example.com" /></Field>
                <Field label="Beneficiary"><input style={inp} value={form.beneficiary} onChange={e=>set('beneficiary',e.target.value)} placeholder="Beneficiary full name" /></Field>
              </div>
            )}
            {step===1 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                <Field label="Insurance Type" half><select style={sel} value={form.insuranceType} onChange={e=>set('insuranceType',e.target.value)}>{['Life','Health','Property','Vehicle','SME','Agriculture'].map(t=><option key={t}>{t}</option>)}</select></Field>
                <Field label="Payment Frequency" half><select style={sel} value={form.paymentFreq} onChange={e=>set('paymentFreq',e.target.value)}>{['Monthly','Quarterly','Semi-Annual','Annual'].map(f=><option key={f}>{f}</option>)}</select></Field>
                <Field label="Coverage Amount (FCFA)"><input style={inp} type="number" value={form.coverageAmount||''} onChange={e=>set('coverageAmount',Number(e.target.value))} placeholder="e.g. 25000000" /></Field>
                <Field label="Start Date" half><input style={inp} type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} /></Field>
                <Field label="End Date" half><input style={inp} type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} /></Field>
                {premiumEst > 0 && (
                  <div style={{ width:'100%', padding:'12px 16px', borderRadius:10, background:'rgba(129,140,248,0.08)', border:'1px solid rgba(129,140,248,0.2)' }}>
                    <div style={{ fontSize:10, color:'#64748B', marginBottom:4 }}>ESTIMATED PREMIUM</div>
                    <div style={{ fontSize:22, fontWeight:700, color:'#818CF8' }}>{premiumEst.toLocaleString()} FCFA / {form.paymentFreq.toLowerCase()}</div>
                  </div>
                )}
              </div>
            )}
            {step===2 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                <Field label="Prior Claim History">
                  <select style={sel} value={form.claimHistory} onChange={e=>set('claimHistory',e.target.value)}>
                    {['None','1 Claim','2-3 Claims','4+ Claims','Disputed Claim'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Fraud Risk Indicators">
                  <select style={sel} value={form.fraudFlags} onChange={e=>set('fraudFlags',e.target.value)}>
                    {['None','Multiple policies','Late disclosure','Document anomaly','High-risk region'].map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Analyst Notes">
                  <textarea style={{ ...inp, height:80, resize:'vertical' }} value={form.analystNotes} onChange={e=>set('analystNotes',e.target.value)} placeholder="Risk observations, mitigants, recommendations..." />
                </Field>
                <div style={{ width:'100%', padding:'12px 16px', borderRadius:10, background: form.fraudFlags!=='None'?'rgba(248,113,113,0.08)':'rgba(52,211,153,0.08)', border:'1px solid '+(form.fraudFlags!=='None'?'rgba(248,113,113,0.25)':'rgba(52,211,153,0.2)') }}>
                  <div style={{ fontSize:11, fontWeight:600, color: form.fraudFlags!=='None'?'#F87171':'#34D399' }}>
                    {form.fraudFlags!=='None' ? '⚠ Fraud indicators detected — escalate for review' : '✓ No fraud indicators — standard processing applies'}
                  </div>
                </div>
              </div>
            )}
            {step===3 && (
              <div style={{ padding:'4px 0' }}>
                <div style={{ fontSize:13, color:'#94A3B8', marginBottom:16 }}>Review policy details before submission:</div>
                {[
                  ['Policy ID', form.policyId, '#818CF8'],
                  ['Policyholder', form.fullName||'—', '#F1F5F9'],
                  ['Insurance Type', form.insuranceType, '#94A3B8'],
                  ['Coverage', form.coverageAmount ? form.coverageAmount.toLocaleString()+' FCFA' : '—', '#F1F5F9'],
                  ['Est. Premium', premiumEst ? premiumEst.toLocaleString()+' FCFA/'+form.paymentFreq.toLowerCase() : '—', '#34D399'],
                  ['Claim History', form.claimHistory, '#94A3B8'],
                  ['Fraud Flags', form.fraudFlags, form.fraudFlags!=='None'?'#F87171':'#34D399'],
                ].map(([k,v,c]) => (
                  <div key={k as string} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize:12, color:'#64748B' }}>{k}</span>
                    <span style={{ fontSize:12, color: c as string, fontWeight:500 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24 }}>
            <button onClick={() => setStep(s=>Math.max(0,s-1))} disabled={step===0}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:9, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:step===0?'#334155':'#94A3B8', cursor:step===0?'not-allowed':'pointer', fontSize:12, fontFamily:'inherit' }}>
              <ChevronLeft size={14}/>Previous
            </button>
            {step<3
              ? <button onClick={() => setStep(s=>s+1)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:9, background:'linear-gradient(135deg,#818CF8,#534AB7)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit' }}>
                  Next<ChevronRight size={14}/>
                </button>
              : <button onClick={() => setSubmitted(true)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 24px', borderRadius:9, background:'linear-gradient(135deg,#818CF8,#534AB7)', border:'none', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', boxShadow:'0 4px 16px rgba(129,140,248,0.35)' }}>
                  <CheckCircle size={14}/>Issue Policy
                </button>
            }
          </div>
        </div>
      </Section>
    </div>
  )
}
