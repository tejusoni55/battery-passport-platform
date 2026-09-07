import { Client } from 'minio'
import { config } from './index'

const endpoint = new URL(config.minioEndpoint)
const useSSL = endpoint.protocol === 'https:'

const minioClient = new Client({
  endPoint: endpoint.hostname,
  port: Number(endpoint.port) || (useSSL ? 443 : 80),
  useSSL,
  accessKey: config.minioAccessKey,
  secretKey: config.minioSecretKey,
})

export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(config.minioBucket).catch(() => false)
  if (!exists) {
    await minioClient.makeBucket(config.minioBucket)
  }
}

export async function putObject(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  await minioClient.putObject(config.minioBucket, key, buffer, buffer.length, { 'Content-Type': mimeType })
}

export async function getPresignedDownloadUrl(key: string, expirySeconds = 300): Promise<string> {
  return minioClient.presignedGetObject(config.minioBucket, key, expirySeconds)
}

export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(config.minioBucket, key)
}
