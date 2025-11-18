import { NextResponse } from 'next/server'
import { readDb, writeDb } from '@/lib/db'

export async function POST(req: Request) {
  const { userId, courseCode } = await req.json()
  const db = await readDb()
  db.enrollments = (db.enrollments || []).filter((e: any) => !(e.userId === userId && e.courseCode === courseCode))
  await writeDb(db)
  return NextResponse.json({ enrollments: db.enrollments })
}
