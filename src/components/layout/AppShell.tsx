import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout, getUser } from '@/lib/auth'

const NAV = [
  { to: '/dashboard', label: '📊 Overview'      },
  { to: '/customers', label: '👥 Customer 360°' },
  { to: '/credit',    label: '📈 Credit & NPL'  },
  { to: '/fraud',     label: '🛡 Fraud & AML'   },
  { to: '/branches',  label: '🏦 Branch Ops'    },
]

export default function AppShell() {
  const navigate = useNavigate()
  const user = getUser()
  const initials = (user?.name || 'AM').split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar)', background: 'var(--green-900)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--green-400)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>B</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>BankPulse 360°</div>
              <div style={{ color: 'var(--green-100)', fontSize: 10 }}>Banking Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px' }}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'block', padding: '9px 12px', borderRadius: 7,
              marginBottom: 3, fontSize: 13, color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{
          padding: '12px 14px', borderTop: '0.5px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--green-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 600, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Demo User'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'capitalize' }}>
              {user?.role || 'executive'}
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: 4,
          }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 'var(--topbar)', background: 'var(--surface)',
          borderBottom: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', padding: '0 24px',
        }}>
          <span style={{ fontSize: 11, color: 'var(--green-600)' }}>● Live · BigQuery</span>
        </header>
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
