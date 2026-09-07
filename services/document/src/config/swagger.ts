import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './index'

const document = {
  docId: '66f1e2a1c2a4b7e1f0a12345',
  fileName: 'report.pdf',
  mimeType: 'application/pdf',
  fileSize: 10575,
  s3Key: '3f0e74c6-0dc5-48b2-b857-4a49040b4684.pdf',
  uploadedBy: '66f1e2a1c2a4b7e1f0a12345',
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
}

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Document Service API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        UploadRequest: {
          type: 'object',
          properties: { file: { type: 'string', format: 'binary' } },
        },
        DocumentResponse: { type: 'object', example: document },
        DocumentListResponse: { type: 'array', items: { type: 'object' }, example: [document] },
        UpdateDocumentRequest: {
          type: 'object',
          example: { fileName: 'renamed-report.pdf' },
        },
        DownloadUrlResponse: {
          type: 'object',
          example: { url: 'http://localhost:9000/documents/3f0e74c6-0dc5-48b2-b857-4a49040b4684.pdf?X-Amz-Signature=...' },
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/modules/**/*.routes.ts', './dist/app.js', './dist/modules/**/*.routes.js'],
})
