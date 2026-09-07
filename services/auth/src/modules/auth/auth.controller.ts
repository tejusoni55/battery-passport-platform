import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../../utils/api-error'
import { getUserProfile, loginUser, registerUser } from './auth.service'
import { validateLogin, validateRegister } from './auth.validation'

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateRegister(req.body)
    const user = await registerUser(input)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateLogin(req.body)
    const result = await loginUser(input)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function profile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated')
    }
    const data = await getUserProfile(req.user.userId)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
