import type { NextFunction, Request, Response } from 'express'
import { config } from '../config/env.js'
import { User } from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[config.cookieName]
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    const payload = verifyToken(token)
    const user = await User.findById(payload.sub)
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }
    req.user = { id: user.id, role: user.role }
    next()
  } catch {
    res.status(401).json({ error: 'Not authenticated' })
  }
}
