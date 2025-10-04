import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}
const db = new Pool({ connectionString })

async function main() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const file = process.argv[2] || path.join(__dirname, '..', 'data', 'asian-hornet-waarneming-nl-2025.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const json = JSON.parse(raw)
  const obs = Array.isArray(json?.observations) ? json.observations : []

  let inserted = 0
  for (const o of obs) {
    const lat = Number(o.lat)
    const lon = Number(o.lon)
    if (!lat || !lon) continue
    const found_at = o.dateTime ? new Date(String(o.dateTime).replace(' ', 'T')) : (o.date ? new Date(o.date) : new Date())
    const species = 'Vespa velutina'
    const notes = `${o.locationDisplay || o.locality || ''} | source: waarneming.nl`
    const external_id = String(o.id)
    const source = 'waarneming.nl'
    try {
      await db.query(
        `INSERT INTO public.nests (species, found_at, notes, geom, source, external_id)
         VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4,$5),4326), $6, $7)
         ON CONFLICT (external_id) DO NOTHING`,
        [species, found_at, notes, lon, lat, source, external_id]
      )
      inserted++
    } catch (e) {
      console.warn('Skip import for', external_id, e?.message || e)
    }
  }
  console.log(`Imported ${inserted} records to nests`)
  await db.end()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
