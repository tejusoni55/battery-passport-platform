import path from 'path'
import dotenv from 'dotenv'

// Runs before any test file (and before app.ts/config are imported), so these
// values win over the real .env — dotenv never overwrites vars already set.
dotenv.config({ path: path.resolve(__dirname, '../.env.test') })
