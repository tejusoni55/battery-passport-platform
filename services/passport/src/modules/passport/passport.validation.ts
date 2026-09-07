import type { ParsedQs } from 'qs'
import { ApiError } from '../../utils/api-error'
import {
  BATTERY_CATEGORIES,
  BATTERY_STATUSES,
  BatteryModelInfo,
  CarbonFootprint,
  GeneralInformation,
  HazardousSubstance,
  ManufacturerInformation,
  MaterialComposition,
} from './passport.model'

export interface PassportInput {
  generalInformation: GeneralInformation
  materialComposition: MaterialComposition
  carbonFootprint: CarbonFootprint
}

export interface PaginationQuery {
  page: number
  limit: number
}

// The top-level shape of a create/update request body. Everything below this
// is an untyped fragment of the payload — read with Record<string, unknown>
// and narrowed field-by-field by the `required*` helpers, so one small
// interface per nested object isn't worth maintaining separately.
interface PassportBody {
  generalInformation?: unknown
  materialComposition?: unknown
  carbonFootprint?: unknown
}

const MAX_LIMIT = 100

export function validatePaginationQuery(query: ParsedQs): PaginationQuery {
  const page = parsePositiveInt(query?.page, 1, 'page')
  const limit = parsePositiveInt(query?.limit, 10, 'limit')

  if (limit > MAX_LIMIT) {
    throw new ApiError(400, `limit must not exceed ${MAX_LIMIT}`)
  }

  return { page, limit }
}

function parsePositiveInt(value: unknown, defaultValue: number, field: string): number {
  if (value === undefined) {
    return defaultValue
  }
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1) {
    throw new ApiError(400, `${field} must be a positive integer`)
  }
  return Number(value)
}

export function validatePassportInput(data: PassportBody): PassportInput {
  if (typeof data !== 'object' || data === null) {
    throw new ApiError(400, 'data is required')
  }

  return {
    generalInformation: validateGeneralInformation(data.generalInformation),
    materialComposition: validateMaterialComposition(data.materialComposition),
    carbonFootprint: validateCarbonFootprint(data.carbonFootprint),
  }
}

function validateGeneralInformation(value: unknown): GeneralInformation {
  const v = value as Record<string, unknown>
  return {
    batteryIdentifier: requiredString(v?.batteryIdentifier, 'data.generalInformation.batteryIdentifier'),
    batteryModel: validateBatteryModel(v?.batteryModel),
    batteryMass: requiredNumber(v?.batteryMass, 'data.generalInformation.batteryMass'),
    batteryCategory: requiredEnum(v?.batteryCategory, BATTERY_CATEGORIES, 'data.generalInformation.batteryCategory'),
    batteryStatus: requiredEnum(v?.batteryStatus, BATTERY_STATUSES, 'data.generalInformation.batteryStatus'),
    manufacturingDate: requiredDate(v?.manufacturingDate, 'data.generalInformation.manufacturingDate'),
    manufacturingPlace: requiredString(v?.manufacturingPlace, 'data.generalInformation.manufacturingPlace'),
    warrantyPeriod: requiredString(v?.warrantyPeriod, 'data.generalInformation.warrantyPeriod'),
    manufacturerInformation: validateManufacturerInformation(v?.manufacturerInformation),
  }
}

function validateBatteryModel(value: unknown): BatteryModelInfo {
  const v = value as Record<string, unknown>
  return {
    id: requiredString(v?.id, 'data.generalInformation.batteryModel.id'),
    modelName: requiredString(v?.modelName, 'data.generalInformation.batteryModel.modelName'),
  }
}

function validateManufacturerInformation(value: unknown): ManufacturerInformation {
  const v = value as Record<string, unknown>
  return {
    manufacturerName: requiredString(
      v?.manufacturerName,
      'data.generalInformation.manufacturerInformation.manufacturerName'
    ),
    manufacturerIdentifier: requiredString(
      v?.manufacturerIdentifier,
      'data.generalInformation.manufacturerInformation.manufacturerIdentifier'
    ),
  }
}

function validateMaterialComposition(value: unknown): MaterialComposition {
  const v = value as Record<string, unknown>
  return {
    batteryChemistry: requiredString(v?.batteryChemistry, 'data.materialComposition.batteryChemistry'),
    criticalRawMaterials: validateStringArray(
      v?.criticalRawMaterials,
      'data.materialComposition.criticalRawMaterials'
    ),
    hazardousSubstances: validateHazardousSubstances(v?.hazardousSubstances),
  }
}

function validateHazardousSubstances(value: unknown): HazardousSubstance[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'data.materialComposition.hazardousSubstances must be an array')
  }
  return value.map((item: Record<string, unknown>, index) => ({
    substanceName: requiredString(
      item?.substanceName,
      `data.materialComposition.hazardousSubstances[${index}].substanceName`
    ),
    chemicalFormula: requiredString(
      item?.chemicalFormula,
      `data.materialComposition.hazardousSubstances[${index}].chemicalFormula`
    ),
    casNumber: requiredString(item?.casNumber, `data.materialComposition.hazardousSubstances[${index}].casNumber`),
  }))
}

function validateCarbonFootprint(value: unknown): CarbonFootprint {
  const v = value as Record<string, unknown>
  return {
    totalCarbonFootprint: requiredNumber(v?.totalCarbonFootprint, 'data.carbonFootprint.totalCarbonFootprint'),
    measurementUnit: requiredString(v?.measurementUnit, 'data.carbonFootprint.measurementUnit'),
    methodology: requiredString(v?.methodology, 'data.carbonFootprint.methodology'),
  }
}

function validateStringArray(value: unknown, field: string): string[] {
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
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new ApiError(400, `${field} is required`)
  }
  const date = new Date(value)
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
