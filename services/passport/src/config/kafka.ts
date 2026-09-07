import { Kafka, Producer } from 'kafkajs'
import { errorMeta, logger } from '../utils/logger'
import { config } from './index'

const kafka = new Kafka({
  clientId: config.serviceName,
  brokers: [config.kafkaBroker],
  connectionTimeout: 1000,
  requestTimeout: 2000,
  retry: { retries: config.kafkaProducerRetries },
})
const producer: Producer = kafka.producer({ retry: { retries: config.kafkaProducerRetries } })

let connectPromise: Promise<void> | null = null

function ensureConnected(): Promise<void> {
  if (!connectPromise) {
    connectPromise = producer.connect().catch((err) => {
      connectPromise = null
      throw err
    })
  }
  return connectPromise
}

export async function publishEvent(topic: string, message: Record<string, unknown>): Promise<void> {
  try {
    await ensureConnected()
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    })
  } catch (err) {
    logger.error(`failed to publish event to topic "${topic}"`, errorMeta(err))
  }
}

export async function disconnectProducer(): Promise<void> {
  connectPromise = null
  await producer.disconnect()
}
