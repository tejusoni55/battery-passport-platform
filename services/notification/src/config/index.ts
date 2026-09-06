import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  serviceName: process.env.NOTIFICATION_SERVICE_NAME ?? 'notification',
  port: Number(process.env.NOTIFICATION_PORT ?? 3004),
}
