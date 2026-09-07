import winston from 'winston'
import { config } from '../config'

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: config.serviceName },
  transports: [new winston.transports.Console()],
})

export function errorMeta(err: unknown): { error: string } {
  return { error: err instanceof Error ? err.message : String(err) }
}
