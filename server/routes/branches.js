import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN } from '../bigquery/client.js'

const router = Router()

router.get('/performance', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_branch_performance\` ORDER BY Sigma_Level DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/flagged', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT Branch_ID, Branch_Name, Region, City, Sigma_Level, SPC_Flag, sla_compliance, latitude, longitude FROM \`${P}.${AN}.vw_branch_performance\` WHERE SPC_Flag='Out of Control' OR CAST(Sigma_Level AS FLOAT64) < 2.5 ORDER BY Sigma_Level ASC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
