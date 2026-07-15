import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { signupAndLogin } from './helpers.js'

// Users only expose Read (GET /:email) and Update (PATCH /me) over the API today.
// Create happens via /api/auth/signup (see auth.test.ts) and there is no Delete
// endpoint, so those are not covered here.

describe('GET /api/users/:email', () => {
  it('finds an existing user by email', async () => {
    const { user } = await signupAndLogin({ email: 'lookup@example.com' })

    const res = await request(app).get(`/api/users/${user.email}`)
    expect(res.status).toBe(200)
    expect(res.body.exists).toBe(true)
    expect(res.body.user.email).toBe('lookup@example.com')
  })

  it('returns 404 with exists:false for an unknown email', async () => {
    const res = await request(app).get('/api/users/nobody@example.com')
    expect(res.status).toBe(404)
    expect(res.body.exists).toBe(false)
  })
})

describe('PATCH /api/users/me', () => {
  it('updates the authenticated user profile', async () => {
    const { agent } = await signupAndLogin()

    const res = await agent.patch('/api/users/me').send({
      displayName: 'Updated Name',
      phone: '01234 567890',
      address: {
        line1: '1 Fairway Drive',
        city: 'St Andrews',
        postcode: 'KY16 9AB',
        country: 'UK',
      },
    })

    expect(res.status).toBe(200)
    expect(res.body.user.displayName).toBe('Updated Name')
    expect(res.body.user.phone).toBe('01234 567890')
    expect(res.body.user.address).toMatchObject({ city: 'St Andrews' })
  })

  it('leaves fields untouched when not provided', async () => {
    const { agent } = await signupAndLogin({ displayName: 'Original Name' })

    const res = await agent.patch('/api/users/me').send({ phone: '999' })
    expect(res.status).toBe(200)
    expect(res.body.user.displayName).toBe('Original Name')
    expect(res.body.user.phone).toBe('999')
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).patch('/api/users/me').send({ displayName: 'Nope' })
    expect(res.status).toBe(401)
  })
})
