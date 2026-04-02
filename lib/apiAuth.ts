import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { NextResponse } from 'next/server'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireSession() {
  const session = await getSession()
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  return { session, error: null }
}

export async function requireAdmin() {
  const { session, error } = await requireSession()
  if (error || !session) return { error: error ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null }
  if ((session.user as any).role !== 'admin')
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session: null }
  return { session, error: null }
}

export function ok(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
