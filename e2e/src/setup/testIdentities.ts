import { readFileSync } from 'node:fs'
import { IDENTITIES_PATH } from './globalSetup.js'

export interface TestIdentity {
  id: string
  email: string
  displayName: string
}

export interface TestIdentities {
  runId: number
  baseUrl: string
  apiBaseUrl: string
  password: string
  admin: TestIdentity
  customer: TestIdentity
}

let cached: TestIdentities | undefined

export function loadIdentities(): TestIdentities {
  if (!cached) {
    const raw = readFileSync(IDENTITIES_PATH, 'utf-8')
    cached = JSON.parse(raw) as TestIdentities
  }
  return cached
}
