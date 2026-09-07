import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { downloadUrl, list, remove, update, upload } from './document.controller'
import { uploadMiddleware } from './document.validation'

export const documentRoutes = Router()

documentRoutes.post('/upload', authenticate, uploadMiddleware.single('file'), upload)
documentRoutes.get('/', authenticate, list)
documentRoutes.get('/:docId', authenticate, downloadUrl)
documentRoutes.put('/:docId', authenticate, update)
documentRoutes.delete('/:docId', authenticate, remove)
