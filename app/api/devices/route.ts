import { requireSession, ok, err } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { generateDeviceId } from '@/lib/utils'
import { addMonths } from 'date-fns'

export async function GET(req: Request) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q       = searchParams.get('q') || ''
  const os      = searchParams.get('os') || ''
  const limit   = parseInt(searchParams.get('limit') || '200')

  const devices = await prisma.devices.findMany({
    where: {
      status: 'active',
      ...(os ? { os: os as any } : {}),
      ...(q ? {
        OR: [
          { owner: { contains: q } },
          { model:  { contains: q } },
          { imei:   { contains: q } },
          { id:     { contains: q } },
        ],
      } : {}),
    },
    include: { users_devices_created_byTousers: { select: { name: true } } },
    orderBy: { created_at: 'desc' },
    take: limit,
  })

  return ok(devices.map((d: typeof devices[number]) => ({ ...d, createdByName: d.users_devices_created_byTousers?.name })))
}

export async function POST(req: Request) {
  const { error, session } = await requireSession()
  if (error || !session) return error!

  const body = await req.json()
  const { owner, model, imei, amount, os, phone, spec, serial, rate, months, dateIn, note, mdmPin } = body

  if (!owner || !model || !imei || !amount || !os)
    return err('Missing required fields', 422)

  const count  = await prisma.devices.count()
  const id     = generateDeviceId(count)
  const inDate = dateIn ? new Date(dateIn) : new Date()
  const due    = addMonths(inDate, months ?? 3)
  const uid    = parseInt((session.user as any).id)

  const device = await prisma.devices.create({
    data: {
      id, owner, model, os,
      phone:   phone  || '',
      spec:    spec   || '',
      imei,    serial: serial || '',
      amount:  parseFloat(amount),
      rate:    parseFloat(rate ?? 3),
      months:  parseInt(months ?? 3),
      date_in: inDate,
      due_date: due,
      note:    note   || '',
      mdm_pin: mdmPin || '',
      created_by: isNaN(uid) ? undefined : uid,
    },
  })

  await prisma.audit_log.create({
    data: { user_id: uid, action: 'add_device', detail: `รับจำนำ ${model} (${id})` }
  })

  return ok({ success: true, id: device.id }, 201)
}
