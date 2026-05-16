import { BigQuery } from '@google-cloud/bigquery'

let credentials
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  }
} catch { console.warn('[BQ] Could not parse service account JSON') }

export const bigquery = new BigQuery({
  projectId:   process.env.GCP_PROJECT_ID || 'bankpulse360',
  credentials: credentials?.client_email ? credentials : undefined,
  location:    'africa-south1',
})

export const P  = process.env.GCP_PROJECT_ID || 'bankpulse360'
export const ST = 'bp360_staging'
export const AN = process.env.BQ_DATASET    || 'bp360_analytics'

export async function bqQuery(sql, params = {}) {
  const [rows] = await bigquery.query({ query: sql, params, location: 'africa-south1' })
  return rows
}
