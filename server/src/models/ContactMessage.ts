import { Schema, model, type Document } from 'mongoose'

export interface ContactMessageDocument extends Document {
  name: string
  email: string
  message: string
  emailSent: boolean
  emailError?: string
  createdAt: Date
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    emailError: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        if (ret.createdAt instanceof Date) ret.createdAt = ret.createdAt.getTime()
        return ret
      },
    },
  },
)

export const ContactMessage = model<ContactMessageDocument>('ContactMessage', contactMessageSchema)
