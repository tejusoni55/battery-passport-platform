import path from 'path'
import dotenv from 'dotenv'
import type { SignOptions } from 'jsonwebtoken'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

// jsonwebtoken treats a numeric value as seconds but a numeric *string* as
// milliseconds, so bare digits (e.g. "3600") must be converted to a number;
// unit-suffixed strings (e.g. "1d", "12h") are passed through as-is.
function parseJwtExpiresIn(raw: string): SignOptions['expiresIn'] {
  return /^\d+$/.test(raw) ? Number(raw) : (raw as SignOptions['expiresIn'])
}

export const config = {
  serviceName: process.env.AUTH_SERVICE_NAME ?? 'auth',
  port: Number(process.env.AUTH_PORT ?? 3001),
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: parseJwtExpiresIn(process.env.JWT_EXPIRES_IN ?? '3600'),
  // Extra origins allowed to call this API from a browser (e.g. this
  // service's own Railway public URL), on top of its own localhost — see
  // app.ts. Comma-separated; empty/unset is fine, localhost still works.
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
