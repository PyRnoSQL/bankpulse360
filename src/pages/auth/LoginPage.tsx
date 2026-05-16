import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/lib/auth'

/* ── Animated background canvas ─────────────────────────── */
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width  = window.innerWidth
    let H = canvas.height = window.innerHeight
    let raf: number

    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    /* Floating orbs */
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  120 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      hue: i % 2 === 0 ? 160 : 175,
      alpha: 0.045 + Math.random() * 0.04,
    }))

    /* Moving grid lines */
    let gridOffset = 0

    function draw() {
      ctx.clearRect(0, 0, W, H)

      /* Deep gradient base */
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0,   '#040F0A')
      bg.addColorStop(0.5, '#06160F')
      bg.addColorStop(1,   '#021008')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      /* Subtle grid */
      gridOffset = (gridOffset + 0.15) % 60
      ctx.strokeStyle = 'rgba(29,158,117,0.04)'
      ctx.lineWidth   = 0.5
      for (let x = -60 + gridOffset; x < W + 60; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = -60 + gridOffset; y < H + 60; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }

      /* Orbs */
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy
        if (o.x < -o.r) o.x = W + o.r
        if (o.x > W + o.r) o.x = -o.r
        if (o.y < -o.r) o.y = H + o.r
        if (o.y > H + o.r) o.y = -o.r
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r)
        g.addColorStop(0,   `hsla(${o.hue},70%,42%,${o.alpha})`)
        g.addColorStop(0.5, `hsla(${o.hue},60%,28%,${o.alpha * 0.4})`)
        g.addColorStop(1,   'transparent')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fill()
      })

      /* Subtle diagonal data lines */
      ctx.strokeStyle = 'rgba(29,158,117,0.06)'
      ctx.lineWidth   = 0.5
      for (let i = 0; i < 5; i++) {
        const t = (Date.now() / 8000 + i * 0.2) % 1
        const x = t * (W + 400) - 200
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x - 200, H)
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0,
    }} />
  )
}

/* ── Metric ticker ───────────────────────────────────────── */
const TICKERS = [
  { label: 'NPL Ratio',        value: '5.8%',   delta: '+0.2' },
  { label: 'Avg Sigma Level',  value: '2.84',   delta: '-0.1' },
  { label: 'Credit Portfolio', value: '312M',   delta: '+4.1' },
  { label: 'Active Branches',  value: '20',     delta: '0'    },
  { label: 'Fraud Alerts',     value: '4',      delta: '+1'   },
  { label: 'Digital Adoption', value: '53%',    delta: '+3'   },
  { label: 'SLA Compliance',   value: '72.4%',  delta: '-1.2' },
  { label: 'Customer CLV',     value: '11.2M',  delta: '+0.8' },
]

function MetricTicker() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => { setIdx(i => (i + 1) % TICKERS.length); setFade(true) }, 300)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const t = TICKERS[idx]
  const up = t.delta.startsWith('+') || t.delta === '0'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 14px', borderRadius: 20,
      background: 'rgba(29,158,117,0.08)',
      border: '0.5px solid rgba(29,158,117,0.2)',
      transition: 'opacity 0.3s',
      opacity: fade ? 1 : 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>
        {t.label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
        {t.value}
      </span>
      <span style={{ fontSize: 10, color: up ? '#1D9E75' : '#E24B4A' }}>
        {t.delta !== '0' ? t.delta : '—'}
      </span>
    </div>
  )
}

/* ── Main login page ─────────────────────────────────────── */
export default function LoginPage() {
  const [userId,   setUserId]   = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [pwdVisible, setPwdVisible] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(userId, password)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 14px', fontSize: 14,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, background 0.2s',
  }

  return (
    <>
      <AnimatedBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', width: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}>

        {/* Top bar */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(4,15,10,0.7)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'linear-gradient(135deg,#1D9E75,#0F6E56)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>B</span>
            </div>
            <span style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: 15, color: '#fff', letterSpacing: '-0.01em',
            }}>
              BankPulse 360°
            </span>
          </div>
          <MetricTicker />
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Cameroon · CEMAC Region
          </div>
        </div>

        {/* Main card */}
        <div style={{
          width: '100%', maxWidth: 420, marginTop: 20,
        }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, margin: '0 auto 18px',
              background: 'linear-gradient(145deg,#1D9E75 0%,#0F6E56 60%,#04342C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(29,158,117,0.35), 0 0 0 1px rgba(29,158,117,0.2)',
            }}>
              <span style={{ color: '#fff', fontSize: 30, fontWeight: 700, lineHeight: 1 }}>B</span>
            </div>
            <h1 style={{
              fontFamily: "'DM Serif Display',serif",
              fontSize: 28, fontWeight: 400, color: '#fff',
              margin: '0 0 6px', letterSpacing: '-0.02em',
            }}>
              BankPulse 360°
            </h1>
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Operational Intelligence Platform
            </p>
          </div>

          {/* Glass card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '32px 32px 28px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>

            <div style={{ marginBottom: 22, textAlign: 'center' }}>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Secure Sign In
              </span>
            </div>

            <form onSubmit={handleSubmit}>

              {/* User ID */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  User ID
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.25)', fontSize: 15, pointerEvents: 'none',
                  }}>
                    ⊙
                  </span>
                  <input
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder="Enter your User ID"
                    required autoFocus
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(29,158,117,0.6)'; e.target.style.background = 'rgba(29,158,117,0.06)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.25)', fontSize: 15, pointerEvents: 'none',
                  }}>
                    ◈
                  </span>
                  <input
                    type={pwdVisible ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    style={{ ...inputStyle, paddingLeft: 36, paddingRight: 42 }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(29,158,117,0.6)'; e.target.style.background = 'rgba(29,158,117,0.06)' }}
                    onBlur={e =>  { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setPwdVisible(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: 2,
                    }}
                  >
                    {pwdVisible ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 9, marginBottom: 18,
                  background: 'rgba(226,75,74,0.12)',
                  border: '0.5px solid rgba(226,75,74,0.3)',
                  color: '#F09595', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10,
                  background: loading
                    ? 'rgba(29,158,117,0.3)'
                    : 'linear-gradient(135deg,#1D9E75 0%,#0F6E56 100%)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  border: '0.5px solid rgba(29,158,117,0.4)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.03em',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(29,158,117,0.3)',
                  transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Authenticating…
                  </span>
                ) : 'Sign in →'}
              </button>

            </form>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: 24, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            {['🔒 TLS 1.3', '🛡 JWT Auth', '🏦 CEMAC Compliant'].map(t => (
              <span key={t} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
                {t}
              </span>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>
            © 2025 Analytix Engineering · BankPulse 360° · All rights reserved
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(29,158,117,0.08) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </>
  )
}
