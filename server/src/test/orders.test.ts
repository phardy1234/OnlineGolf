import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { Order } from '../models/Order.js'
import { signupAndLogin } from './helpers.js'

// Orders only expose Create (POST /) and Read (GET / — current user's own orders).
// There is no Update or Delete endpoint, so those are not covered here.

function sampleOrderPayload() {
  return {
    items: [
      { productId: '000000000000000000000001', name: 'Test Driver', price: 299.99, quantity: 1, imageSeed: 'a' },
    ],
    total: 299.99,
  }
}

describe('POST /api/orders (Create)', () => {
  it('creates an order for the authenticated user', async () => {
    const { agent, user } = await signupAndLogin()

    const res = await agent.post('/api/orders').send(sampleOrderPayload())
    expect(res.status).toBe(201)
    expect(res.body.order.userId).toBe(user.id)
    expect(res.body.order.status).toBe('placed')
    expect(res.body.order.items).toHaveLength(1)

    const stored = await Order.findById(res.body.order.id)
    expect(stored).not.toBeNull()
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/orders').send(sampleOrderPayload())
    expect(res.status).toBe(401)
  })
})

describe('GET /api/orders (Read)', () => {
  it("lists only the authenticated user's orders", async () => {
    const { agent: agentA, user: userA } = await signupAndLogin({ email: 'buyer-a@example.com' })
    const { agent: agentB } = await signupAndLogin({ email: 'buyer-b@example.com' })

    await agentA.post('/api/orders').send(sampleOrderPayload())
    await agentB.post('/api/orders').send(sampleOrderPayload())
    await agentB.post('/api/orders').send(sampleOrderPayload())

    const res = await agentA.get('/api/orders')
    expect(res.status).toBe(200)
    expect(res.body.orders).toHaveLength(1)
    expect(res.body.orders[0].userId).toBe(userA.id)
  })

  it('returns an empty list for a user with no orders', async () => {
    const { agent } = await signupAndLogin()
    const res = await agent.get('/api/orders')
    expect(res.status).toBe(200)
    expect(res.body.orders).toEqual([])
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })
})
