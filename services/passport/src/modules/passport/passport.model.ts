import { Schema, model } from 'mongoose'

export const BATTERY_CATEGORIES = ['LMT', 'EV', 'industrial', 'automotive', 'stationary_storage'] as const
export type BatteryCategory = (typeof BATTERY_CATEGORIES)[number]

export const BATTERY_STATUSES = ['active', 'second_life', 'recycled', 'disposed'] as const
export type BatteryStatus = (typeof BATTERY_STATUSES)[number]

export interface BatteryModelInfo {
  modelName: string
  modelNumber: string
}

export interface Manufacturer {
  name: string
  address: string
  contact: string
}

export interface HazardousSubstance {
  name: string
  casNumber: string
  concentration: number
}

export interface CarbonFootprint {
  totalCo2Kg: number
  methodology: string
  calculatedAt: Date
}

export interface Circularity {
  recycledContentPercentage: number
  recyclabilityPercentage: number
  expectedLifetimeYears: number
}

export interface PassportDocument {
  batteryIdentifier: string
  batteryCategory: BatteryCategory
  batteryStatus: BatteryStatus
  batteryModel: BatteryModelInfo
  manufacturer: Manufacturer
  manufacturingDate: Date
  batteryMass: number
  batteryChemistry: string
  criticalRawMaterials: string[]
  hazardousSubstances: HazardousSubstance[]
  carbonFootprint: CarbonFootprint
  circularity: Circularity
  createdAt: Date
  updatedAt: Date
}

const batteryModelSchema = new Schema<BatteryModelInfo>(
  {
    modelName: { type: String, required: true, trim: true },
    modelNumber: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const manufacturerSchema = new Schema<Manufacturer>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const hazardousSubstanceSchema = new Schema<HazardousSubstance>(
  {
    name: { type: String, required: true, trim: true },
    casNumber: { type: String, required: true, trim: true },
    concentration: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const carbonFootprintSchema = new Schema<CarbonFootprint>(
  {
    totalCo2Kg: { type: Number, required: true, min: 0 },
    methodology: { type: String, required: true, trim: true },
    calculatedAt: { type: Date, required: true },
  },
  { _id: false }
)

const circularitySchema = new Schema<Circularity>(
  {
    recycledContentPercentage: { type: Number, required: true, min: 0, max: 100 },
    recyclabilityPercentage: { type: Number, required: true, min: 0, max: 100 },
    expectedLifetimeYears: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const passportSchema = new Schema<PassportDocument>(
  {
    batteryIdentifier: { type: String, required: true, unique: true, trim: true },
    batteryCategory: { type: String, enum: BATTERY_CATEGORIES, required: true },
    batteryStatus: { type: String, enum: BATTERY_STATUSES, required: true },
    batteryModel: { type: batteryModelSchema, required: true },
    manufacturer: { type: manufacturerSchema, required: true },
    manufacturingDate: { type: Date, required: true },
    batteryMass: { type: Number, required: true, min: 0 },
    batteryChemistry: { type: String, required: true, trim: true },
    criticalRawMaterials: { type: [String], default: [] },
    hazardousSubstances: { type: [hazardousSubstanceSchema], default: [] },
    carbonFootprint: { type: carbonFootprintSchema, required: true },
    circularity: { type: circularitySchema, required: true },
  },
  { timestamps: true }
)

export const PassportModel = model<PassportDocument>('Passport', passportSchema)
