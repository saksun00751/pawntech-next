import { requireSession, ok, err } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { error, session } = await requireSession()
  if (error || !session) return error!

  const body = await req.json()
  const uid  = parseInt((session.user as any).id)

  if (body.all) {
    await prisma.devices.updateMany({
      where: { status: 'active' },
      data: { locked: body.locked, locked_by: isNaN(uid) ? undefined : uid, locked_at: new Date() },
    })
    await prisma.audit_log.create({ data: { user_id: uid, action: 'lock_all', detail: body.locked ? 'ล็อกทุกเครื่อง' : 'ปลดล็อกทุกเครื่อง' } })
    return ok({ success: true })
  }

  if (!body.id) return err('Missing id')

  await prisma.devices.update({
    where: { id: body.id },
    data: { locked: body.locked, locked_by: isNaN(uid) ? undefined : uid, locked_at: new Date() },
  })
  await prisma.audit_log.create({ data: { user_id: uid, action: 'lock_device', detail: `${body.locked ? 'ล็อก' : 'ปลดล็อก'} ${body.id}` } })

  return ok({ success: true, locked: body.locked })
}
