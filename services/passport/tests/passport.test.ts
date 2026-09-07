import mongoose from 'mongoose'
import nock from 'nock'
import request from 'supertest'
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

function buildPassportPayload(overrides: Record<string, unknown> = {}) {
  return {
    batteryIdentifier: 'BATT-0001',
    batteryCategory: 'EV',
    batteryStatus: 'active',
    batteryModel: { modelName: 'PowerCell X1', modelNumber: 'PCX1-100' },
    manufacturer: { name: 'Acme Batteries', address: '1 Industrial Way', contact: 'ops@acme.example' },
    manufacturingDate: '2026-01-15',
    batteryMass: 42.5,
    batteryChemistry: 'NMC',
    criticalRawMaterials: ['cobalt', 'lithium'],
    hazardousSubstances: [{ name: 'Lead', casNumber: '7439-92-1', concentration: 0.01 }],
    carbonFootprint: { totalCo2Kg: 120.5, methodology: 'PEFCR', calculatedAt: '2026-01-10' },
    circularity: { recycledContentPercentage: 15, recyclabilityPercentage: 80, expectedLifetimeYears: 10 },
    ...overrides,
  }
}

describe('POST /api/passports', () => {
  it('creates a passport and returns 201', async () => {
    const res = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ batteryIdentifier: 'BATT-0001', batteryCategory: 'EV' })
    expect(res.body._id).toBeDefined()
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
})

describe('GET /api/passports', () => {
  it('lists all passports', async () => {
    await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryIdentifier: 'BATT-0001' }))

    await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryIdentifier: 'BATT-0002' }))

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
      .get(`/api/passports/${created.body._id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.batteryIdentifier).toBe('BATT-0001')
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
      .put(`/api/passports/${created.body._id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload({ batteryStatus: 'second_life' }))

    expect(res.status).toBe(200)
    expect(res.body.batteryStatus).toBe('second_life')
  })
})

describe('DELETE /api/passports/:id', () => {
  it('deletes a passport', async () => {
    const created = await request(app)
      .post('/api/passports')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(buildPassportPayload())

    const deleteRes = await request(app)
      .delete(`/api/passports/${created.body._id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)

    expect(deleteRes.status).toBe(204)

    const getRes = await request(app)
      .get(`/api/passports/${created.body._id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(getRes.status).toBe(404)
  })
})
