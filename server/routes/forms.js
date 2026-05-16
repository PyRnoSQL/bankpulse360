import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/loan', requireAuth, async (req, res) => {
  // TODO: write to Google Sheets via service account
  console.log('[Forms] Loan submission:', req.body)
  res.status(201).json({ success: true, message: 'Loan application received' })
})

router.post('/branch-daily', requireAuth, async (req, res) => {
  console.log('[Forms] Branch daily:', req.body)
  res.status(201).json({ success: true, message: 'Branch data received' })
})

export default router
