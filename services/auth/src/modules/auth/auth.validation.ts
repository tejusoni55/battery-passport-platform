import { ApiError } from '../../utils/api-error'
import { UserRole } from './auth.model'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLES: UserRole[] = ['admin', 'user']

export interface RegisterInput {
  email: string
  password: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export function validateRegister(body: any): RegisterInput {
  const email = readEmail(body?.email)
  const password = typeof body?.password === 'string' ? body.password : ''
  const role = body?.role

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters')
  }
  if (!ROLES.includes(role)) {
    throw new ApiError(400, "Role must be either 'admin' or 'user'")
  }

  return { email, password, role }
}

export function validateLogin(body: any): LoginInput {
  const email = readEmail(body?.email)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!password) {
    throw new ApiError(400, 'Password is required')
  }

  return { email, password }
}

function readEmail(value: unknown): string {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'A valid email is required')
  }
  return email
}
