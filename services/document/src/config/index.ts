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
  serviceName: process.env.DOCUMENT_SERVICE_NAME ?? 'document',
  port: Number(process.env.DOCUMENT_PORT ?? 3003),
  mongoUri: required('MONGO_URI'),
  authServiceUrl: required('AUTH_SERVICE_URL'),
  minioEndpoint: required('MINIO_ENDPOINT'),
  minioPublicUrl: required('MINIO_PUBLIC_URL'),
  minioAccessKey: required('MINIO_ROOT_USER'),
  minioSecretKey: required('MINIO_ROOT_PASSWORD'),
  minioBucket: process.env.MINIO_BUCKET ?? 'documents',
}
