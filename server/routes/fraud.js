import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN, ST } from '../bigquery/client.js'

const router = Router()

router.get('/alerts', requireAuth, async (req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT Alert_ID, Account_ID, Customer_Name, Region, City,
             Alert_Date, Alert_Time, Channel, Transaction_Type,
             CAST(Amount__FCFA_ AS FLOAT64) AS Amount__FCFA_,
             Counterparty_Account, Counterparty_Country,
             CAST(Fraud_Score AS FLOAT64) AS Fraud_Score,
             Fraud_Band, Alert_Type, AML_Typology, AML_Risk_Tier,
             SIM_Swap_Within_48h, New_Beneficiary, Velocity_Flag__24h_,
             Sanctions_Hit, PEP_Linked, Case_Status, SAR_Required,
             SAR_Filed_Date, CAST(MTTD__min_ AS INT64) AS MTTD__min_,
             Investigator
      FROM \`${P}.${ST}.fraud_aml\`
      ORDER BY Fraud_Score DESC
      LIMIT 50
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/summary', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT * FROM \`${P}.${AN}.vw_fraud_summary\`
      ORDER BY avg_fraud_score DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/network', requireAuth, async (_req, res) => {
  try {
    const edges = await bqQuery(`
      SELECT * FROM \`${P}.${AN}.vw_aml_network_edges\`
      ORDER BY amount DESC
    `)
    const nodeMap = new Map()
    edges.forEach(e => {
      if (!nodeMap.has(e.source_node)) {
        nodeMap.set(e.source_node, {
          id: e.source_node,
          label: e.source_label || e.source_node,
          type: 'account',
          city: e.source_city || '',
          riskTier: e.risk_tier || 'Amber',
        })
      }
      if (!nodeMap.has(e.target_node)) {
        nodeMap.set(e.target_node, {
          id: e.target_node,
          label: e.target_node,
          type: 'counterparty',
          city: e.target_country || '',
          riskTier: e.risk_tier || 'Amber',
        })
      }
    })
    res.json({
      nodes: Array.from(nodeMap.values()),
      links: edges.map(e => ({
        source:       e.source_node,
        target:       e.target_node,
        amount:       Number(e.amount || 0),
        typology:     e.edge_type || '',
        riskTier:     e.risk_tier || 'Amber',
        sarFlag:      e.sar_flag,
        sanctionsFlag:e.sanctions_flag,
      }))
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/open-sar', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`
      SELECT Alert_ID, Account_ID, Customer_Name, Region, City,
             Channel, CAST(Amount__FCFA_ AS FLOAT64) AS Amount__FCFA_,
             Fraud_Band, AML_Typology, Alert_Date, Case_Status,
             Investigator, CAST(MTTD__min_ AS INT64) AS MTTD__min_
      FROM \`${P}.${ST}.fraud_aml\`
      WHERE SAR_Required = TRUE
        AND (SAR_Filed_Date IS NULL OR SAR_Filed_Date = '')
      ORDER BY CAST(Amount__FCFA_ AS FLOAT64) DESC
    `)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
