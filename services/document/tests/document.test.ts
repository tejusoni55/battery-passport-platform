import mongoose from 'mongoose'
import nock from 'nock'
import request from 'supertest'

// Mock only the MinIO layer, not the Document service — no real S3 client is
// ever constructed, so tests never touch the network or require a running MinIO.
const putObjectMock = jest.fn().mockResolvedValue(undefined)
const deleteObjectMock = jest.fn().mockResolvedValue(undefined)
const getPresignedDownloadUrlMock = jest
  .fn()
  .mockImplementation((key: string) => Promise.resolve(`https://minio.test/documents-test/${key}`))

jest.mock('../src/config/minio', () => ({
  ensureBucket: jest.fn().mockResolvedValue(undefined),
  putObject: (...args: unknown[]) => putObjectMock(...args),
  deleteObject: (...args: unknown[]) => deleteObjectMock(...args),
  getPresignedDownloadUrl: (...args: unknown[]) => getPresignedDownloadUrlMock(...args),
}))

import { app } from '../src/app'
import { config } from '../src/config'

const USER_TOKEN = 'user-token'

beforeAll(async () => {
  await mongoose.connect(config.mongoUri)

  nock(config.authServiceUrl)
    .persist()
    .get('/api/auth/profile')
    .reply(function () {
      const header = this.req.headers.authorization
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
  await mongoose.connection.close()
})

async function uploadTestFile() {
  return request(app)
    .post('/api/documents/upload')
    .set('Authorization', `Bearer ${USER_TOKEN}`)
    .attach('file', Buffer.from('%PDF-1.4 test content'), {
      filename: 'report.pdf',
      contentType: 'application/pdf',
    })
}

describe('POST /api/documents/upload', () => {
  it('uploads a file and stores its metadata', async () => {
    const res = await uploadTestFile()

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      fileName: 'report.pdf',
      mimeType: 'application/pdf',
      uploadedBy: 'user-id',
    })
    expect(res.body.s3Key).toBeDefined()
    expect(res.body.fileSize).toBeGreaterThan(0)
  })
})

describe('GET /api/documents', () => {
  it('lists uploaded document metadata', async () => {
    await uploadTestFile()

    const res = await request(app).get('/api/documents').set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].fileName).toBe('report.pdf')
  })
})

describe('GET /api/documents/:docId', () => {
  it('returns a presigned download URL for the uploaded object', async () => {
    const uploaded = await uploadTestFile()

    const res = await request(app)
      .get(`/api/documents/${uploaded.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(typeof res.body.url).toBe('string')
    expect(getPresignedDownloadUrlMock).toHaveBeenCalledWith(uploaded.body.s3Key)
  })
})

describe('PUT /api/documents/:docId', () => {
  it('updates the file name', async () => {
    const uploaded = await uploadTestFile()

    const res = await request(app)
      .put(`/api/documents/${uploaded.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ fileName: 'renamed-report.pdf' })

    expect(res.status).toBe(200)
    expect(res.body.fileName).toBe('renamed-report.pdf')
  })

  it('rejects a missing fileName with 400', async () => {
    const uploaded = await uploadTestFile()

    const res = await request(app)
      .put(`/api/documents/${uploaded.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({})

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/documents/:docId', () => {
  it('deletes the object and its metadata', async () => {
    const uploaded = await uploadTestFile()

    const deleteRes = await request(app)
      .delete(`/api/documents/${uploaded.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(deleteRes.status).toBe(204)

    const downloadRes = await request(app)
      .get(`/api/documents/${uploaded.body.id}`)
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(downloadRes.status).toBe(404)
  })
})

describe('unauthorized requests', () => {
  it('rejects a request with no Bearer token', async () => {
    const res = await request(app).get('/api/documents')
    expect(res.status).toBe(401)
  })
})
