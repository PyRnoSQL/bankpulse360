import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'

export function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)
  useEffect(() => {
    if (!target) return
    const start = performance.now()
    const tick = (now: number) => {
      const p    = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setValue(parseFloat((ease * target).toFixed(decimals)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target])
  return value
}

interface KPICardProps {
  icon:      React.ReactNode
  label:     string
  value:     number
  suffix:    string
  decimals:  number
  sub:       string
  accent:    string
  trend:     'up' | 'down' | 'neutral'
  trendVal?: string
  alert?:    boolean
  sigma?:    number
}

export function KPICard({ icon, label, value, suffix, decimals, sub, accent, trend, trendVal, alert, sigma }: KPICardProps) {
  const animated  = useCountUp(value, 1400, decimals)
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
        background:    'rgba(15,26,40,0.9)',
        border:        `1px solid ${alert && blink ? accent : accent + '30'}`,
        borderRadius:  14,
        padding:       '18px 20px',
        position:      'relative',
        overflow:      'hidden',
        transition:    'border-color 0.3s',
        boxShadow:     alert && blink ? `0 0 16px ${accent}40` : 'none',
        cursor:        'default',
      }}>
      <div style={{ position:'absolute', top:-30, right:-30, width:90, height:90, borderRadius:'50%', background:accent, opacity:0.07, filter:'blur(20px)', pointerEvents:'none' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ color:accent, opacity:0.85 }}>{icon}</div>
          <span style={{ fontSize:10, color:'#64748B', fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase' }}>{label}</span>
        </div>
        {alert && (
          <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:9, color:accent, fontWeight:600, letterSpacing:'0.06em', opacity:blink?1:0.3, transition:'opacity 0.3s' }}>
            <AlertTriangle size={10} />ALERT
          </div>
        )}
      </div>
      <div style={{ fontSize:32, fontWeight:700, color:'#F1F5F9', letterSpacing:'-0.03em', lineHeight:1, marginBottom:6, fontVariantNumeric:'tabular-nums' }}>
        {animated}{suffix}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:11, color:'#475569' }}>{sub}</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {sigma !== undefined && (
            <span style={{ fontSize:10, padding:'1px 6px', borderRadius:6, background:'rgba(29,158,117,0.12)', color:'#34D399', border:'0.5px solid rgba(29,158,117,0.3)', fontWeight:600 }}>
              {sigma}σ
            </span>
          )}
          {trendVal && (
            <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color:trendColor, fontWeight:500 }}>
              <TrendIcon size={12} />{trendVal}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
