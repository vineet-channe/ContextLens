require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const mongoose = require('mongoose')
const passport = require('passport')
const defineRoute = require('./routes/define')
const authRoute = require('./routes/auth')
const historyRoute = require('./routes/history')
const keyPoolRoute = require('./routes/keyPool')

const app = express()
const PORT = process.env.PORT || 3001
const rawClientOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = rawClientOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Security headers
app.use(helmet())

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '50kb' }))
app.use(passport.initialize())

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const defineLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many definition requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later.' },
})

const keyPoolLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many key pool requests, please try again later.' },
})

app.use(globalLimiter)

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true })
})

app.use('/api/auth', authLimiter, authRoute)
app.use('/api/history', historyRoute)
app.use('/api/key-pool', keyPoolLimiter, keyPoolRoute)
app.use('/api/define', defineLimiter, defineRoute)

const MONGO_URI = process.env.MONGODB_URI

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_me_in_production') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set to a strong random value in production')
    process.exit(1)
  } else {
    console.warn('WARNING: JWT_SECRET is not set or is using the default placeholder. Set a strong random value before deploying.')
  }
}

async function start() {
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected')
  } else {
    console.warn('MONGODB_URI not set — auth and history features are disabled')
  }
  app.listen(PORT, () => {
    console.log(`ContextLens server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
