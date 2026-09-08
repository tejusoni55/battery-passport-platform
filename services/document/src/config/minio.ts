import { Client } from 'minio'
import { errorMeta, logger } from '../utils/logger'
import { config } from './index'

function createClient(endpointUrl: string): Client {
  const endpoint = new URL(endpointUrl)
  const useSSL = endpoint.protocol === 'https:'
  return new Client({
    endPoint: endpoint.hostname,
    port: Number(endpoint.port) || (useSSL ? 443 : 80),
    useSSL,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey,
    // Without a fixed region, the SDK looks it up with a live request to the
    // configured endpoint before it can sign anything — pinning it (MinIO's
    // own default) keeps presigning a pure local computation, no network call.
    region: 'us-east-1',
  })
}

// Used for actual object operations, reachable only from inside the Docker network.
const minioClient = createClient(config.minioEndpoint)

// Presigned URLs are signed locally (no network call), so a second client
// configured with the browser-reachable host can sign requests that resolve
// correctly outside Docker, without changing where the SDK itself connects.
const presignClient = createClient(config.minioPublicUrl)

export async function ensureBucket(): Promise<void> {
  let exists: boolean
  try {
    exists = await minioClient.bucketExists(config.minioBucket)
  } catch (err) {
    // A throw here means MinIO is unreachable or the credentials are wrong —
    // not "bucket doesn't exist" (bucketExists resolves false for that case).
    // Treating it as false would hide the real problem and likely fail again,
    // more confusingly, on the makeBucket call below.
    logger.error('failed to check MinIO bucket', { bucket: config.minioBucket, ...errorMeta(err) })
    throw err
  }

  if (exists) {
    return
  }

  try {
    await minioClient.makeBucket(config.minioBucket)
    logger.info('created MinIO bucket', { bucket: config.minioBucket })
  } catch (err) {
    logger.error('failed to create MinIO bucket', { bucket: config.minioBucket, ...errorMeta(err) })
    throw err
  }
}

export async function putObject(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  await minioClient.putObject(config.minioBucket, key, buffer, buffer.length, { 'Content-Type': mimeType })
}

export async function getPresignedDownloadUrl(key: string, expirySeconds = 300): Promise<string> {
  return presignClient.presignedGetObject(config.minioBucket, key, expirySeconds)
}

export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(config.minioBucket, key)
}
