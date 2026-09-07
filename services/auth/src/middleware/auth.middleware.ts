import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { ApiError } from '../utils/api-error'
import { UserRole } from '../modules/auth/auth.model'

export interface AuthUser {
  userId: string
  email: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''

  if (!header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'))
  }

  const token = header.slice('Bearer '.length).trim()

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}
