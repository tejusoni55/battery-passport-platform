import { Schema, model } from 'mongoose'

export const BATTERY_CATEGORIES = ['LMT', 'EV', 'industrial', 'automotive', 'stationary_storage'] as const
export type BatteryCategory = (typeof BATTERY_CATEGORIES)[number]

export const BATTERY_STATUSES = ['Original', 'active', 'second_life', 'recycled', 'disposed'] as const
export type BatteryStatus = (typeof BATTERY_STATUSES)[number]

export interface BatteryModelInfo {
  id: string
  modelName: string
}

export interface ManufacturerInformation {
  manufacturerName: string
  manufacturerIdentifier: string
}

export interface GeneralInformation {
  batteryIdentifier: string
  batteryModel: BatteryModelInfo
  batteryMass: number
  batteryCategory: BatteryCategory
  batteryStatus: BatteryStatus
  manufacturingDate: Date
  manufacturingPlace: string
  warrantyPeriod: string
  manufacturerInformation: ManufacturerInformation
}

export interface HazardousSubstance {
  substanceName: string
  chemicalFormula: string
  casNumber: string
}

export interface MaterialComposition {
  batteryChemistry: string
  criticalRawMaterials: string[]
  hazardousSubstances: HazardousSubstance[]
}

export interface CarbonFootprint {
  totalCarbonFootprint: number
  measurementUnit: string
  methodology: string
}

export interface PassportDocument {
  generalInformation: GeneralInformation
  materialComposition: MaterialComposition
  carbonFootprint: CarbonFootprint
  createdAt: Date
  updatedAt: Date
}

const batteryModelSchema = new Schema<BatteryModelInfo>(
  {
    id: { type: String, required: true, trim: true },
    modelName: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const manufacturerInformationSchema = new Schema<ManufacturerInformation>(
  {
    manufacturerName: { type: String, required: true, trim: true },
    manufacturerIdentifier: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const generalInformationSchema = new Schema<GeneralInformation>(
  {
    batteryIdentifier: { type: String, required: true, trim: true },
    batteryModel: { type: batteryModelSchema, required: true },
    batteryMass: { type: Number, required: true, min: 0 },
    batteryCategory: { type: String, enum: BATTERY_CATEGORIES, required: true },
    batteryStatus: { type: String, enum: BATTERY_STATUSES, required: true },
    manufacturingDate: { type: Date, required: true },
    manufacturingPlace: { type: String, required: true, trim: true },
    warrantyPeriod: { type: String, required: true, trim: true },
    manufacturerInformation: { type: manufacturerInformationSchema, required: true },
  },
  { _id: false }
)

const hazardousSubstanceSchema = new Schema<HazardousSubstance>(
  {
    substanceName: { type: String, required: true, trim: true },
    chemicalFormula: { type: String, required: true, trim: true },
    casNumber: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const materialCompositionSchema = new Schema<MaterialComposition>(
  {
    batteryChemistry: { type: String, required: true, trim: true },
    criticalRawMaterials: { type: [String], default: [] },
    hazardousSubstances: { type: [hazardousSubstanceSchema], default: [] },
  },
  { _id: false }
)

const carbonFootprintSchema = new Schema<CarbonFootprint>(
  {
    totalCarbonFootprint: { type: Number, required: true, min: 0 },
    measurementUnit: { type: String, required: true, trim: true },
    methodology: { type: String, required: true, trim: true },
  },
  { _id: false }
)

const passportSchema = new Schema<PassportDocument>(
  {
    generalInformation: { type: generalInformationSchema, required: true },
    materialComposition: { type: materialCompositionSchema, required: true },
    carbonFootprint: { type: carbonFootprintSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
      },
    },
  }
)

passportSchema.index({ 'generalInformation.batteryIdentifier': 1 }, { unique: true })

export const PassportModel = model<PassportDocument>('Passport', passportSchema)
