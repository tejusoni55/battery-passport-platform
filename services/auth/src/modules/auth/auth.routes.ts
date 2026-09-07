import { Router } from 'express'
import { authenticate } from '../../middleware/auth.middleware'
import { login, profile, register } from './auth.controller'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.get('/profile', authenticate, profile)
