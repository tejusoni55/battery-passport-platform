import request from 'supertest'

const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test' })

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
}))

import { app } from '../src/app'
import { handleMessage } from '../src/modules/notification/notification.consumer'

beforeEach(() => {
  sendMailMock.mockClear()
})

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })
})

describe('unmatched routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/not-a-real-route')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Not found' })
  })
})

describe('passport.created event', () => {
  it('sends an email with the created subject and event details', async () => {
    const event = {
      passportId: 'p-123',
      batteryIdentifier: 'BATT-0001',
      eventType: 'created',
      timestamp: '2026-01-15T10:00:00.000Z',
    }

    await handleMessage(JSON.stringify(event))

    expect(sendMailMock).toHaveBeenCalledTimes(1)
    const sentMail = sendMailMock.mock.calls[0][0]
    expect(sentMail.subject).toBe('Passport Created')
    expect(sentMail.text).toContain('p-123')
    expect(sentMail.text).toContain('BATT-0001')
    expect(sentMail.text).toContain('created')
    expect(sentMail.text).toContain('2026-01-15T10:00:00.000Z')
  })
})

describe('passport.updated event', () => {
  it('does not send an email', async () => {
    const event = {
      passportId: 'p-789',
      batteryIdentifier: 'BATT-0003',
      eventType: 'updated',
      timestamp: '2026-01-17T10:00:00.000Z',
    }

    await handleMessage(JSON.stringify(event))

    expect(sendMailMock).not.toHaveBeenCalled()
  })
})

describe('passport.deleted event', () => {
  it('sends an email with the deleted subject and event details', async () => {
    const event = {
      passportId: 'p-456',
      batteryIdentifier: 'BATT-0002',
      eventType: 'deleted',
      timestamp: '2026-01-16T10:00:00.000Z',
    }

    await handleMessage(JSON.stringify(event))

    expect(sendMailMock).toHaveBeenCalledTimes(1)
    const sentMail = sendMailMock.mock.calls[0][0]
    expect(sentMail.subject).toBe('Passport Deleted')
    expect(sentMail.text).toContain('p-456')
    expect(sentMail.text).toContain('BATT-0002')
  })
})
