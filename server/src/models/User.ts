import { Schema, model, type Document } from 'mongoose'

export interface AddressDoc {
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface UserDocument extends Document {
  email: string
  passwordHash: string
  displayName: string
  role: 'admin' | 'customer'
  phone?: string
  address?: AddressDoc
  createdAt: Date
  updatedAt: Date
}

const addressSchema = new Schema<AddressDoc>(
  {
    line1: { type: String, default: '' },
    line2: { type: String },
    city: { type: String, default: '' },
    postcode: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false },
)

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    phone: { type: String },
    address: { type: addressSchema },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.getTime()
        if (ret.updatedAt instanceof Date) ret.updatedAt = ret.updatedAt.getTime()
        return ret
      },
    },
  },
)

export const User = model<UserDocument>('User', userSchema)
