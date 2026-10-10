import { ApiError } from '../../utils/api-error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

interface RegisterBody {
  email?: unknown
  password?: unknown
}

interface LoginBody {
  email?: unknown
  password?: unknown
}

export function validateRegister(body: RegisterBody): RegisterInput {
  const email = readEmail(body?.email)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters')
  }

  return { email, password }
}

export function validateLogin(body: LoginBody): LoginInput {
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
