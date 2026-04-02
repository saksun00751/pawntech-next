'use client'
import { useEffect, useState, useCallback } from 'react'
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import { formatTHB, formatDate, isOverdue, getDaysLeft, calcInterest } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface Device { id: string; owner: string; model: string; os: string; amount: number; rate: number; dateIn: string; dueDate: string; locked: boolean }

export default function RedeemPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/devices')
    setDevices(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function redeem(d: Device) {
    const interest = calcInterest(d.amount, d.rate, new Date(d.dateIn))
    const total = d.amount + interest
    if (!confirm(`ยืนยันไถ่ถอน ${d.model}\n(${d.id})\n\nวงเงิน: ${formatTHB(d.amount)} ฿\nดอกเบี้ย: ${formatTHB(interest)} ฿\nรวมจ่าย: ${formatTHB(total)} ฿`)) return
    const res = await fetch('/api/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id }) })
    const data = await res.json()
    if (res.ok) { toast(`💰 ไถ่ถอนสำเร็จ ${formatTHB(data.total)} บาท`, 'success'); load() }
    else toast(data.error || 'เกิดข้อผิดพลาด', 'error')
  }

  const totalPrincipal = devices.reduce((s, d) => s + d.amount, 0)
  const totalInterest = devices.reduce((s, d) => s + calcInterest(d.amount, d.rate, new Date(d.dateIn)), 0)

  return (
    <div className="space-y-6">
      <div className="page-enter">
        <h2 className="text-display text-3xl font-bold text-amber-100">รายการรอไถ่ถอน</h2>
        <p className="text-ink-500 text-sm mt-1">คำนวณดอกเบี้ยอัตโนมัติตามจำนวนวันที่ผ่านมา</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 page-enter stagger-1">
        {[
          { label: 'วงเงินรวม', value: `${formatTHB(totalPrincipal)} ฿`, color: '#e8a800' },
          { label: 'ดอกเบี้ยสะสม', value: `${formatTHB(totalInterest)} ฿`, color: '#ff7043' },
          { label: 'คาดรับรวม', value: `${formatTHB(totalPrincipal + totalInterest)} ฿`, color: '#4caf78' },
        ].map(c => (
          <div key={c.label} className="glass-card p-4">
            <p className="text-xs text-ink-600 uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-mono text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="page-enter stagger-2">
        <Table>
          <THead>
            <tr><Th>รหัส</Th><Th>เจ้าของ</Th><Th>รุ่น / ระบบ</Th><Th>วงเงิน</Th><Th>ดอกเบี้ย</Th><Th>รวมจ่าย</Th><Th>ครบกำหนด</Th><Th>ไถ่ถอน</Th></tr>
          </THead>
          <TBody>
            {loading && [...Array(4)].map((_, i) => <Tr key={i}>{[...Array(8)].map((_, j) => <Td key={j}><div className="skeleton h-4 rounded" /></Td>)}</Tr>)}
            {!loading && devices.length === 0 && <EmptyRow cols={8} message="ไม่มีรายการรอไถ่ถอน" />}
            {!loading && devices.map(d => {
              const interest = calcInterest(d.amount, d.rate, new Date(d.dateIn))
              const total = d.amount + interest
              const overdue = isOverdue(d.dueDate)
              const days = getDaysLeft(d.dueDate)
              return (
                <Tr key={d.id}>
                  <Td><span className="text-mono text-xs text-gold-500">{d.id}</span></Td>
                  <Td><span className="font-medium text-ink-200">{d.owner}</span></Td>
                  <Td><Badge variant={d.os === 'iOS' ? 'ios' : 'android'} label={d.model} /></Td>
                  <Td><span className="text-mono text-ink-300">{formatTHB(d.amount)} ฿</span></Td>
                  <Td><span className="text-mono text-amber-400 font-medium">{formatTHB(interest)} ฿</span></Td>
                  <Td><span className="text-mono text-emerald-400 font-bold">{formatTHB(total)} ฿</span></Td>
                  <Td>
                    <div className={overdue ? 'text-red-400 font-semibold' : 'text-ink-400'}>{formatDate(d.dueDate)}</div>
                    {overdue
                      ? <div className="text-xs text-red-400 mt-0.5">⚠ เกิน {Math.abs(days)} วัน</div>
                      : days <= 7 && <div className="text-xs text-amber-400 mt-0.5">⏰ เหลือ {days} วัน</div>}
                  </Td>
                  <Td>
                    <button onClick={() => redeem(d)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gold-700/30 text-gold-500 hover:bg-gold-500/10 font-medium transition-all">
                      💰 ไถ่ถอน
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
