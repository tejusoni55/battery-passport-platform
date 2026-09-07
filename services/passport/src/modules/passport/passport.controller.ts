import { NextFunction, Request, Response } from 'express'
import { createPassport, deletePassport, getPassportById, listPassports, updatePassport } from './passport.service'
import { validatePassportInput } from './passport.validation'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validatePassportInput(req.body?.data)
    const passport = await createPassport(input)
    res.status(201).json(passport)
  } catch (err) {
    next(err)
  }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const passports = await listPassports()
    res.json(passports)
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const passport = await getPassportById(req.params.id)
    res.json(passport)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validatePassportInput(req.body?.data)
    const passport = await updatePassport(req.params.id, input)
    res.json(passport)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deletePassport(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
