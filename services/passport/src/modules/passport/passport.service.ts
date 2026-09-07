import mongoose from 'mongoose'
import { publishEvent } from '../../config/kafka'
import { ApiError } from '../../utils/api-error'
import { PassportModel } from './passport.model'
import { PassportInput } from './passport.validation'

export async function createPassport(input: PassportInput) {
  const existing = await PassportModel.findOne({ batteryIdentifier: input.batteryIdentifier })
  if (existing) {
    throw new ApiError(409, 'A passport with this battery identifier already exists')
  }

  const passport = await PassportModel.create(input)
  void publishEvent('passport.created', {
    passportId: passport.id,
    batteryIdentifier: passport.batteryIdentifier,
    eventType: 'created',
    timestamp: new Date().toISOString(),
  })

  return passport
}

export async function listPassports() {
  return PassportModel.find().sort({ createdAt: -1 })
}

export async function getPassportById(id: string) {
  const passport = await PassportModel.findById(assertValidId(id))
  if (!passport) {
    throw new ApiError(404, 'Passport not found')
  }
  return passport
}

export async function updatePassport(id: string, input: PassportInput) {
  const passport = await PassportModel.findById(assertValidId(id))
  if (!passport) {
    throw new ApiError(404, 'Passport not found')
  }

  if (input.batteryIdentifier !== passport.batteryIdentifier) {
    const existing = await PassportModel.findOne({ batteryIdentifier: input.batteryIdentifier })
    if (existing) {
      throw new ApiError(409, 'A passport with this battery identifier already exists')
    }
  }

  Object.assign(passport, input)
  await passport.save()

  return passport
}

export async function deletePassport(id: string) {
  const passport = await PassportModel.findByIdAndDelete(assertValidId(id))
  if (!passport) {
    throw new ApiError(404, 'Passport not found')
  }

  void publishEvent('passport.deleted', {
    passportId: passport.id,
    batteryIdentifier: passport.batteryIdentifier,
    eventType: 'deleted',
    timestamp: new Date().toISOString(),
  })

  return passport
}

function assertValidId(id: string): string {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid passport id')
  }
  return id
}
