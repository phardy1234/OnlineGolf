import { apiRequest } from './client'
import type { Category, Product } from '../types'

export async function listProducts(): Promise<Product[]> {
  const { products } = await apiRequest<{ products: Product[] }>('/api/products')
  return products
}

export async function listProductsByCategory(category: Category): Promise<Product[]> {
  const { products } = await apiRequest<{ products: Product[] }>(
    `/api/products?category=${encodeURIComponent(category)}`,
  )
  return products
}

export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export async function createProduct(product: NewProduct) {
  await apiRequest('/api/products', { method: 'POST', body: JSON.stringify(product) })
}

export async function updateProduct(id: string, updates: Partial<NewProduct>) {
  await apiRequest(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
}

export async function deleteProduct(id: string) {
  await apiRequest(`/api/products/${id}`, { method: 'DELETE' })
}
