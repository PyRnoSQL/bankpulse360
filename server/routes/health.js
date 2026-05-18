import { Router } from 'express'
import { bigquery, P } from '../bigquery/client.js'

const router = Router()

router.get('/', async (_req, res) => {
  let bqStatus = 'not tested'
  let bqError  = null
  try {
    await bigquery.query({ query: 'SELECT 1 AS ok', location: process.env.GCP_REGION || 'africa-south1' })
    bqStatus = 'connected'
  } catch (e) {
    bqStatus = 'error'
    bqError  = e.message
  }

  res.status(200).json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   '0.3.0',
    services: {
      api:      'ok',
      bigquery: bqStatus,
      bqError:  bqError,
      project:  P,
      dataset:  process.env.BQ_DATASET || 'bp360_analytics',
      hasCredentials: !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      jwt:      process.env.JWT_SECRET ? 'configured' : 'using default',
    }
  })
})

export default router
