import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const SQL = readFileSync(join(__dirname, 'migration.sql'), 'utf8')

const client = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.pnpmiqbxalmmfravziph',
  password: 'Diegoper2003%',
  ssl: { rejectUnauthorized: false },
})

async function run() {
  console.log('Connecting to Supabase DB...')
  await client.connect()
  console.log('Connected. Running migration...\n')
  try {
    await client.query(SQL)
    console.log('✓ Migration complete!')
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
