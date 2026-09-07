import { Router } from 'express'
import { authenticate, requireAdmin } from '../../middleware/auth.middleware'
import { create, getOne, list, remove, update } from './passport.controller'

export const passportRoutes = Router()

passportRoutes.post('/', authenticate, requireAdmin, create)
passportRoutes.get('/', authenticate, list)
passportRoutes.get('/:id', authenticate, getOne)
passportRoutes.put('/:id', authenticate, requireAdmin, update)
passportRoutes.delete('/:id', authenticate, requireAdmin, remove)
