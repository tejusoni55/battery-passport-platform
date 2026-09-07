# Battery Passport Platform

A small backend platform for tracking EV battery passports end to end: auth, passport records, file storage, and event-driven notifications, split into four independent services.

## Services

- **auth** (port 3001) :- registration, login, and JWT issuance; every other service checks tokens against it.
- **passport** (port 3002) :- CRUD for battery passport records, admin-gated writes, publishes Kafka events on create/delete.
- **document** (port 3003) :- uploads files to MinIO and hands back presigned download links.
- **notification** (port 3004) :- consumes passport events from Kafka and emails a summary via SMTP.

## Setup

```bash
cp .env.example .env
docker compose up --build
```

This brings up all four services plus MongoDB, Kafka, MinIO, and Mailpit (catches outgoing emails locally at http://localhost:8025).

## API usage

Auth, Passport, and Document each expose Swagger UI with the full request/response shapes:

- http://localhost:3001/docs (auth)
- http://localhost:3002/docs (passport)
- http://localhost:3003/docs (document)

Typical flow:

1. `POST /api/auth/register` :- create a user
2. `POST /api/auth/login` :- returns `{ "token": "..." }`
3. Send that token as `Authorization: Bearer <token>` on every passport/document request

## Kafka topics

Passport publishes an event whenever a passport is created or deleted:

- `passport.created`
- `passport.deleted`

Both use the same payload shape, `eventType` tells them apart:

```json
{
  "passportId": "66f1e2a1c2a4b7e1f0a12345",
  "batteryIdentifier": "BP-2024-011",
  "eventType": "created",
  "timestamp": "2026-01-15T10:00:00.000Z"
}
```

Notification consumes both topics and sends one email per event, check Mailpit at http://localhost:8025 to see them land.

## Testing

From the repo root:

```bash
npm run lint
npm run build
npm run test
```

`test` needs MongoDB running (already up if you did `docker compose up`), since the suites hit a real database rather than mocking it.
