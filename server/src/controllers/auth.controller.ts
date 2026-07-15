import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import { config, isProduction } from '../config/env.js'
import { User } from '../models/User.js'
import { signToken, verifyToken } from '../utils/jwt.js'

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function setAuthCookie(res: Response, token: string) {
  res.cookie(config.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: COOKIE_MAX_AGE_MS,
  })
}

export async function signup(req: Request, res: Response) {
  const { email, password, displayName } = req.body as {
    email?: string
    password?: string
    displayName?: string
  }

  if (!email || !password || !displayName) {
    res.status(400).json({ error: 'Email, password, and name are required' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' })
    return
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    email,
    passwordHash,
    displayName,
    role: 'customer',
  })

  const token = signToken({ sub: user.id, role: user.role })
  setAuthCookie(res, token)
  res.status(201).json({ user: user.toJSON() })
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signToken({ sub: user.id, role: user.role })
  setAuthCookie(res, token)
  res.json({ user: user.toJSON() })
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(config.cookieName)
  res.status(204).send()
}

export async function me(req: Request, res: Response) {
  const token = req.cookies?.[config.cookieName]
  if (!token) {
    res.json({ user: null })
    return
  }

  try {
    const payload = verifyToken(token)
    const user = await User.findById(payload.sub)
    res.json({ user: user ? user.toJSON() : null })
  } catch {
    res.json({ user: null })
  }
}
