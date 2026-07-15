import { Schema, model, type Document } from 'mongoose'

export const CATEGORY_VALUES = [
  'drivers',
  'fairway-woods',
  'irons',
  'wedges',
  'putters',
  'golf-balls',
] as const

export type Category = (typeof CATEGORY_VALUES)[number]

export interface ProductDocument extends Document {
  name: string
  category: Category
  brand: string
  price: number
  description: string
  imageSeed: string
  stock: number
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    category: { type: String, enum: CATEGORY_VALUES, required: true, index: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    imageSeed: { type: String, required: true },
    stock: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.getTime()
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.getTime()
        return ret
      },
    },
  },
)

export const Product = model<ProductDocument>('Product', productSchema)
