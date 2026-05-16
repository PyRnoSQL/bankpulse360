import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, ST, AN } from '../bigquery/client.js'

const router = Router()

router.get('/kpis', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_customer_kpis\` ORDER BY avg_churn_prob DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/churn-risk', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT Customer_ID, Full_Name, Region, City, Segment, Churn_Prob____, CLV_Score__FCFA_, Days_Since_Last_Txn, Recommended_Product, NPS_Score FROM \`${P}.${ST}.customers\` WHERE Churn_Prob____ >= 50 ORDER BY Churn_Prob____ DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/segments', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT Segment, COUNT(*) AS count, ROUND(AVG(CAST(CLV_Score__FCFA_ AS FLOAT64))/1000000,2) AS avg_clv_m FROM \`${P}.${ST}.customers\` GROUP BY Segment ORDER BY count DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
