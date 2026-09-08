import winston from 'winston'
import { config } from '../config'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: config.serviceName },
  transports: [new winston.transports.Console()],
})

export function errorMeta(err: unknown): { error: string; stack?: string } {
  if (!(err instanceof Error)) {
    return { error: String(err) }
  }
  const meta: { error: string; stack?: string } = { error: err.message }
  if (process.env.NODE_ENV !== 'production') {
    meta.stack = err.stack
  }
  return meta
}
