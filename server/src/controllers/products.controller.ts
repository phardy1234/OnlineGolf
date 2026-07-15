import type { Request, Response } from 'express'
import { Product } from '../models/Product.js'

export async function listProducts(req: Request, res: Response) {
  const { category } = req.query as { category?: string }
  const filter = category ? { category } : {}
  const products = await Product.find(filter).sort({ createdAt: -1 })
  res.json({ products: products.map((p) => p.toJSON()) })
}

export async function createProduct(req: Request, res: Response) {
  const { name, category, brand, price, description, imageSeed, stock } = req.body as {
    name: string
    category: string
    brand: string
    price: number
    description: string
    imageSeed: string
    stock: number
  }
  const product = await Product.create({ name, category, brand, price, description, imageSeed, stock })
  res.status(201).json({ product: product.toJSON() })
}

export async function updateProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.json({ product: product.toJSON() })
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) {
    res.status(404).json({ error: 'Product not found' })
    return
  }
  res.status(204).send()
}
