import type { Request, Response } from 'express'
import { ContactMessage } from '../models/ContactMessage.js'
import { sendContactEmail } from '../utils/mailer.js'

export async function createContactMessage(req: Request, res: Response) {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string }
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' })
    return
  }

  const contactMessage = await ContactMessage.create({ name, email, message })

  try {
    await sendContactEmail(name, email, message)
    contactMessage.emailSent = true
  } catch (err) {
    contactMessage.emailSent = false
    contactMessage.emailError = err instanceof Error ? err.message : String(err)
  }
  await contactMessage.save()

  res.status(201).json({ contactMessage: contactMessage.toJSON() })
}
