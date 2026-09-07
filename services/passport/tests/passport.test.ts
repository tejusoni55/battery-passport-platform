import mongoose from 'mongoose'
import nock from 'nock'
import request from 'supertest'

// Mock only the Kafka publish layer, not the Passport service — no real
// kafkajs client is ever constructed, so tests never touch the network.
jest.mock('../src/config/kafka', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
  disconnectProducer: jest.fn().mockResolvedValue(undefined),
}))

import { app } from '../src/app'
import { config } from '../src/config'
import { disconnectProducer } from '../src/config/kafka'

const ADMIN_TOKEN = 'admin-token'
const USER_TOKEN = 'user-token'

beforeAll(async () => {
  await mongoose.connect(config.mongoUri)

  nock(config.authServiceUrl)
    .persist()
    .get('/api/auth/profile')
    .reply(function () {
      const header = this.req.headers.authorization
      if (header === `Bearer ${ADMIN_TOKEN}`) {
        return [200, { id: 'admin-id', email: 'admin@example.com', role: 'admin' }]
      }
      if (header === `Bearer ${USER_TOKEN}`) {
        return [200, { id: 'user-id', email: 'user@example.com', role: 'user' }]
      }
      return [401, { message: 'Invalid or expired token' }]
    })
})

beforeEach(async () => {
  await mongoose.connection.db?.dropDatabase()
})

afterAll(async () => {
  nock.cleanAll()
  await disconnectProducer()
  await mongoose.connection.close()
})

function buildPassportPayload(overrides: { batteryIdentifier?: string; batteryStatus?: string } = {}) {
  return {
    data: {
      generalInformation: {
        batteryIdentifier: overrides.batteryIdentifier ?? 'BP-2024-011',
        batteryModel: { id: 'LM3-BAT-2024', modelName: 'GMC WZX1' },
        batteryMass: 450,
        batteryCategory: 'EV',
        batteryStatus: overrides.batteryStatus ?? 'Original',
        manufacturingDate: '2024-01-15',
        manufacturingPlace: 'Gigafactory Nevada',
        warrantyPeriod: '8',
        manufacturerInformation: {
          manufacturerName: 'Tesla Inc',
          manufacturerIdentifier: 'TESLA-001',
        },
      },
      materialComposition: {
        batteryChemistry: 'LiFePO4',
        criticalRawMaterials: ['Lithium', 'Iron'],
        hazardousSubstances: [
          {
            substanceName: 'Lithium Hexafluorophosphate',
            chemicalFormula: 'LiPF6',
            casNumber: '21324-40-3',
          },
        ],
      },
      carbonFootprint: {
        totalCarbonFootprint: 850,
        measurementUnit: 'kg CO2e',
        methodology: 'Life Cycle Assessment (LCA)',
      },
    },
  }
}

describe('POST /api/passports', () => {
  it('creates a passport and returns 201', async () => {
    const res = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    expect(res.status).toBe(201)
    expect(res.body.generalInformation).toMatchObject({
      batteryIdentifier: 'BP-2024-011',
      batteryCategory: 'EV',
      batteryStatus: 'Original',
    })
    expect(res.body.materialComposition.batteryChemistry).toBe('LiFePO4')
    expect(res.body.carbonFootprint.totalCarbonFootprint).toBe(850)
    expect(res.body.id).toBeDefined()
  })

  it('rejects a duplicate batteryIdentifier with 409', async () => {
    await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    const res = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    expect(res.status).toBe(409)
  })

  it('rejects a non-admin user with 403', async () => {
    const res = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send(buildPassportPayload())

    expect(res.status).toBe(403)
  })

  it('rejects an invalid payload with 400, not 500', async () => {
    const res = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ data: {} })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/passports', () => {
  it('lists all passports', async () => {
    await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryIdentifier: 'BP-2024-011' }))

    await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryIdentifier: 'BP-2024-012' }))

    const res = await request(app).get('/api/passports').set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
  })
})

describe('GET /api/passports/:id', () => {
  it('returns a passport by id', async () => {
    const created = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    const res = await request(app)
      .get(`/api/passports/${created.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.generalInformation.batteryIdentifier).toBe('BP-2024-011')
  })

  it('returns 404 for a missing passport', async () => {
    const missingId = new mongoose.Types.ObjectId().toString()

    const res = await request(app)
      .get(`/api/passports/${missingId}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(404)
  })
})

describe('PUT /api/passports/:id', () => {
  it('updates a passport', async () => {
    const created = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    const res = await request(app)
      .put(`/api/passports/${created.body.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryStatus: 'second_life' }))

    expect(res.status).toBe(200)
    expect(res.body.generalInformation.batteryStatus).toBe('second_life')
  })
})

describe('DELETE /api/passports/:id', () => {
  it('deletes a passport', async () => {
    const created = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    const deleteRes = await request(app)
      .delete(`/api/passports/${created.body.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)

    expect(deleteRes.status).toBe(204)

    const getRes = await request(app)
      .get(`/api/passports/${created.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(getRes.status).toBe(404)
  })
})
