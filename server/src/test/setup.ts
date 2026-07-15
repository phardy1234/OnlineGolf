import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

vi.mock('../utils/mailer.js', () => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
}))

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})))
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})
