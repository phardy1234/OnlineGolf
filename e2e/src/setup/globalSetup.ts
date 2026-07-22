import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const e2eRoot = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(e2eRoot, '.env') })
// Reuse the real Atlas connection string from server/.env — no secrets duplicated here.
dotenv.config({ path: path.join(e2eRoot, '../server/.env') })

const E2E_BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:4100'
const MONGODB_URI = process.env.MONGODB_URI

export const IDENTITIES_PATH = path.join(e2eRoot, '.test-identities.json')
export const TEST_PASSWORD = 'e2e-Test-Pass1'

async function checkServerUp(url: string, label: string) {
  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    throw new Error(
      `${label} is not reachable at ${url}. Start it before running the E2E suite ` +
        `(root: "npm run dev", server: "npm run dev" in server/). Original error: ${(err as Error).message}`,
    )
  }
  if (!res.ok) {
    throw new Error(`${label} responded with status ${res.status} at ${url} — is it healthy?`)
  }
}

async function signup(displayName: string, email: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: TEST_PASSWORD, displayName }),
  })
  if (!res.ok) {
    throw new Error(`Failed to create E2E test user ${email}: ${res.status} ${await res.text()}`)
  }
  const body = (await res.json()) as { user: { id: string } }
  return body.user.id
}

export default async function globalSetup() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not found — expected it to be set in ../server/.env')
  }

  await checkServerUp(`${API_BASE_URL}/api/health`, 'Backend API')
  await checkServerUp(E2E_BASE_URL, 'Frontend dev server')

  const runId = Date.now()
  const adminEmail = `e2e-admin-${runId}@example.com`
  const customerEmail = `e2e-customer-${runId}@example.com`

  const adminId = await signup('E2E Admin', adminEmail)
  const customerId = await signup('E2E Customer', customerEmail)

  await mongoose.connect(MONGODB_URI)
  await mongoose.connection
    .collection('users')
    .updateOne({ _id: new mongoose.Types.ObjectId(adminId) }, { $set: { role: 'admin' } })

  writeFileSync(
    IDENTITIES_PATH,
    JSON.stringify(
      {
        runId,
        baseUrl: E2E_BASE_URL,
        apiBaseUrl: API_BASE_URL,
        password: TEST_PASSWORD,
        admin: { id: adminId, email: adminEmail, displayName: 'E2E Admin' },
        customer: { id: customerId, email: customerEmail, displayName: 'E2E Customer' },
      },
      null,
      2,
    ),
    'utf-8',
  )

  return async function teardown() {
    try {
      // Broad, prefix-based cleanup so any ad-hoc "e2e-*" users/products created by
      // individual specs (not just the two identities above) are swept up too.
      const usersCol = mongoose.connection.collection('users')
      const matched = await usersCol.find({ email: /^e2e-/i }, { projection: { _id: 1 } }).toArray()
      const ids = matched.map((u) => u._id)

      await usersCol.deleteMany({ email: /^e2e-/i })
      if (ids.length) {
        await mongoose.connection.collection('orders').deleteMany({ userId: { $in: ids } })
      }
      await mongoose.connection.collection('products').deleteMany({ name: /^E2E Test/ })
      await mongoose.connection.collection('contactmessages').deleteMany({ email: /^e2e-/i })
    } finally {
      await mongoose.disconnect()
    }
  }
}
