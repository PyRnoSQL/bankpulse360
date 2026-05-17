import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout, getUser } from '@/lib/auth'

const NAV = [
  { to: '/dashboard', label: '📊', full: 'Overview'      },
  { to: '/customers', label: '👥', full: 'Customer 360°' },
  { to: '/credit',    label: '📈', full: 'Credit & NPL'  },
  { to: '/fraud',     label: '🛡', full: 'Fraud & AML'   },
  { to: '/branches',  label: '🏦', full: 'Branch Ops'    },
]

/* ── Date string (static per second) ────────────────────── */
function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function LiveTime() {
  const now  = useNow()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  return (
    <span style={{
      fontSize: 12, color: 'var(--muted)',
      fontVariantNumeric: 'tabular-nums', letterSpacing: '0.02em',
      fontWeight: 500,
    }}>
      {time}
    </span>
  )
}

function ShortDate() {
  const now  = useNow()
  return now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AppShell() {
  const navigate   = useNavigate()
  const user       = getUser()
  const [collapsed, setCollapsed] = useState(false)
  const [lang,      setLang]      = useState<'EN'|'FR'>('EN')

  const initials = (user?.name || 'AM').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const firstName = (user?.name || 'User').split(' ')[0]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const SIDEBAR_W  = collapsed ? 60 : 228
  const TRANSITION = 'width 0.25s cubic-bezier(0.4,0,0.2,1)'

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, minWidth: SIDEBAR_W,
        background: '#060F1A',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
        overflow: 'hidden',
        transition: TRANSITION,
        borderRight: '0.5px solid rgba(255,255,255,0.06)',
        zIndex: 20,
      }}>

        {/* Logo row + collapse toggle */}
        <div style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          transition: TRANSITION,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg,#1D9E75,#0F6E56)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>B</span>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em' }}>BankPulse 360°</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, letterSpacing: '0.04em' }}>BANKING INTELLIGENCE</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#1D9E75,#0F6E56)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>B</span>
            </div>
          )}
          {/* Toggle button */}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            borderRadius: 6, width: 24, height: 24,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)', fontSize: 11, flexShrink: 0,
            marginLeft: collapsed ? 0 : 4,
          }}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px 10px', transition: TRANSITION }}>
          {NAV.map(({ to, label, full }) => (
            <NavLink key={to} to={to} title={full} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : '9px 12px',
              borderRadius: 8, marginBottom: 3,
              fontSize: collapsed ? 18 : 13,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(29,158,117,0.18)' : 'transparent',
              borderLeft: isActive ? '2px solid #1D9E75' : '2px solid transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}>
              <span style={{ flexShrink: 0 }}>{label}</span>
              {!collapsed && <span style={{ fontSize: 13 }}>{full}</span>}
            </NavLink>
          ))}
        </nav>

        {/* ── User footer block ── */}
        <div style={{
          borderTop: '0.5px solid rgba(255,255,255,0.07)',
          padding: collapsed ? '12px 8px' : '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>

          {/* Language toggle row */}
          {!collapsed && (
            <button onClick={() => setLang(l => l === 'EN' ? 'FR' : 'EN')} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '7px 10px',
              cursor: 'pointer', width: '100%',
              transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 15 }}>🌐</span>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>{lang}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginLeft: 'auto' }}>
                {lang === 'EN' ? 'Switch to FR' : 'Passer en EN'}
              </span>
            </button>
          )}

          {/* User info block */}
          {!collapsed ? (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                {user?.name || 'Demo User'}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.35)', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {user?.role || 'EXECUTIVE'}
              </div>
            </div>
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--green-600)', margin: '0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700,
            }}>
              {initials}
            </div>
          )}

          {/* Logout */}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#E05A5A', fontSize: 13, fontWeight: 500,
            padding: collapsed ? '8px 0' : '6px 4px',
            borderRadius: 6, width: '100%',
            transition: 'opacity 0.15s',
          }}>
            {/* Logout arrow icon */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="#E05A5A" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M10 11l3-3-3-3M13 8H6" stroke="#E05A5A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span>Logout</span>}
          </button>

        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* ── Header: single row ─────────────────────────────── */}
        <header style={{
          background: 'linear-gradient(135deg, #0D1B2A 0%, #0A1F14 100%)',
          borderBottom: '0.5px solid rgba(29,158,117,0.18)',
          position: 'sticky', top: 0, zIndex: 10,
          padding: '8px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
          minHeight: 56,
          boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>

          {/* Left — title + subtitle stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 15, fontWeight: 600, color: '#34D399',
              fontFamily: "'DM Serif Display', serif",
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>
              Bank Health Overview
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.02em' }}>
              All regions · Cameroon
            </span>
          </div>

          {/* Center — platform tagline */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <span style={{
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              Operational Intelligence Platform
            </span>
          </div>

          {/* Right — Live + lang pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-2)',
            border: '0.5px solid var(--border)',
            borderRadius: 20, padding: '4px 12px', flexShrink: 0,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--green-600)', fontWeight: 500 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--green-400)', display: 'inline-block',
                animation: 'livepulse 1.8s ease-in-out infinite',
              }} />
              Live Data
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>|</span>
            <button onClick={() => setLang(l => l === 'EN' ? 'FR' : 'EN')} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', padding: 0,
            }}>
              <span style={{ fontSize: 13 }}>🌐</span>
              {lang}
            </button>
          </div>

        </header>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes livepulse {
          0%,100% { opacity:1; transform:scale(1) }
          50%      { opacity:0.4; transform:scale(0.7) }
        }
      `}</style>
    </div>
  )
}
