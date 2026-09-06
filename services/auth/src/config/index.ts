import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  serviceName: process.env.AUTH_SERVICE_NAME ?? 'auth',
  port: Number(process.env.AUTH_PORT ?? 3001),
}
