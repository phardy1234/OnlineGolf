import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { Product } from '../models/Product.js'
import { signupAndLogin, signupAndLoginAsAdmin } from './helpers.js'

function sampleProduct(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    name: 'Test Driver',
    category: 'drivers',
    brand: 'TestBrand',
    price: 299.99,
    description: 'A driver used in tests.',
    imageSeed: 'test-driver',
    stock: 10,
    ...overrides,
  }
}

describe('POST /api/products (Create)', () => {
  it('allows an admin to create a product', async () => {
    const { agent } = await signupAndLoginAsAdmin()

    const res = await agent.post('/api/products').send(sampleProduct())
    expect(res.status).toBe(201)
    expect(res.body.product).toMatchObject({ name: 'Test Driver', category: 'drivers' })
    expect(res.body.product.id).toBeDefined()

    const stored = await Product.findById(res.body.product.id)
    expect(stored).not.toBeNull()
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/products').send(sampleProduct())
    expect(res.status).toBe(401)
  })

  it('rejects non-admin customers', async () => {
    const { agent } = await signupAndLogin()
    const res = await agent.post('/api/products').send(sampleProduct())
    expect(res.status).toBe(403)
  })
})

describe('GET /api/products (Read)', () => {
  it('lists all products', async () => {
    await Product.create(sampleProduct({ name: 'Driver A' }))
    await Product.create(sampleProduct({ name: 'Driver B', category: 'irons' }))

    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(2)
  })

  it('filters by category', async () => {
    await Product.create(sampleProduct({ name: 'Driver A', category: 'drivers' }))
    await Product.create(sampleProduct({ name: 'Iron Set', category: 'irons' }))

    const res = await request(app).get('/api/products').query({ category: 'irons' })
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('Iron Set')
  })

  it('returns an empty list when there are no products', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })
})

describe('PATCH /api/products/:id (Update)', () => {
  it('allows an admin to update a product', async () => {
    const { agent } = await signupAndLoginAsAdmin()
    const product = await Product.create(sampleProduct())

    const res = await agent.patch(`/api/products/${product.id}`).send({ price: 199.99, stock: 5 })
    expect(res.status).toBe(200)
    expect(res.body.product.price).toBe(199.99)
    expect(res.body.product.stock).toBe(5)
  })

  it('returns 404 for a non-existent product', async () => {
    const { agent } = await signupAndLoginAsAdmin()
    const res = await agent.patch('/api/products/000000000000000000000000').send({ price: 1 })
    expect(res.status).toBe(404)
  })

  it('rejects non-admin customers', async () => {
    const { agent } = await signupAndLogin()
    const product = await Product.create(sampleProduct())

    const res = await agent.patch(`/api/products/${product.id}`).send({ price: 1 })
    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/products/:id (Delete)', () => {
  it('allows an admin to delete a product', async () => {
    const { agent } = await signupAndLoginAsAdmin()
    const product = await Product.create(sampleProduct())

    const res = await agent.delete(`/api/products/${product.id}`)
    expect(res.status).toBe(204)

    const stored = await Product.findById(product.id)
    expect(stored).toBeNull()
  })

  it('returns 404 when deleting a non-existent product', async () => {
    const { agent } = await signupAndLoginAsAdmin()
    const res = await agent.delete('/api/products/000000000000000000000000')
    expect(res.status).toBe(404)
  })

  it('rejects non-admin customers', async () => {
    const { agent } = await signupAndLogin()
    const product = await Product.create(sampleProduct())

    const res = await agent.delete(`/api/products/${product.id}`)
    expect(res.status).toBe(403)
  })
})
