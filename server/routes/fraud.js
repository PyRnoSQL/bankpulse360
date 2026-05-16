import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { bqQuery, P, ST, AN } from '../bigquery/client.js'

const router = Router()

router.get('/summary', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_fraud_summary\` ORDER BY avg_fraud_score DESC`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/alerts', requireAuth, async (_req, res) => {
  try { res.json(await bqQuery(`SELECT * FROM \`${P}.${ST}.fraud_aml\` ORDER BY Fraud_Score DESC LIMIT 50`)) }
  catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/network', requireAuth, async (_req, res) => {
  try {
    const edges = await bqQuery(`SELECT * FROM \`${P}.${AN}.vw_aml_network_edges\` ORDER BY amount DESC`)
    const nodeMap = new Map()
    edges.forEach(e => {
      if (!nodeMap.has(e.source_node)) nodeMap.set(e.source_node, { id: e.source_node, label: e.source_label, type: 'account', city: e.source_city, riskTier: e.risk_tier })
      if (!nodeMap.has(e.target_node)) nodeMap.set(e.target_node, { id: e.target_node, label: e.target_node, type: 'counterparty', city: e.target_country, riskTier: e.risk_tier })
    })
    res.json({ nodes: Array.from(nodeMap.values()), links: edges.map(e => ({ source: e.source_node, target: e.target_node, amount: e.amount, typology: e.edge_type, riskTier: e.risk_tier, sarFlag: e.sar_flag, sanctionsFlag: e.sanctions_flag })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
