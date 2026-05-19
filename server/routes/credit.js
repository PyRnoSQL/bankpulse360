import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN } from '../bigquery/client.js'

const router = Router()

router.get('/portfolio', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_credit_portfolio\` ORDER BY PD_Score____ DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/npl-by-sector', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_npl_by_sector\` ORDER BY npl_ratio DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/ews', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_ews_alerts\` ORDER BY PD_Score____ DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/score/:loanId', requireAuth, async (req, res) => {
  try {
    const rows = await bqQuery(
      `SELECT * FROM \`${P}.${AN}.vw_ews_alerts\` WHERE Loan_ID = @loanId LIMIT 1`,
      { loanId: req.params.loanId }
    )
    if (!rows.length) return res.status(404).json({ error: 'Loan not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
