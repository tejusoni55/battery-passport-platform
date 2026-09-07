import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './index'

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Auth Service API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          example: { email: 'alice@example.com', password: 'password123', role: 'user' },
        },
        RegisterResponse: {
          type: 'object',
          example: { id: '66f1e2a1c2a4b7e1f0a12345', email: 'alice@example.com', role: 'user' },
        },
        LoginRequest: {
          type: 'object',
          example: { email: 'alice@example.com', password: 'password123' },
        },
        LoginResponse: {
          type: 'object',
          example: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
        Profile: {
          type: 'object',
          example: {
            id: '66f1e2a1c2a4b7e1f0a12345',
            email: 'alice@example.com',
            role: 'user',
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-01-15T10:00:00.000Z',
          },
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/modules/**/*.routes.ts', './dist/app.js', './dist/modules/**/*.routes.js'],
})
