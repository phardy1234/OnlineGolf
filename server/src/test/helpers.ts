import request from 'supertest'
import { app } from '../app.js'
import { User } from '../models/User.js'

export const VALID_PASSWORD = 'password123'

export async function signupAndLogin(overrides: { email?: string; displayName?: string } = {}) {
  const agent = request.agent(app)
  const email = overrides.email ?? `customer-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
  const displayName = overrides.displayName ?? 'Test Customer'

  const res = await agent.post('/api/auth/signup').send({
    email,
    password: VALID_PASSWORD,
    displayName,
  })

  return { agent, user: res.body.user as { id: string; email: string; role: string } }
}

export async function signupAndLoginAsAdmin(overrides: { email?: string; displayName?: string } = {}) {
  const { agent, user } = await signupAndLogin(overrides)
  await User.findByIdAndUpdate(user.id, { role: 'admin' })
  return { agent, user: { ...user, role: 'admin' } }
}
