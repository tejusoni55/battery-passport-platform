import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import { config } from '../config'
import { ApiError } from '../utils/api-error'

export interface AuthUser {
  userId: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? ''

  if (!header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'))
  }

  try {
    const response = await axios.get(`${config.authServiceUrl}/api/auth/profile`, {
      headers: { Authorization: header },
    })

    req.user = {
      userId: response.data.id,
      email: response.data.email,
      role: response.data.role,
    }
    next()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return next(new ApiError(err.response.status, 'Invalid or expired token'))
    }
    next(new ApiError(502, 'Failed to reach auth service'))
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin role required'))
  }
  next()
}
