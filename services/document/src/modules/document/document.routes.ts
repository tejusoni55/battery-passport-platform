import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { downloadUrl, list, remove, upload } from './document.controller'
import { uploadMiddleware } from './document.validation'

export const documentRoutes = Router()

documentRoutes.post('/upload', authenticate, uploadMiddleware.single('file'), upload)
documentRoutes.get('/', authenticate, list)
documentRoutes.get('/:id/download', authenticate, downloadUrl)
documentRoutes.delete('/:id', authenticate, remove)
