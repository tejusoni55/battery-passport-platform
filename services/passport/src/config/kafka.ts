import { Kafka, Producer } from 'kafkajs'
import { config } from './index'

const kafka = new Kafka({
  clientId: config.serviceName,
  brokers: [config.kafkaBroker],
  connectionTimeout: 1000,
  requestTimeout: 2000,
  retry: { retries: 0 },
})
const producer: Producer = kafka.producer({ retry: { retries: 0 } })

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
    console.error(`failed to publish event to topic "${topic}"`, err)
  }
}

export async function disconnectProducer(): Promise<void> {
  connectPromise = null
  await producer.disconnect()
}
