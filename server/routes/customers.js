import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN, ST } from '../bigquery/client.js'

const router = Router()

router.get('/kpis', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_customer_kpis\` ORDER BY avg_churn_prob DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/churn-risk', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT
        Customer_ID, Full_Name, Region, City, Neighbourhood, Segment,
        Age, Gender, Occupation, Income_Tier, Account_Open_Date, Account_Types,
        CAST(Avg_Monthly_Bal__FCFA_ AS FLOAT64)  AS Avg_Monthly_Bal__FCFA_,
        Products_Held, Mobile_Banking,
        App_Logins_30d, ATM_Txns_30d, Branch_Visits_30d,
        CAST(Omni_Channel_Score AS FLOAT64)       AS Omni_Channel_Score,
        CAST(Days_Since_Last_Txn AS INT64)        AS Days_Since_Last_Txn,
        CAST(Churn_Prob____ AS FLOAT64)           AS Churn_Prob____,
        CAST(CLV_Score__FCFA_ AS FLOAT64)         AS CLV_Score__FCFA_,
        CAST(NPS_Score AS INT64)                  AS NPS_Score,
        RFM_Score,
        Recommended_Product, Offer_Sent, Offer_Accepted
      FROM \`${P}.${ST}.customers\`
      WHERE CAST(Churn_Prob____ AS FLOAT64) >= 50
      ORDER BY CAST(Churn_Prob____ AS FLOAT64) DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/segments', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT Segment, COUNT(*) AS count,
             ROUND(AVG(CAST(CLV_Score__FCFA_ AS FLOAT64))/1000000,2) AS avg_clv_m
      FROM \`${P}.${ST}.customers\`
      GROUP BY Segment ORDER BY count DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
