import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN } from '../bigquery/client.js'

const router = Router()

router.get('/performance', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_branch_performance\` ORDER BY Sigma_Level DESC`)
    res.json(rows)
  } catch (err) {
    console.error('[branches/performance]', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.get('/flagged', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_branch_performance\` WHERE SPC_Flag = 'Out of Control' OR Sigma_Level < 2.5 ORDER BY Sigma_Level ASC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/:branchId/kpis', requireAuth, async (req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_branch_performance\` WHERE Branch_ID = @branchId LIMIT 1`, { branchId: req.params.branchId })
    if (!rows.length) return res.status(404).json({ error: 'Branch not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
