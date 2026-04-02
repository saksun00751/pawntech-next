'use client'
import { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatTHB, formatDate, isOverdue, getDaysLeft } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Stats { active: number; locked: number; ios: number; android: number; overdue: number; totalValue: number }
interface Device { id: string; owner: string; model: string; os: string; amount: number; locked: boolean; dueDate: string; rate: number; dateIn: string }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const router = useRouter()

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/devices?limit=8').then(r => r.json()).then(setDevices)
  }, [])

  async function handleLock(id: string, lock: boolean) {
    await fetch('/api/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, locked: lock }) })
    setDevices(p => p.map(d => d.id === id ? { ...d, locked: lock } : d))
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between page-enter">
        <div>
          <h2 className="text-display text-3xl font-bold text-amber-100">ภาพรวมระบบ</h2>
          <p className="text-ink-500 text-sm mt-1">สรุปรายการจำนำและสถานะเครื่องทั้งหมด</p>
        </div>
        <Button variant="gold" onClick={() => router.push('/devices')}>
          + รับจำนำใหม่
        </Button>
      </div>

      {/* Stats */}
      {!stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="เครื่องในมือ"  value={stats.active}     sub="รายการจำนำที่ยังค้างอยู่" icon="▣" color="gold"     delay={0} />
          <StatCard label="เครื่องล็อกแล้ว" value={stats.locked}  sub="กำลังล็อกอยู่"             icon="◉" color="ember"    delay={60} />
          <StatCard label="iOS / iPhone"  value={stats.ios}        sub="เครื่อง Apple"             icon="🍎" color="sapphire" delay={120} />
          <StatCard label="Android"       value={stats.android}    sub="เครื่อง Android"           icon="🤖" color="jade"     delay={180} />
        </div>
      )}

      {/* Overdue & Value row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 page-enter stagger-2">
          <div className="glass-card p-5 flex items-center gap-5"
               style={{ border: stats.overdue > 0 ? '1px solid rgba(239,68,68,0.2)' : undefined }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                 style={{ background: stats.overdue > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)' }}>
              {stats.overdue > 0 ? '⚠️' : '✅'}
            </div>
            <div>
              <p className="text-xs text-ink-500 uppercase tracking-wider mb-1">เกินกำหนดชำระ</p>
              <p className="stat-value text-2xl" style={{ color: stats.overdue > 0 ? '#ff7043' : '#4caf78' }}>
                {stats.overdue} รายการ
              </p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                 style={{ background: 'rgba(232,168,0,0.1)' }}>💰</div>
            <div>
              <p className="text-xs text-ink-500 uppercase tracking-wider mb-1">มูลค่าจำนำรวม</p>
              <p className="stat-value text-2xl text-gold-400">{formatTHB(stats.totalValue)} ฿</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent table */}
      <div className="page-enter stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-display font-semibold text-amber-100 text-lg">รายการล่าสุด</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push('/devices')}>ดูทั้งหมด →</Button>
        </div>
        <Table>
          <THead>
            <tr>
              <Th>รหัส</Th>
              <Th>เจ้าของ</Th>
              <Th>รุ่น / ระบบ</Th>
              <Th>วงเงิน</Th>
              <Th>ครบกำหนด</Th>
              <Th>สถานะ</Th>
              <Th>ล็อก</Th>
            </tr>
          </THead>
          <TBody>
            {devices.length === 0 && <EmptyRow cols={7} message="ยังไม่มีรายการ กด + รับจำนำใหม่" />}
            {devices.map(d => {
              const overdue = isOverdue(d.dueDate)
              const days = getDaysLeft(d.dueDate)
              return (
                <Tr key={d.id}>
                  <Td><span className="text-mono text-gold-500 text-xs">{d.id}</span></Td>
                  <Td><span className="font-medium text-ink-200">{d.owner}</span></Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.os === 'iOS' ? 'ios' : 'android'} label={d.model} />
                    </div>
                  </Td>
                  <Td><span className="text-mono text-ink-200">{formatTHB(d.amount)} ฿</span></Td>
                  <Td>
                    <span className={overdue ? 'text-red-400 font-medium' : 'text-ink-400'}>
                      {formatDate(d.dueDate)}
                      {overdue
                        ? <span className="ml-1 text-xs text-red-400">เกิน {Math.abs(days)}ว</span>
                        : days <= 7 && <span className="ml-1 text-xs text-amber-400">เหลือ {days}ว</span>}
                    </span>
                  </Td>
                  <Td>
                    <Badge variant={d.locked ? 'locked' : 'active'} label={d.locked ? 'ล็อก' : 'ปกติ'} />
                  </Td>
                  <Td>
                    <button
                      onClick={() => handleLock(d.id, !d.locked)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${d.locked ? 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10' : 'border-red-500/25 text-red-400 hover:bg-red-500/10'}`}>
                      {d.locked ? '🔓 ปลด' : '🔒 ล็อก'}
                    </button>
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </div>
    </div>
  )
}
