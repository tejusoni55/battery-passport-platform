import { ApiError } from '../../utils/api-error'
import {
  BATTERY_CATEGORIES,
  BATTERY_STATUSES,
  BatteryCategory,
  BatteryStatus,
  CarbonFootprint,
  Circularity,
  HazardousSubstance,
} from './passport.model'

export interface PassportInput {
  batteryIdentifier: string
  batteryCategory: BatteryCategory
  batteryStatus: BatteryStatus
  batteryModel: { modelName: string; modelNumber: string }
  manufacturer: { name: string; address: string; contact: string }
  manufacturingDate: Date
  batteryMass: number
  batteryChemistry: string
  criticalRawMaterials: string[]
  hazardousSubstances: HazardousSubstance[]
  carbonFootprint: CarbonFootprint
  circularity: Circularity
}

export function validatePassportInput(body: any): PassportInput {
  const batteryIdentifier = requiredString(body?.batteryIdentifier, 'batteryIdentifier')
  const batteryCategory = requiredEnum(body?.batteryCategory, BATTERY_CATEGORIES, 'batteryCategory')
  const batteryStatus = requiredEnum(body?.batteryStatus, BATTERY_STATUSES, 'batteryStatus')
  const batteryModel = validateBatteryModel(body?.batteryModel)
  const manufacturer = validateManufacturer(body?.manufacturer)
  const manufacturingDate = requiredDate(body?.manufacturingDate, 'manufacturingDate')
  const batteryMass = requiredNumber(body?.batteryMass, 'batteryMass')
  const batteryChemistry = requiredString(body?.batteryChemistry, 'batteryChemistry')
  const criticalRawMaterials = validateStringArray(body?.criticalRawMaterials, 'criticalRawMaterials')
  const hazardousSubstances = validateHazardousSubstances(body?.hazardousSubstances)
  const carbonFootprint = validateCarbonFootprint(body?.carbonFootprint)
  const circularity = validateCircularity(body?.circularity)

  return {
    batteryIdentifier,
    batteryCategory,
    batteryStatus,
    batteryModel,
    manufacturer,
    manufacturingDate,
    batteryMass,
    batteryChemistry,
    criticalRawMaterials,
    hazardousSubstances,
    carbonFootprint,
    circularity,
  }
}

function validateBatteryModel(value: any): { modelName: string; modelNumber: string } {
  return {
    modelName: requiredString(value?.modelName, 'batteryModel.modelName'),
    modelNumber: requiredString(value?.modelNumber, 'batteryModel.modelNumber'),
  }
}

function validateManufacturer(value: any): { name: string; address: string; contact: string } {
  return {
    name: requiredString(value?.name, 'manufacturer.name'),
    address: requiredString(value?.address, 'manufacturer.address'),
    contact: requiredString(value?.contact, 'manufacturer.contact'),
  }
}

function validateHazardousSubstances(value: any): HazardousSubstance[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'hazardousSubstances must be an array')
  }
  return value.map((item, index) => ({
    name: requiredString(item?.name, `hazardousSubstances[${index}].name`),
    casNumber: requiredString(item?.casNumber, `hazardousSubstances[${index}].casNumber`),
    concentration: requiredNumber(item?.concentration, `hazardousSubstances[${index}].concentration`),
  }))
}

function validateCarbonFootprint(value: any): CarbonFootprint {
  return {
    totalCo2Kg: requiredNumber(value?.totalCo2Kg, 'carbonFootprint.totalCo2Kg'),
    methodology: requiredString(value?.methodology, 'carbonFootprint.methodology'),
    calculatedAt: requiredDate(value?.calculatedAt, 'carbonFootprint.calculatedAt'),
  }
}

function validateCircularity(value: any): Circularity {
  return {
    recycledContentPercentage: requiredNumber(
      value?.recycledContentPercentage,
      'circularity.recycledContentPercentage'
    ),
    recyclabilityPercentage: requiredNumber(value?.recyclabilityPercentage, 'circularity.recyclabilityPercentage'),
    expectedLifetimeYears: requiredNumber(value?.expectedLifetimeYears, 'circularity.expectedLifetimeYears'),
  }
}

function validateStringArray(value: any, field: string): string[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new ApiError(400, `${field} must be an array of strings`)
  }
  return value
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required`)
  }
  return value.trim()
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ApiError(400, `${field} must be a number`)
  }
  return value
}

function requiredDate(value: unknown, field: string): Date {
  const date = new Date(value as string)
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new ApiError(400, `${field} is required`)
  }
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${field} must be a valid date`)
  }
  return date
}

function requiredEnum<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ApiError(400, `${field} must be one of: ${allowed.join(', ')}`)
  }
  return value as T
}
