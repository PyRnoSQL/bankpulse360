import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, ST } from '../bigquery/client.js'

const router = Router()

router.get('/summary', requireAuth, async (_req, res) => {
  try {
    const [c, cr, f, b] = await Promise.all([
      bqQuery(`SELECT ROUND(AVG(Churn_Prob____),1) AS avg_churn, COUNT(*) AS total FROM \`${P}.${ST}.customers\``),
      bqQuery(`SELECT ROUND(SAFE_DIVIDE(COUNTIF(Loan_Classification IN ('Substandard','Doubtful','Loss')),COUNT(*))*100,1) AS npl_ratio, COUNT(*) AS total FROM \`${P}.${ST}.credit_risk\``),
      bqQuery(`SELECT COUNTIF(Fraud_Band='Critical') AS critical, COUNTIF(SAR_Required=TRUE) AS sar FROM \`${P}.${ST}.fraud_aml\``),
      bqQuery(`SELECT ROUND(AVG(CAST(Sigma_Level AS FLOAT64)),2) AS avg_sigma, ROUND(AVG(CAST(SLA_Compliance____ AS FLOAT64)),1) AS avg_sla, COUNTIF(SPC_Flag='Out of Control') AS ooc FROM \`${P}.${ST}.branch_ops\``)
    ])
    res.json({ customers: c[0], credit: cr[0], fraud: f[0], branches: b[0] })
  } catch (err) {
    console.error('[dashboard]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
