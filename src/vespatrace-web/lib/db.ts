import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.warn('DATABASE_URL not set; DB features will be disabled until provided')
}

export const db = new Pool({ connectionString })

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await db.connect()
  try {
    const res = await client.query(text, params)
    return { rows: res.rows }
  } finally {
    client.release()
  }
}
