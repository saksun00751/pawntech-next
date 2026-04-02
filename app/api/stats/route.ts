import { requireSession, ok } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const [active, locked, ios, android, overdue, valueAgg] = await Promise.all([
    prisma.devices.count({ where: { status: 'active' } }),
    prisma.devices.count({ where: { status: 'active', locked: true } }),
    prisma.devices.count({ where: { status: 'active', os: 'iOS' } }),
    prisma.devices.count({ where: { status: 'active', os: 'Android' } }),
    prisma.devices.count({ where: { status: 'active', due_date: { lt: new Date() } } }),
    prisma.devices.aggregate({ where: { status: 'active' }, _sum: { amount: true } }),
  ])

  return ok({ active, locked, ios, android, overdue, totalValue: Number(valueAgg._sum.amount ?? 0) })
}
