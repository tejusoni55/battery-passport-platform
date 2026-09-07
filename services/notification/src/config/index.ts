import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') })

export const config = {
  serviceName: process.env.NOTIFICATION_SERVICE_NAME ?? 'notification',
  port: Number(process.env.NOTIFICATION_PORT ?? 3004),
  kafkaBroker: process.env.KAFKA_BROKER ?? 'localhost:9092',
  smtpHost: process.env.SMTP_HOST ?? 'mailpit',
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? 'notifications@battery-passport.local',
  notifyEmailTo: process.env.NOTIFY_EMAIL_TO ?? 'ops@battery-passport.local',
}
