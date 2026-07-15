import { apiRequest } from './client'
import type { UserProfile } from '../types'

export async function signUp(email: string, password: string, displayName: string) {
  const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  })
  return user
}

export async function logIn(email: string, password: string) {
  const { user } = await apiRequest<{ user: UserProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return user
}

export async function logOut() {
  await apiRequest('/api/auth/logout', { method: 'POST' })
}

export async function getMe(): Promise<UserProfile | null> {
  const { user } = await apiRequest<{ user: UserProfile | null }>('/api/auth/me')
  return user
}
