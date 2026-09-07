import mongoose from 'mongoose'
import { logger } from '../utils/logger'
import { config } from './index'

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri)
  logger.info('auth service connected to mongodb')
}
