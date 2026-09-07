import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { login, profile, register } from './auth.controller'

export const authRoutes = Router()

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/RegisterRequest' } } } }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/RegisterResponse' } } } }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
authRoutes.post('/register', register)

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/LoginRequest' } } } }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/LoginResponse' } } } }
 *       400: { description: Validation error }
 *       401: { description: Invalid credentials }
 */
authRoutes.post('/login', login)

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Profile' } } } }
 *       401: { description: Missing or invalid token }
 *       404: { description: User not found }
 */
authRoutes.get('/profile', authenticate, profile)
