import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  serviceName: process.env.PASSPORT_SERVICE_NAME ?? 'passport',
  port: Number(process.env.PASSPORT_PORT ?? 3002),
}
