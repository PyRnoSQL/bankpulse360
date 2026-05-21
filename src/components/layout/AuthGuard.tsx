import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

export default function AuthGuard() {
  const [checked, setChecked] = useState(false)
  const [auth,    setAuth]    = useState(false)

  useEffect(() => {
    setAuth(isAuthenticated())
    setChecked(true)
  }, [])

  if (!checked) return (
    <div style={{
      minHeight: '100vh',
      background: '#060F1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 24, height: 24,
        border: '2px solid #1D9E75',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return auth ? <Outlet /> : <Navigate to="/login" replace />
}
