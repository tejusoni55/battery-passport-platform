import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../src/app'
import { config } from '../src/config'

beforeAll(async () => {
  await mongoose.connect(config.mongoUri)
})

beforeEach(async () => {
  await mongoose.connection.db?.dropDatabase()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('malformed request body', () => {
  it('rejects a malformed JSON body with 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken",}')

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ message: 'Malformed JSON body' })
  })
})

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@example.com', password: 'password123', role: 'user' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ email: 'alice@example.com', role: 'user' })
    expect(res.body.id).toBeDefined()
    expect(res.body.password).toBeUndefined()
  })

  it('rejects a duplicate email with 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'password123', role: 'user' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'anotherpassword', role: 'user' })

    expect(res.status).toBe(409)
  })

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short', role: 'user' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  const credentials = { email: 'carol@example.com', password: 'password123' }

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, role: 'user' })
  })

  it('logs in with valid credentials and returns a JWT', async () => {
    const res = await request(app).post('/api/auth/login').send(credentials)

    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.length).toBeGreaterThan(0)
  })

  it('rejects the wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/profile', () => {
  const credentials = { email: 'dave@example.com', password: 'password123' }

  async function registerAndLogin(): Promise<string> {
    await request(app)
      .post('/api/auth/register')
      .send({ ...credentials, role: 'user' })

    const loginRes = await request(app).post('/api/auth/login').send(credentials)
    return loginRes.body.token
  }

  it('returns the profile for a valid JWT', async () => {
    const token = await registerAndLogin()

    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.email).toBe(credentials.email)
  })

  it('rejects a request with no JWT with 401', async () => {
    const res = await request(app).get('/api/auth/profile')

    expect(res.status).toBe(401)
  })

  it('rejects a request with an invalid JWT with 401', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer not-a-real-token')

    expect(res.status).toBe(401)
  })
})
