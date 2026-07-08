import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from './config'
import type { Address, UserProfile } from '../types'

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    phone: data.phone,
    address: data.address,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  }
}

export async function updateOwnProfile(
  uid: string,
  updates: { displayName?: string; phone?: string; address?: Address },
) {
  await updateDoc(doc(db, 'users', uid), updates)
}
