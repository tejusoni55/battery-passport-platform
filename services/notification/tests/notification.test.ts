import request from 'supertest'

const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test' })

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: sendMailMock })),
}))

import { app } from '../src/app'
import { handleMessage, processMessage } from '../src/modules/notification/notification.consumer'

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

describe('processMessage', () => {
  it('logs and skips a malformed message without attempting to send an email', async () => {
    await expect(processMessage('{not valid json')).resolves.toBeUndefined()

    expect(sendMailMock).not.toHaveBeenCalled()
  })

  it('propagates a delivery failure so the message can be retried', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('SMTP unavailable'))
    const event = {
      passportId: 'p-999',
      batteryIdentifier: 'BATT-0009',
      eventType: 'created',
      timestamp: '2026-01-18T10:00:00.000Z',
    }

    await expect(processMessage(JSON.stringify(event))).rejects.toThrow('SMTP unavailable')
  })

  it('propagates a SyntaxError raised during delivery instead of treating it as a malformed event', async () => {
    sendMailMock.mockRejectedValueOnce(new SyntaxError('unexpected token in provider response'))
    const event = {
      passportId: 'p-321',
      batteryIdentifier: 'BATT-0005',
      eventType: 'created',
      timestamp: '2026-01-19T10:00:00.000Z',
    }

    await expect(processMessage(JSON.stringify(event))).rejects.toThrow(SyntaxError)
  })

  it('does nothing for an empty message value', async () => {
    await expect(processMessage(undefined)).resolves.toBeUndefined()

    expect(sendMailMock).not.toHaveBeenCalled()
  })
})
