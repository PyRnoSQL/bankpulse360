import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, AN } from '../bigquery/client.js'

const router = Router()

router.get('/alerts', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_fraud_summary\` ORDER BY Fraud_Score DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/summary', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_fraud_summary\` ORDER BY Fraud_Score DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/network', requireAuth, async (_req, res) => {
  try {
    const edges = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_aml_network_edges\` ORDER BY amount DESC`)
    const nodeMap = new Map()
    edges.forEach(e => {
      if (!nodeMap.has(e.source_node)) nodeMap.set(e.source_node, { id: e.source_node, label: e.source_label || e.source_node, type: 'account', city: e.source_city || '', riskTier: e.risk_tier || 'Amber' })
      if (!nodeMap.has(e.target_node)) nodeMap.set(e.target_node, { id: e.target_node, label: e.target_node, type: 'counterparty', city: e.target_country || '', riskTier: e.risk_tier || 'Amber' })
    })
    res.json({
      nodes: Array.from(nodeMap.values()),
      links: edges.map(e => ({ source: e.source_node, target: e.target_node, amount: Number(e.amount || 0), typology: e.edge_type || '', riskTier: e.risk_tier || 'Amber', sarFlag: e.sar_flag, sanctionsFlag: e.sanctions_flag }))
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/open-sar', requireAuth, async (_req, res) => {
  try {
    const rows = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_fraud_summary\` WHERE SAR_Required = TRUE AND (SAR_Filed_Date IS NULL OR SAR_Filed_Date = '') ORDER BY Fraud_Score DESC`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
