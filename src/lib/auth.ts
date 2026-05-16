const KEY = 'bp360_token'

export async function login(userId: string, password: string) {
  const res  = await fetch('/api/auth/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId, password }),
  })
  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error('Server error: ' + text.slice(0, 80)) }
  if (!res.ok) throw new Error(data.error || 'Login failed')
  localStorage.setItem(KEY, data.token)
  return data.user
}

export function logout()          { localStorage.removeItem(KEY) }
export function getToken()        { return localStorage.getItem(KEY) }
export function isAuthenticated() {
  const t = getToken()
  if (!t) return false
  try { const p = JSON.parse(atob(t.split('.')[1])); return p.exp * 1000 > Date.now() } catch { return false }
}
export function getUser() {
  const t = getToken()
  if (!t) return null
  try { return JSON.parse(atob(t.split('.')[1])) } catch { return null }
}
export function authHeader() {
  const t = getToken()
  return t ? { Authorization: 'Bearer ' + t } : {}
}
