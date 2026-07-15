import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { app } from '../app.js'
import { ContactMessage } from '../models/ContactMessage.js'
import * as mailer from '../utils/mailer.js'

// Contact messages only expose Create (POST /). There is no Read, Update, or
// Delete endpoint, so those are not covered here.

describe('POST /api/contact (Create)', () => {
  it('stores the message and marks emailSent when the mailer succeeds', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Jane Golfer',
      email: 'jane@example.com',
      message: 'Do you stock left-handed clubs?',
    })

    expect(res.status).toBe(201)
    expect(res.body.contactMessage).toMatchObject({
      name: 'Jane Golfer',
      email: 'jane@example.com',
      emailSent: true,
    })

    const stored = await ContactMessage.findById(res.body.contactMessage.id)
    expect(stored).not.toBeNull()
  })

  it('still stores the message and records the error when the mailer fails', async () => {
    vi.mocked(mailer.sendContactEmail).mockRejectedValueOnce(new Error('SMTP unavailable'))

    const res = await request(app).post('/api/contact').send({
      name: 'John Golfer',
      email: 'john@example.com',
      message: 'What are your opening hours?',
    })

    expect(res.status).toBe(201)
    expect(res.body.contactMessage.emailSent).toBe(false)
    expect(res.body.contactMessage.emailError).toContain('SMTP unavailable')
  })

  it('rejects a request missing required fields', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'No Email' })
    expect(res.status).toBe(400)

    const count = await ContactMessage.countDocuments()
    expect(count).toBe(0)
  })
})
