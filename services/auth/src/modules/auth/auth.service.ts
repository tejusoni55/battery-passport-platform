import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { ApiError } from '../../utils/api-error'
import { UserModel } from './auth.model'
import { LoginInput, RegisterInput } from './auth.validation'

const SALT_ROUNDS = 10

export async function registerUser(input: RegisterInput) {
  const existing = await UserModel.findOne({ email: input.email })
  if (existing) {
    throw new ApiError(409, 'Email is already registered')
  }

  const password = await bcrypt.hash(input.password, SALT_ROUNDS)
  const user = await UserModel.create({ email: input.email, password, role: input.role })

  return { id: user.id, email: user.email, role: user.role }
}

export async function loginUser(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email })
  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )

  return { token }
}

export async function getUserProfile(userId: string) {
  const user = await UserModel.findById(userId).select('-password')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
