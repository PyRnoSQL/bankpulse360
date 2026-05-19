import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN } from '../bigquery/client.js'

const router = Router()

router.get('/kpis', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_customer_kpis\` ORDER BY Churn_Prob____ DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/churn-risk', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT * FROM \`${P}.${AN}.vw_customer_kpis\`
      WHERE Churn_Prob____ >= 50
      ORDER BY Churn_Prob____ DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/segments', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT Segment, COUNT(*) AS count,
             ROUND(AVG(CAST(CLV_Score__FCFA_ AS FLOAT64))/1000000,2) AS avg_clv_m
      FROM \`${P}.${AN}.vw_customer_kpis\`
      GROUP BY Segment ORDER BY count DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
