import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from './config'
import type { Order, OrderItem } from '../types'

const ordersRef = collection(db, 'orders')

export async function placeOrder(userId: string, items: OrderItem[], total: number) {
  const doc = await addDoc(ordersRef, {
    userId,
    items,
    total,
    status: 'placed',
    createdAt: serverTimestamp(),
  })
  return doc.id
}

export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      userId: data.userId,
      items: data.items,
      total: data.total,
      status: data.status,
      createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    }
  })
}
