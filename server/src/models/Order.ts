import { Schema, model, Types, type Document } from 'mongoose'

export interface OrderItemDoc {
  productId: string
  name: string
  price: number
  quantity: number
  imageSeed: string
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'completed'

export interface OrderDocument extends Document {
  userId: Types.ObjectId
  items: OrderItemDoc[]
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageSeed: { type: String, required: true },
  },
  { _id: false },
)

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'completed'],
      default: 'placed',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString()
        ret.userId = ret.userId.toString()
        delete ret._id
        delete ret.__v
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.getTime()
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.getTime()
        return ret
      },
    },
  },
)

export const Order = model<OrderDocument>('Order', orderSchema)
