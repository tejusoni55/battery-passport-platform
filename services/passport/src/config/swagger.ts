import swaggerJsdoc from 'swagger-jsdoc'
import { config } from './index'

const generalInformation = {
  batteryIdentifier: 'BP-2024-011',
  batteryModel: { id: 'LM3-BAT-2024', modelName: 'GMC WZX1' },
  batteryMass: 450,
  batteryCategory: 'EV',
  batteryStatus: 'Original',
  manufacturingDate: '2024-01-15',
  manufacturingPlace: 'Gigafactory Nevada',
  warrantyPeriod: '8',
  manufacturerInformation: { manufacturerName: 'Tesla Inc', manufacturerIdentifier: 'TESLA-001' },
}

const materialComposition = {
  batteryChemistry: 'LiFePO4',
  criticalRawMaterials: ['Lithium', 'Iron'],
  hazardousSubstances: [
    { substanceName: 'Lithium Hexafluorophosphate', chemicalFormula: 'LiPF6', casNumber: '21324-40-3' },
  ],
}

const carbonFootprint = { totalCarbonFootprint: 850, measurementUnit: 'kg CO2e', methodology: 'Life Cycle Assessment (LCA)' }

const passport = {
  id: '66f1e2a1c2a4b7e1f0a12345',
  generalInformation,
  materialComposition,
  carbonFootprint,
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
}

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'Passport Service API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        PassportRequest: {
          type: 'object',
          example: { data: { generalInformation, materialComposition, carbonFootprint } },
        },
        PassportResponse: { type: 'object', example: passport },
        PassportListResponse: {
          type: 'object',
          example: { data: [passport], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/modules/**/*.routes.ts', './dist/app.js', './dist/modules/**/*.routes.js'],
})
