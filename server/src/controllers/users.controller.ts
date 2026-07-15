import type { Request, Response } from 'express'
import { User } from '../models/User.js'

export async function updateOwnProfile(req: Request, res: Response) {
  const { displayName, phone, address } = req.body as {
    displayName?: string
    phone?: string
    address?: { line1: string; line2?: string; city: string; postcode: string; country: string }
  }

  const updates: Record<string, unknown> = {}
  if (displayName !== undefined) updates.displayName = displayName
  if (phone !== undefined) updates.phone = phone
  if (address !== undefined) updates.address = address

  const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json({ user: user.toJSON() })
}


export async function getUserByEmail(req: Request, res: Response) {
  const user = await User.findOne({ email: req.params.email })

  if (!user) {
    res.status(404).json({ exists: false })
    return
  }

  res.json({ exists: true, user: user.toJSON() })
}