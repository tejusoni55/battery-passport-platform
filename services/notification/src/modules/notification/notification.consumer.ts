import { Kafka } from 'kafkajs'
import { config } from '../../config'
import { errorMeta, logger } from '../../utils/logger'
import { PassportEvent, sendPassportEventEmail } from './notification.service'

const TOPICS = ['passport.created', 'passport.updated', 'passport.deleted']

const kafka = new Kafka({ clientId: config.serviceName, brokers: [config.kafkaBroker] })
const consumer = kafka.consumer({ groupId: 'notification-service' })

export async function handleMessage(rawValue: string): Promise<void> {
  const event = JSON.parse(rawValue) as PassportEvent
  // Updates are informational only — no email is sent for them.
  if (event.eventType === 'updated') {
    return
  }
  await sendPassportEventEmail(event)
}

export async function startConsumer(): Promise<void> {
  await consumer.connect()
  await consumer.subscribe({ topics: TOPICS, fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return
      try {
        await handleMessage(message.value.toString())
      } catch (err) {
        logger.error('failed to process passport event', errorMeta(err))
      }
    },
  })
}

export async function stopConsumer(): Promise<void> {
  await consumer.disconnect()
}
