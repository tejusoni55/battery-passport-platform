import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { downloadUrl, list, remove, update, upload } from './document.controller'
import { uploadMiddleware } from './document.validation'

export const documentRoutes = Router()

/**
 * @openapi
 * /api/documents/upload:
 *   post:
 *     tags: [Document]
 *     summary: Upload a file (max 20 MB)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { content: { multipart/form-data: { schema: { $ref: '#/components/schemas/UploadRequest' } } } }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/DocumentResponse' } } } }
 *       400: { description: A file is required }
 *       413: { description: File exceeds 20 MB limit }
 */
documentRoutes.post('/upload', authenticate, uploadMiddleware.single('file'), upload)

/**
 * @openapi
 * /api/documents:
 *   get:
 *     tags: [Document]
 *     summary: List uploaded document metadata
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/DocumentListResponse' } } } }
 */
documentRoutes.get('/', authenticate, list)

/**
 * @openapi
 * /api/documents/{docId}:
 *   get:
 *     tags: [Document]
 *     summary: Get a presigned download URL
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: docId, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/DownloadUrlResponse' } } } }
 *       404: { description: Document not found }
 */
documentRoutes.get('/:docId', authenticate, downloadUrl)

/**
 * @openapi
 * /api/documents/{docId}:
 *   put:
 *     tags: [Document]
 *     summary: Rename a document
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: docId, in: path, required: true, schema: { type: string } }]
 *     requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/UpdateDocumentRequest' } } } }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/DocumentResponse' } } } }
 *       400: { description: fileName is required }
 *       404: { description: Document not found }
 */
documentRoutes.put('/:docId', authenticate, update)

/**
 * @openapi
 * /api/documents/{docId}:
 *   delete:
 *     tags: [Document]
 *     summary: Delete a document
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: docId, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Document not found }
 */
documentRoutes.delete('/:docId', authenticate, remove)
