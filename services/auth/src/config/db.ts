import mongoose from 'mongoose'
import { config } from './index'

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri)
  console.log('auth service connected to mongodb')
}
