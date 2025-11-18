import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function GET() {
  const db = await readDb()
  const user = db.users[0]
  return NextResponse.json({ profile: user.profile })
}

export async function POST(req: Request) {
  const payload = await req.json()
  const db = await readDb()
  if (!db.users || db.users.length === 0) return NextResponse.json({ error: 'no user' }, { status: 404 })
  db.users[0].profile = { ...db.users[0].profile, ...payload }
  await writeDb(db)
  return NextResponse.json({ profile: db.users[0].profile })
}
