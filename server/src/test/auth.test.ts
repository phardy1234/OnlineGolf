import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { User } from '../models/User.js'
import { VALID_PASSWORD, signupAndLogin } from './helpers.js'

// Covers User "Create" (signup) and "Read" (me / duplicate lookups) via the auth flows,
// since there is no direct POST /api/users endpoint.
describe('POST /api/auth/signup', () => {
  it('creates a new user, hashes the password, and returns it without the hash', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'new.user@example.com',
      password: VALID_PASSWORD,
      displayName: 'New User',
    })

    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      email: 'new.user@example.com',
      displayName: 'New User',
      role: 'customer',
    })
    expect(res.body.user.passwordHash).toBeUndefined()
    expect(res.headers['set-cookie']?.[0]).toContain('token=')

    const stored = await User.findOne({ email: 'new.user@example.com' }).select('+passwordHash')
    expect(stored?.passwordHash).toBeDefined()
    expect(stored?.passwordHash).not.toBe(VALID_PASSWORD)
  })

  it('rejects signup when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'incomplete@example.com' })
    expect(res.status).toBe(400)
  })

  it('rejects passwords shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'short@example.com',
      password: '123',
      displayName: 'Short Pass',
    })
    expect(res.status).toBe(400)
  })

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'dupe@example.com',
      password: VALID_PASSWORD,
      displayName: 'First',
    })

    const res = await request(app).post('/api/auth/signup').send({
      email: 'dupe@example.com',
      password: VALID_PASSWORD,
      displayName: 'Second',
    })

    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials and sets a cookie', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'login@example.com',
      password: VALID_PASSWORD,
      displayName: 'Login User',
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: VALID_PASSWORD,
    })

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('login@example.com')
    expect(res.headers['set-cookie']?.[0]).toContain('token=')
  })

  it('rejects an unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: VALID_PASSWORD,
    })
    expect(res.status).toBe(401)
  })

  it('rejects an incorrect password', async () => {
    await request(app).post('/api/auth/signup').send({
      email: 'wrongpass@example.com',
      password: VALID_PASSWORD,
      displayName: 'Wrong Pass',
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'somethingelse',
    })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns the current user when authenticated', async () => {
    const { agent, user } = await signupAndLogin()
    const res = await agent.get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(user.id)
  })

  it('returns null when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user).toBeNull()
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the auth cookie', async () => {
    const { agent } = await signupAndLogin()
    const res = await agent.post('/api/auth/logout')
    expect(res.status).toBe(204)

    const me = await agent.get('/api/auth/me')
    expect(me.body.user).toBeNull()
  })
})
