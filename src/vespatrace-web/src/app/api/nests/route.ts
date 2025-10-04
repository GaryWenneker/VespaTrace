import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const db = new Pool({ connectionString })
async function query<T = unknown>(text: string, params?: Array<string | number | Date>) {
	const client = await db.connect()
	try {
		const res = await client.query(text, params)
		return { rows: res.rows as T[] }
	} finally {
		client.release()
	}
}

// GET /api/nests?bbox=minLon,minLat,maxLon,maxLat
type DBNestRow = {
	id: string
	species: string | null
	found_at: string
	removed_at: string | null
	notes: string | null
	source: string | null
	external_id: string | null
	geometry: { type: 'Point'; coordinates: [number, number] }
}

export async function GET(req: NextRequest) {
	const bbox = req.nextUrl.searchParams.get('bbox')
	let where = 'TRUE'
	const params: (string | number)[] = []
	if (bbox) {
		const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number)
		if ([minLon, minLat, maxLon, maxLat].some(n => Number.isNaN(n))) {
			return NextResponse.json({ error: 'Invalid bbox' }, { status: 400 })
		}
		params.push(minLon, minLat, maxLon, maxLat)
		where = 'geom && ST_MakeEnvelope($1,$2,$3,$4,4326)'
	}
	const { rows } = await query<DBNestRow>(
		`SELECT id, species, found_at, removed_at, notes, source, external_id,
						ST_AsGeoJSON(geom)::json AS geometry
			 FROM public.nests
			WHERE ${where}`,
		params
	)
	const features = rows.map((r) => ({
		type: 'Feature',
		id: r.id,
		geometry: r.geometry,
		properties: {
			species: r.species,
			found_at: r.found_at,
			removed_at: r.removed_at,
			notes: r.notes,
			source: r.source,
			external_id: r.external_id,
			active: !r.removed_at
		}
	}))
	return NextResponse.json({ type: 'FeatureCollection', features })
}

// POST /api/nests
// body: { lat, lon, found_at, species?, notes?, source?, external_id? }
export async function POST(req: NextRequest) {
	const body = await req.json()
	const { lat, lon, found_at, species, notes, source, external_id } = body || {}
	if (
		typeof lat !== 'number' || typeof lon !== 'number' ||
		!found_at
	) {
		return NextResponse.json({ error: 'lat, lon, found_at required' }, { status: 400 })
	}
	const { rows } = await query<{ id: string }>(
		`INSERT INTO public.nests (species, found_at, notes, geom, source, external_id)
		 VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4,$5),4326), $6, $7)
		 RETURNING id`,
		[species || null, new Date(found_at), notes || null, lon, lat, source || null, external_id || null]
	)
	return NextResponse.json({ id: rows[0].id }, { status: 201 })
}

