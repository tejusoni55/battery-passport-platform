import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  serviceName: process.env.DOCUMENT_SERVICE_NAME ?? 'document',
  port: Number(process.env.DOCUMENT_PORT ?? 3003),
}
