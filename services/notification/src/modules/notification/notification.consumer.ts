import { Kafka } from 'kafkajs'
import { config } from '../../config'
import { PassportEvent, sendPassportEventEmail } from './notification.service'

const TOPICS = ['passport.created', 'passport.deleted']

const kafka = new Kafka({ clientId: config.serviceName, brokers: [config.kafkaBroker] })
const consumer = kafka.consumer({ groupId: 'notification-service' })

export async function handleMessage(rawValue: string): Promise<void> {
  const event = JSON.parse(rawValue) as PassportEvent
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
        console.error('failed to process passport event', err)
      }
    },
  })
}

export async function stopConsumer(): Promise<void> {
  await consumer.disconnect()
}
