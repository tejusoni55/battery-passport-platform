import { Router } from 'express'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { create, getOne, list, remove, update } from './passport.controller'

export const passportRoutes = Router()

/**
 * @openapi
 * /api/passports:
 *   post:
 *     tags: [Passport]
 *     summary: Create a battery passport (admin only)
 *     security: [{ bearerAuth: [] }]
 *     requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/PassportRequest' } } } }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/PassportResponse' } } } }
 *       400: { description: Validation error }
 *       403: { description: Admin role required }
 *       409: { description: Duplicate battery identifier }
 */
passportRoutes.post('/', authenticate, requireAdmin, create)

/**
 * @openapi
 * /api/passports:
 *   get:
 *     tags: [Passport]
 *     summary: List battery passports (paginated)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer, default: 1 } }
 *       - { name: limit, in: query, schema: { type: integer, default: 10 } }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/PassportListResponse' } } } }
 *       400: { description: Invalid page or limit }
 */
passportRoutes.get('/', authenticate, list)

/**
 * @openapi
 * /api/passports/{id}:
 *   get:
 *     tags: [Passport]
 *     summary: Get a battery passport by id
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/PassportResponse' } } } }
 *       404: { description: Passport not found }
 */
passportRoutes.get('/:id', authenticate, getOne)

/**
 * @openapi
 * /api/passports/{id}:
 *   put:
 *     tags: [Passport]
 *     summary: Replace a battery passport (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     requestBody: { content: { application/json: { schema: { $ref: '#/components/schemas/PassportRequest' } } } }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/PassportResponse' } } } }
 *       403: { description: Admin role required }
 *       404: { description: Passport not found }
 */
passportRoutes.put('/:id', authenticate, requireAdmin, update)

/**
 * @openapi
 * /api/passports/{id}:
 *   delete:
 *     tags: [Passport]
 *     summary: Delete a battery passport (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: Deleted }
 *       403: { description: Admin role required }
 *       404: { description: Passport not found }
 */
passportRoutes.delete('/:id', authenticate, requireAdmin, remove)
