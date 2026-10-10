import { Kafka } from 'kafkajs'
import { config } from '../../config'
import { errorMeta, logger } from '../../utils/logger'
import { PassportEvent, sendPassportEventEmail } from './notification.service'

const TOPICS = ['passport.created', 'passport.updated', 'passport.deleted']

const kafka = new Kafka({ clientId: config.serviceName, brokers: [config.kafkaBroker] })
const consumer = kafka.consumer({ groupId: 'notification-service' })

function processEvent(event: PassportEvent): Promise<void> {
  // Updates are informational only — no email is sent for them.
  if (event.eventType === 'updated') {
    return Promise.resolve()
  }
  return sendPassportEventEmail(event)
}

export async function handleMessage(rawValue: string): Promise<void> {
  const event = JSON.parse(rawValue) as PassportEvent
  await processEvent(event)
}

export async function processMessage(rawValue: string | null | undefined): Promise<void> {
  if (!rawValue) return

  let event: PassportEvent
  try {
    event = JSON.parse(rawValue) as PassportEvent
  } catch (err) {
    // Only a JSON parsing failure lands here, never a delivery failure: a
    // malformed payload can never succeed on retry, so log it and move on
    // instead of blocking the partition on it forever.
    logger.error('skipping malformed passport event', errorMeta(err))
    return
  }

  // Any failure from here (e.g. SMTP unavailable) is structurally guaranteed
  // to be a processing failure, not a parsing one, so let it propagate —
  // kafkajs retries this message instead of silently acknowledging and
  // discarding a notification that was never sent.
  await processEvent(event)
}

export async function startConsumer(): Promise<void> {
  await consumer.connect()
  await consumer.subscribe({ topics: TOPICS, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      await processMessage(message.value?.toString())
    },
  })
}

export async function stopConsumer(): Promise<void> {
  await consumer.disconnect()
}
