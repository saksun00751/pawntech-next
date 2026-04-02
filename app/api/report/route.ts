import { requireSession, ok } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: Request) {
  const { error } = await requireSession()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') || '6')

  // Build monthly buckets
  const now = new Date()
  const monthBuckets = Array.from({ length: months }, (_, i) => {
    const d = subMonths(now, months - 1 - i)
    return { label: format(d, 'MMM yy'), start: startOfMonth(d), end: endOfMonth(d) }
  })

  // Monthly redeem income
  const monthly = await Promise.all(
    monthBuckets.map(async ({ label, start, end }) => {
      const agg = await prisma.redeem_history.aggregate({
        where: { redeemed_at: { gte: start, lte: end } },
        _sum: { interest: true },
        _count: { id: true },
      })
      return { month: label, income: Number(agg._sum.interest ?? 0), count: agg._count.id }
    })
  )

  // OS Breakdown (active devices)
  const [iosCount, androidCount, iosAmt, androidAmt] = await Promise.all([
    prisma.devices.count({ where: { status: 'active', os: 'iOS' } }),
    prisma.devices.count({ where: { status: 'active', os: 'Android' } }),
    prisma.devices.aggregate({ where: { status: 'active', os: 'iOS' }, _sum: { amount: true } }),
    prisma.devices.aggregate({ where: { status: 'active', os: 'Android' }, _sum: { amount: true } }),
  ])

  const osBreakdown = [
    { name: 'iOS / iPhone', value: iosCount,    amount: Number(iosAmt._sum.amount ?? 0) },
    { name: 'Android',      value: androidCount, amount: Number(androidAmt._sum.amount ?? 0) },
  ]

  // Recent redeems
  const redeems = await prisma.redeem_history.findMany({
    orderBy: { redeemed_at: 'desc' },
    take: 100,
    include: { users: { select: { name: true } } },
  })

  const recentRedeems = redeems.map(r => ({
    id:         r.device_id,
    owner:      r.owner,
    model:      r.model,
    amount:     Number(r.amount ?? 0),
    interest:   Number(r.interest ?? 0),
    total:      Number(r.total ?? 0),
    redeemedAt: r.redeemed_at?.toISOString(),
    staffName:  r.users?.name ?? '-',
  }))

  // Summary
  const totalAgg = await prisma.redeem_history.aggregate({
    _sum:   { interest: true, total: true },
    _count: { id: true },
  })

  // Top model
  const topModelRaw = await prisma.redeem_history.groupBy({
    by: ['model'],
    _count: { model: true },
    orderBy: { _count: { model: 'desc' } },
    take: 1,
  })
  const topModel = topModelRaw[0]?.model ?? '-'

  const totalRedeemed = totalAgg._count.id
  const totalInterest = Number(totalAgg._sum.interest ?? 0)
  const avgInterest   = totalRedeemed > 0 ? Math.round(totalInterest / totalRedeemed) : 0

  return ok({
    monthly,
    osBreakdown,
    recentRedeems,
    summary: { totalRedeemed, totalInterest, avgInterest, topModel, totalValue: Number(totalAgg._sum.total ?? 0) },
  })
}
