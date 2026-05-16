import { Router } from 'express'
const router = Router()
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    time:   new Date().toISOString(),
    app:    'BankPulse360',
    bigquery: process.env.GCP_PROJECT_ID ? 'configured' : 'not set',
    sheets:   process.env.GOOGLE_SHEETS_ID ? 'configured' : 'not set',
  })
})
export default router
