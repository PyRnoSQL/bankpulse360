import { BigQuery } from '@google-cloud/bigquery'

let credentials = undefined
try {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || ''
  if (raw && raw.startsWith('{')) {
    credentials = JSON.parse(raw)
    console.log('[BigQuery] Service account loaded:', credentials.client_email)
  } else {
    console.warn('[BigQuery] No service account JSON found in env')
  }
} catch (e) {
  console.warn('[BigQuery] Could not parse GOOGLE_SERVICE_ACCOUNT_JSON:', e.message)
}

export const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID || 'bankpulse360',
  credentials: credentials?.client_email ? credentials : undefined,
  location: process.env.GCP_REGION || 'africa-south1',
})

export const P  = process.env.GCP_PROJECT_ID || 'bankpulse360'
export const ST = 'bp360_staging'
export const AN = process.env.BQ_DATASET    || 'bp360_analytics'

export async function bqQuery(sql, params = {}) {
  const [rows] = await bigquery.query({
    query:    sql,
    params,
    location: process.env.GCP_REGION || 'africa-south1',
  })
  return rows
}
