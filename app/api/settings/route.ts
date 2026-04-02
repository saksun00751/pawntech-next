import { requireAdmin, requireSession, ok, err } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const rows = await prisma.settings.findMany()
  const out: Record<string, string> = {}
  for (const r of rows) out[r.k] = r.v ?? ''
  return ok(out)
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json()
  const allowed = ['shop_name', 'interest_rate', 'max_months', 'mdm_server']

  for (const key of allowed) {
    if (key in body) {
      await prisma.settings.upsert({
        where: { k: key },
        update: { v: String(body[key]) },
        create: { k: key, v: String(body[key]) },
      })
    }
  }

  return ok({ success: true })
}
