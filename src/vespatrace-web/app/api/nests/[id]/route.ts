import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const db = new Pool({ connectionString })
async function query(text: string, params?: Array<string | number | Date>) {
  const client = await db.connect()
  try {
    const res = await client.query(text, params)
    return { rows: res.rows }
  } finally {
    client.release()
  }
}

// PATCH /api/nests/:id { removed_at }
export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await _req.json().catch(() => ({}))
  const removed_at = body?.removed_at ? new Date(body.removed_at) : new Date()
  await query(`UPDATE public.nests SET removed_at = $1 WHERE id = $2`, [removed_at, id])
  return NextResponse.json({ ok: true })
}
