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
  serviceName: process.env.NOTIFICATION_SERVICE_NAME ?? 'notification',
  port: Number(process.env.NOTIFICATION_PORT ?? 3004),
  kafkaBroker: required('KAFKA_BROKER'),
  smtpHost: required('SMTP_HOST'),
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? 'notifications@battery-passport.local',
  notifyEmailTo: required('NOTIFY_EMAIL_TO'),
}
