export type Category =
  | 'drivers'
  | 'fairway-woods'
  | 'irons'
  | 'wedges'
  | 'putters'
  | 'golf-balls'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'drivers', label: 'Drivers' },
  { value: 'fairway-woods', label: 'Fairway Woods' },
  { value: 'irons', label: 'Irons' },
  { value: 'wedges', label: 'Wedges' },
  { value: 'putters', label: 'Putters' },
  { value: 'golf-balls', label: 'Golf Balls' },
]

export type Role = 'admin' | 'customer'

export interface Address {
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface UserProfile {
  id: string
  email: string
  displayName: string
  role: Role
  phone?: string
  address?: Address
  createdAt: number
}

export interface Product {
  id: string
  name: string
  category: Category
  brand: string
  price: number
  description: string
  imageSeed: string
  stock: number
  createdAt?: number
  updatedAt?: number
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageSeed: string
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'completed'

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  createdAt: number
  emailSent?: boolean
  emailError?: string
}
