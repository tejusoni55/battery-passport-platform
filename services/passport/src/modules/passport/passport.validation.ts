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

const MAX_LIMIT = 100

export function validatePaginationQuery(query: any): PaginationQuery {
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

export function validatePassportInput(data: any): PassportInput {
  if (typeof data !== 'object' || data === null) {
    throw new ApiError(400, 'data is required')
  }

  return {
    generalInformation: validateGeneralInformation(data.generalInformation),
    materialComposition: validateMaterialComposition(data.materialComposition),
    carbonFootprint: validateCarbonFootprint(data.carbonFootprint),
  }
}

function validateGeneralInformation(value: any): GeneralInformation {
  return {
    batteryIdentifier: requiredString(value?.batteryIdentifier, 'data.generalInformation.batteryIdentifier'),
    batteryModel: validateBatteryModel(value?.batteryModel),
    batteryMass: requiredNumber(value?.batteryMass, 'data.generalInformation.batteryMass'),
    batteryCategory: requiredEnum(
      value?.batteryCategory,
      BATTERY_CATEGORIES,
      'data.generalInformation.batteryCategory'
    ),
    batteryStatus: requiredEnum(value?.batteryStatus, BATTERY_STATUSES, 'data.generalInformation.batteryStatus'),
    manufacturingDate: requiredDate(value?.manufacturingDate, 'data.generalInformation.manufacturingDate'),
    manufacturingPlace: requiredString(value?.manufacturingPlace, 'data.generalInformation.manufacturingPlace'),
    warrantyPeriod: requiredString(value?.warrantyPeriod, 'data.generalInformation.warrantyPeriod'),
    manufacturerInformation: validateManufacturerInformation(value?.manufacturerInformation),
  }
}

function validateBatteryModel(value: any): BatteryModelInfo {
  return {
    id: requiredString(value?.id, 'data.generalInformation.batteryModel.id'),
    modelName: requiredString(value?.modelName, 'data.generalInformation.batteryModel.modelName'),
  }
}

function validateManufacturerInformation(value: any): ManufacturerInformation {
  return {
    manufacturerName: requiredString(
      value?.manufacturerName,
      'data.generalInformation.manufacturerInformation.manufacturerName'
    ),
    manufacturerIdentifier: requiredString(
      value?.manufacturerIdentifier,
      'data.generalInformation.manufacturerInformation.manufacturerIdentifier'
    ),
  }
}

function validateMaterialComposition(value: any): MaterialComposition {
  return {
    batteryChemistry: requiredString(value?.batteryChemistry, 'data.materialComposition.batteryChemistry'),
    criticalRawMaterials: validateStringArray(
      value?.criticalRawMaterials,
      'data.materialComposition.criticalRawMaterials'
    ),
    hazardousSubstances: validateHazardousSubstances(value?.hazardousSubstances),
  }
}

function validateHazardousSubstances(value: any): HazardousSubstance[] {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value)) {
    throw new ApiError(400, 'data.materialComposition.hazardousSubstances must be an array')
  }
  return value.map((item, index) => ({
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

function validateCarbonFootprint(value: any): CarbonFootprint {
  return {
    totalCarbonFootprint: requiredNumber(value?.totalCarbonFootprint, 'data.carbonFootprint.totalCarbonFootprint'),
    measurementUnit: requiredString(value?.measurementUnit, 'data.carbonFootprint.measurementUnit'),
    methodology: requiredString(value?.methodology, 'data.carbonFootprint.methodology'),
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
