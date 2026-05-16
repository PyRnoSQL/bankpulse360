import jwt from 'jsonwebtoken'
const SECRET = process.env.JWT_SECRET || 'bp360secret'
export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try { req.user = jwt.verify(token, SECRET); next() }
  catch { res.status(401).json({ error: 'Invalid token' }) }
}
