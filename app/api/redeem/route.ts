import { requireSession, ok, err } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { calcInterest } from '@/lib/utils'

export async function POST(req: Request) {
  const { error, session } = await requireSession()
  if (error || !session) return error!

  const { id } = await req.json()
  if (!id) return err('Missing id')

  const device = await prisma.devices.findUnique({ where: { id, status: 'active' } })
  if (!device) return err('Device not found', 404)

  const amount   = Number(device.amount)
  const rate     = Number(device.rate ?? 3)
  const interest = calcInterest(amount, rate, device.date_in)
  const total    = amount + interest
  const uid      = parseInt((session.user as any).id)

  await prisma.$transaction([
    prisma.redeem_history.create({
      data: {
        device_id: id,
        owner: device.owner,
        model: device.model,
        amount,
        interest,
        total,
        redeemed_by: isNaN(uid) ? undefined : uid,
      },
    }),
    prisma.devices.update({
      where: { id },
      data: { status: 'redeemed', locked: false },
    }),
    prisma.audit_log.create({
      data: { user_id: uid, action: 'redeem', detail: `ไถ่ถอน ${device.model} (${id}) รวม ${total.toFixed(0)} บาท` }
    }),
  ])

  return ok({ success: true, interest, total })
}
