import { apiRequest } from './client'
import type { Order, OrderItem } from '../types'

export async function placeOrder(items: OrderItem[], total: number) {
  const { order } = await apiRequest<{ order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ items, total }),
  })
  return order.id
}

export async function listOrdersForUser(): Promise<Order[]> {
  const { orders } = await apiRequest<{ orders: Order[] }>('/api/orders')
  return orders
}
