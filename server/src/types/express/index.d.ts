import type { UserDocument } from '../../models/User.js'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: UserDocument['role']
      }
    }
  }
}

export {}
