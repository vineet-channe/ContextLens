'use strict'

const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// Configure Google OAuth strategy only if credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = `${process.env.SERVER_URL || 'http://localhost:3001'}/api/auth/google/callback`

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id })
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
            })
          } else {
            user.name = profile.displayName
            user.avatar = profile.photos[0]?.value
            await user.save()
          }
          done(null, user)
        } catch (err) {
          done(err)
        }
      },
    ),
  )
}

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Google OAuth is not configured on this server.' })
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: `${process.env.APP_URL || 'http://localhost:5173'}?auth=failed`,
      session: false,
    })(req, res, next)
  },
  (req, res) => {
    const token = jwt.sign({ userId: req.user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    })
    const frontendUrl = process.env.APP_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}?token=${token}`)
  },
)

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' })
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('name email avatar').lean()
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
