import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  serviceName: process.env.PASSPORT_SERVICE_NAME ?? 'passport',
  port: Number(process.env.PASSPORT_PORT ?? 3002),
  mongoUri: required('MONGO_URI'),
  authServiceUrl: required('AUTH_SERVICE_URL'),
  kafkaBroker: process.env.KAFKA_BROKER ?? 'localhost:9092',
  kafkaProducerRetries: Number(process.env.KAFKA_PRODUCER_RETRIES ?? 3),
}
