import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './config'
import type { Category, Product } from '../types'

const productsRef = collection(db, 'products')

function fromDoc(id: string, data: DocumentData): Product {
  return {
    id,
    name: data.name,
    category: data.category,
    brand: data.brand,
    price: data.price,
    description: data.description,
    imageSeed: data.imageSeed,
    stock: data.stock,
    createdAt: data.createdAt?.toMillis?.(),
    updatedAt: data.updatedAt?.toMillis?.(),
  }
}

export async function listProducts(): Promise<Product[]> {
  const snap = await getDocs(query(productsRef, orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => fromDoc(d.id, d.data()))
}

export async function listProductsByCategory(category: Category): Promise<Product[]> {
  const snap = await getDocs(
    query(productsRef, where('category', '==', category), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => fromDoc(d.id, d.data()))
}

export type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export async function createProduct(product: NewProduct) {
  await addDoc(productsRef, {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateProduct(id: string, updates: Partial<NewProduct>) {
  await updateDoc(doc(db, 'products', id), { ...updates, updatedAt: serverTimestamp() })
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'products', id))
}
