import { apiRequest } from './client'
import type { Address, UserProfile } from '../types'

export async function updateOwnProfile(updates: {
  displayName?: string
  phone?: string
  address?: Address
}) {
  const { user } = await apiRequest<{ user: UserProfile }>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return user
}
