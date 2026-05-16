import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import morgan     from 'morgan'
import path       from 'path'
import { fileURLToPath } from 'url'

// ── Route imports ─────────────────────────────────────────
import authRouter      from './routes/auth.js'
import healthRouter    from './routes/health.js'
import dashboardRouter from './routes/dashboard.js'
import creditRouter    from './routes/credit.js'
import fraudRouter     from './routes/fraud.js'
import branchRouter    from './routes/branches.js'
import customerRouter  from './routes/customers.js'
import formsRouter     from './routes/forms.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

// ── Middleware ────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── API routes ────────────────────────────────────────────
app.use('/api/auth',      authRouter)
app.use('/api/health',    healthRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/credit',    creditRouter)
app.use('/api/fraud',     fraudRouter)
app.use('/api/branches',  branchRouter)
app.use('/api/customers', customerRouter)
app.use('/api/forms',     formsRouter)

// ── Serve React build ─────────────────────────────────────
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n=================================')
  console.log('  BankPulse360 running on ' + PORT)
  console.log('  /api/auth/login  -> POST')
  console.log('  /api/health      -> GET')
  console.log('=================================\n')
})
