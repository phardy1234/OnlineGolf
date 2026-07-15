import mongoose from 'mongoose'
import { config } from './env.js'

export async function connectToDatabase() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongoUri)
  console.log('Connected to MongoDB')
}
