import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/lib/auth'

function AnimatedBackground() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let raf
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    const orbs = Array.from({ length: 9 }, (_, i) => ({
      x: Math.random()*W, y: Math.random()*H,
      r: 160+Math.random()*220, vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22,
      hue: i%3===0?155:i%3===1?168:145, alpha:0.13+Math.random()*0.10
    }))
    let gridOffset = 0
    function draw() {
      ctx.clearRect(0,0,W,H)
      const bg = ctx.createLinearGradient(0,0,W,H)
      bg.addColorStop(0,'#040F0A'); bg.addColorStop(0.5,'#06160F'); bg.addColorStop(1,'#021008')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      gridOffset=(gridOffset+0.2)%60
      ctx.strokeStyle='rgba(29,158,117,0.12)'; ctx.lineWidth=0.8
      for(let x=-60+gridOffset;x<W+60;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=-60+gridOffset;y<H+60;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      orbs.forEach(o=>{
        o.x+=o.vx; o.y+=o.vy
        if(o.x<-o.r)o.x=W+o.r; if(o.x>W+o.r)o.x=-o.r
        if(o.y<-o.r)o.y=H+o.r; if(o.y>H+o.r)o.y=-o.r
        const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r)
        g.addColorStop(0,'hsla('+o.hue+',70%,42%,'+o.alpha+')')
        g.addColorStop(0.5,'hsla('+o.hue+',60%,28%,'+(o.alpha*0.4)+')')
        g.addColorStop(1,'transparent')
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill()
      })
      ctx.strokeStyle='rgba(29,158,117,0.18)'; ctx.lineWidth=1.2
      for(let i=0;i<5;i++){
        const t=(Date.now()/8000+i*0.2)%1
        const x=t*(W+400)-200
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x-200,H); ctx.stroke()
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize)}
  },[])
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0}} />
}

const TICKERS = [
  {label:'NPL Ratio',value:'5.8%',delta:'+0.2'},
  {label:'Avg Sigma',value:'2.84',delta:'-0.1'},
  {label:'Portfolio',value:'312M FCFA',delta:'+4.1'},
  {label:'Fraud Alerts',value:'4',delta:'+1'},
  {label:'SLA Compliance',value:'72.4%',delta:'-1.2'},
]

function MetricTicker() {
  const [idx,setIdx]=useState(0); const [fade,setFade]=useState(true)
  useEffect(()=>{
    const id=setInterval(()=>{setFade(false);setTimeout(()=>{setIdx(i=>(i+1)%TICKERS.length);setFade(true)},300)},2800)
    return()=>clearInterval(id)
  },[])
  const t=TICKERS[idx]; const up=t.delta.startsWith('+')||t.delta==='0'
  return(
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'6px 14px',borderRadius:20,background:'rgba(29,158,117,0.08)',border:'0.5px solid rgba(29,158,117,0.2)',transition:'opacity 0.3s',opacity:fade?1:0}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:'#1D9E75',flexShrink:0,display:'inline-block'}}/>
      <span style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{t.label}</span>
      <span style={{fontSize:12,fontWeight:600,color:'#fff',fontFamily:'monospace'}}>{t.value}</span>
      <span style={{fontSize:10,color:up?'#1D9E75':'#E24B4A'}}>{t.delta!=='0'?t.delta:'--'}</span>
    </div>
  )
}

export default function LoginPage() {
  const [userId,setUserId]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const [pwdVisible,setPwdVisible]=useState(false)
  const navigate=useNavigate()

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(userId,password); navigate('/dashboard',{replace:true}) }
    catch(err) { setError(err.message||'Login failed') }
    finally { setLoading(false) }
  }

  const inp = {width:'100%',padding:'13px 14px 13px 38px',fontSize:14,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'#fff',outline:'none',fontFamily:'inherit',transition:'border-color 0.2s',boxSizing:'border-box'}

  return (
    <>
      <AnimatedBackground />
      <style>{\`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(29,158,117,0.3)}50%{box-shadow:0 0 40px rgba(29,158,117,0.6)}} .bp-input::placeholder{color:rgba(255,255,255,0.2)!important} .bp-input:focus{border-color:rgba(29,158,117,0.6)!important;background:rgba(29,158,117,0.06)!important} .bp-btn:hover:not(:disabled){transform:translateY(-1px)}\`}</style>
      <div style={{position:'relative',zIndex:1,minHeight:'100vh',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>
        <div style={{position:'fixed',top:0,left:0,right:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px',borderBottom:'0.5px solid rgba(255,255,255,0.06)',background:'rgba(4,15,10,0.8)',backdropFilter:'blur(12px)',zIndex:10,flexWrap:'wrap',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#1D9E75,#0F6E56)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{color:'#fff',fontSize:14,fontWeight:700}}>B</span>
            </div>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:15,color:'#fff'}}>BankPulse 360</span>
          </div>
          <MetricTicker />
          <div id="weather-clock" style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.55)'}}>Cameroon - CEMAC Region</div>
          </div>
        </div>
        <div style={{width:'100%',maxWidth:420,marginTop:40}}>
          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{width:68,height:68,borderRadius:19,margin:'0 auto 18px',background:'linear-gradient(145deg,#1D9E75 0%,#0F6E56 60%,#04342C 100%)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 48px rgba(29,158,117,0.4)',animation:'pulse 3s ease-in-out infinite'}}>
              <span style={{color:'#fff',fontSize:32,fontWeight:700,lineHeight:1}}>B</span>
            </div>
            <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:30,fontWeight:400,color:'#fff',margin:'0 0 6px',letterSpacing:'-0.02em'}}>BankPulse 360</h1>
            <p style={{fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Operational Intelligence Platform</p>
          </div>
          <div style={{background:'rgba(255,255,255,0.04)',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:22,padding:'32px 32px 28px',backdropFilter:'blur(24px)',boxShadow:'0 32px 72px rgba(0,0,0,0.6)'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L4 7v9c0 7 5.4 13.5 12 15 6.6-1.5 12-8 12-15V7L16 2z" fill="rgba(29,158,117,0.18)" stroke="rgba(29,158,117,0.6)" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M11 16l3.5 3.5 6.5-7" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.45)',marginBottom:7,letterSpacing:'0.07em',textTransform:'uppercase'}}>User ID</label>
                <input className="bp-input" value={userId} onChange={e=>setUserId(e.target.value)} placeholder="Enter your User ID" required autoFocus style={inp} />
              </div>
              <div style={{marginBottom:24}}>
                <label style={{display:'block',fontSize:11,fontWeight:500,color:'rgba(255,255,255,0.45)',marginBottom:7,letterSpacing:'0.07em',textTransform:'uppercase'}}>Password</label>
                <div style={{position:'relative'}}>
                  <input className="bp-input" type={pwdVisible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required style={{...inp,paddingRight:44}} />
                  <button type="button" onClick={()=>setPwdVisible(v=>!v)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.3)',fontSize:14,padding:3,lineHeight:1}}>{pwdVisible?'hide':'show'}</button>
                </div>
              </div>
              {error&&<div style={{padding:'10px 14px',borderRadius:9,marginBottom:18,background:'rgba(226,75,74,0.12)',border:'0.5px solid rgba(226,75,74,0.3)',color:'#F09595',fontSize:13}}>{error}</div>}
              <button type="submit" disabled={loading} className="bp-btn" style={{width:'100%',padding:14,borderRadius:11,background:loading?'rgba(29,158,117,0.25)':'linear-gradient(135deg,#1D9E75 0%,#0F6E56 100%)',color:'#fff',fontSize:14,fontWeight:600,border:'0.5px solid rgba(29,158,117,0.35)',cursor:loading?'not-allowed':'pointer',boxShadow:'0 4px 20px rgba(29,158,117,0.3)',transition:'all 0.2s'}}>
                {loading?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:9}}><span style={{width:14,height:14,border:'2px solid rgba(255,255,255,0.25)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.75s linear infinite'}}/>Authenticating...</span>:'Sign in'}
              </button>
            </form>
          </div>
          <div style={{marginTop:22,display:'flex',alignItems:'center',justifyContent:'center',gap:20,flexWrap:'wrap'}}>
            {['TLS 1.3','JWT Auth','CEMAC Compliant'].map(t=><span key={t} style={{fontSize:10,color:'rgba(255,255,255,0.22)'}}>{t}</span>)}
          </div>
        </div>
      </div>
    </>
  )
}
