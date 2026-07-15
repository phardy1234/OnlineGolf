import type { Request, Response } from 'express'
import { Order, type OrderItemDoc } from '../models/Order.js'

export async function placeOrder(req: Request, res: Response) {
  const { items, total } = req.body as { items: OrderItemDoc[]; total: number }
  const order = await Order.create({ userId: req.user!.id, items, total })
  res.status(201).json({ order: order.toJSON() })
}

export async function listOrdersForUser(req: Request, res: Response) {
  const orders = await Order.find({ userId: req.user!.id }).sort({ createdAt: -1 })
  res.json({ orders: orders.map((o) => o.toJSON()) })
}
