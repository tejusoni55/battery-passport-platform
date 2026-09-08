import nodemailer from 'nodemailer'
import { config } from '../../config'

export interface PassportEvent {
  passportId: string
  batteryIdentifier: string
  eventType: 'created' | 'updated' | 'deleted'
  timestamp: string
}

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: false,
  auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPassword } : undefined,
})

const SUBJECTS: Record<PassportEvent['eventType'], string> = {
  created: 'Passport Created',
  updated: 'Passport Updated',
  deleted: 'Passport Deleted',
}

export async function sendPassportEventEmail(event: PassportEvent): Promise<void> {
  const text = [
    `Passport ID: ${event.passportId}`,
    `Battery Identifier: ${event.batteryIdentifier}`,
    `Event: ${event.eventType}`,
    `Timestamp: ${event.timestamp}`,
  ].join('\n')

  await transporter.sendMail({
    from: config.smtpFrom,
    to: config.notifyEmailTo,
    subject: SUBJECTS[event.eventType],
    text,
  })
}
