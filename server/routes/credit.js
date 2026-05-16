import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, ST, AN } from '../bigquery/client.js'

const router = Router()

router.get('/portfolio', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_credit_portfolio\` ORDER BY npl_ratio_pct DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/ews', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT Loan_ID,Client_Name,Region,City,Sector,Loan_Type,Outstanding_Bal__FCFA_,Days_Past_Due,PD_Score____,EWS_Flag,Loan_Classification FROM \`${P}.${ST}.credit_risk\` WHERE EWS_Flag IN ('High','Critical') ORDER BY PD_Score____ DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/npl-by-sector', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT Sector, ROUND(SUM(CAST(Outstanding_Bal__FCFA_ AS FLOAT64))/1000000,2) AS total_m, ROUND(SAFE_DIVIDE(SUM(CASE WHEN Loan_Classification IN ('Substandard','Doubtful','Loss') THEN CAST(Outstanding_Bal__FCFA_ AS FLOAT64) ELSE 0 END),SUM(CAST(Outstanding_Bal__FCFA_ AS FLOAT64)))*100,1) AS npl_ratio FROM \`${P}.${ST}.credit_risk\` GROUP BY Sector ORDER BY npl_ratio DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
