import { Router } from 'express'
import { config } from '../../config'

export const notificationRoutes = Router()

notificationRoutes.get('/health', (_req, res) => {
  res.json({ service: config.serviceName })
})
