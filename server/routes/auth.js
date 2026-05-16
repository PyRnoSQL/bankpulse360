import { Router } from 'express'
import jwt         from 'jsonwebtoken'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'bp360secret'

// Hard-coded demo users — no env parsing issues
const DEMO_USERS = [
  { userId: 'banker', password: '1110', name: 'Armand M.', role: 'executive' }
]

router.post('/login', (req, res) => {
  console.log('[Auth] Login attempt:', req.body)

  const rawId  = String(req.body.userId   || req.body.email || '').trim().toLowerCase()
  const rawPwd = String(req.body.password || '').trim()

  if (!rawId || !rawPwd) {
    return res.status(400).json({ error: 'UserID and password are required' })
  }

  // Check hard-coded users first
  let user = DEMO_USERS.find(u =>
    u.userId.toLowerCase() === rawId &&
    String(u.password) === rawPwd
  )

  // Then check env DEMO_USERS if set
  if (!user && process.env.DEMO_USERS) {
    try {
      const envUsers = JSON.parse(process.env.DEMO_USERS)
      user = envUsers.find(u =>
        (String(u.userId  || '').toLowerCase() === rawId ||
         String(u.email   || '').toLowerCase() === rawId) &&
        String(u.password) === rawPwd
      )
    } catch (e) {
      console.warn('[Auth] Could not parse DEMO_USERS env:', e.message)
    }
  }

  if (!user) {
    console.log('[Auth] No match found for:', rawId)
    return res.status(401).json({ error: 'Invalid UserID or password' })
  }

  const token = jwt.sign(
    { id: user.userId, name: user.name, role: user.role },
    SECRET,
    { expiresIn: '8h' }
  )

  console.log('[Auth] Login success:', user.name)
  res.json({ token, user: { name: user.name, role: user.role } })
})

router.get('/me', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    res.json(jwt.verify(token, SECRET))
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
