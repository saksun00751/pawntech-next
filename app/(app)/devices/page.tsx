'use client'
import { useEffect, useState, useCallback } from 'react'
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { formatTHB, formatDate, isOverdue, getDaysLeft, calcInterest } from '@/lib/utils'

interface Device {
  id: string; owner: string; phone: string; model: string; spec: string
  imei: string; serial: string; os: string; amount: number; rate: number
  months: number; dateIn: string; dueDate: string; note: string; locked: boolean
  createdByName?: string
}

const emptyForm = {
  os: 'iOS', owner: '', phone: '', model: '', spec: '',
  imei: '', serial: '', amount: '', rate: '3', months: '3',
  dateIn: new Date().toISOString().split('T')[0], note: '', mdmPin: ''
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [search, setSearch] = useState('')
  const [osFilter, setOsFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (osFilter) params.set('os', osFilter)
    const res = await fetch(`/api/devices?${params}`)
    setDevices(await res.json())
    setLoading(false)
  }, [search, osFilter])

  useEffect(() => { load() }, [load])

  function f(k: keyof typeof form) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value })) }

  async function addDevice() {
    if (!form.owner || !form.model || !form.imei || !form.amount) {
      toast('กรุณากรอกข้อมูลที่จำเป็น (*)', 'error'); return
    }
    setSaving(true)
    const res = await fetch('/api/devices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), rate: parseFloat(form.rate), months: parseInt(form.months) }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { toast(`✓ รับจำนำสำเร็จ: ${data.id}`, 'success'); setAddOpen(false); setForm(emptyForm); load() }
    else toast(data.error || 'เกิดข้อผิดพลาด', 'error')
  }

  async function toggleLock(id: string, lock: boolean) {
    await fetch('/api/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, locked: lock }) })
    setDevices(p => p.map(d => d.id === id ? { ...d, locked: lock } : d))
    toast(lock ? `🔒 ล็อก ${id} แล้ว` : `🔓 ปลดล็อก ${id} แล้ว`, lock ? 'error' : 'success')
  }

  async function redeem(d: Device) {
    const interest = calcInterest(d.amount, d.rate, new Date(d.dateIn))
    const total = d.amount + interest
    if (!confirm(`ยืนยันไถ่ถอน ${d.model} (${d.id})\n\nวงเงิน: ${formatTHB(d.amount)} บาท\nดอกเบี้ย: ${formatTHB(interest)} บาท\nรวมจ่าย: ${formatTHB(total)} บาท`)) return
    const res = await fetch('/api/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id }) })
    const data = await res.json()
    if (res.ok) { toast(`💰 ไถ่ถอนสำเร็จ รวม ${formatTHB(data.total)} บาท`, 'success'); load() }
    else toast(data.error || 'เกิดข้อผิดพลาด', 'error')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between page-enter">
        <div>
          <h2 className="text-display text-3xl font-bold text-amber-100">รายการจำนำ</h2>
          <p className="text-ink-500 text-sm mt-1">จัดการรายการจำนำมือถือทั้งหมด</p>
        </div>
        <Button variant="gold" onClick={() => { setForm({ ...emptyForm, dateIn: new Date().toISOString().split('T')[0] }); setAddOpen(true) }}>
          + รับจำนำใหม่
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap page-enter stagger-1">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-600 text-sm">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา ชื่อ / รุ่น / IMEI..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl text-ink-200 placeholder-ink-700 focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }} />
        </div>
        <select value={osFilter} onChange={e => setOsFilter(e.target.value)}
          className="px-4 py-2.5 text-sm rounded-xl text-ink-300 focus:outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', colorScheme: 'dark' }}>
          <option value="">ทุกระบบ</option>
          <option value="iOS">🍎 iOS / iPhone</option>
          <option value="Android">🤖 Android</option>
        </select>
      </div>

      {/* Table */}
      <div className="page-enter stagger-2">
        <Table>
          <THead>
            <tr>
              <Th>รหัส</Th><Th>เจ้าของ / โทร</Th><Th>รุ่น / ระบบ</Th>
              <Th>IMEI</Th><Th>วงเงิน</Th><Th>ดอกเบี้ย</Th>
              <Th>ครบกำหนด</Th><Th>สถานะ</Th><Th>จัดการ</Th>
            </tr>
          </THead>
          <TBody>
            {loading && (
              [...Array(5)].map((_, i) => (
                <Tr key={i}>
                  {[...Array(9)].map((_, j) => <Td key={j}><div className="skeleton h-4 rounded" /></Td>)}
                </Tr>
              ))
            )}
            {!loading && devices.length === 0 && <EmptyRow cols={9} message="ไม่พบรายการ" />}
            {!loading && devices.map(d => {
              const interest = calcInterest(d.amount, d.rate, new Date(d.dateIn))
              const overdue = isOverdue(d.dueDate)
              const days = getDaysLeft(d.dueDate)
              return (
                <Tr key={d.id}>
                  <Td><span className="text-mono text-xs text-gold-500">{d.id}</span></Td>
                  <Td>
                    <div className="font-medium text-ink-200">{d.owner}</div>
                    <div className="text-xs text-ink-600 mt-0.5">{d.phone}</div>
                  </Td>
                  <Td>
                    <Badge variant={d.os === 'iOS' ? 'ios' : 'android'} label={d.model} />
                    {d.spec && <div className="text-xs text-ink-600 mt-1">{d.spec}</div>}
                  </Td>
                  <Td><span className="text-mono text-xs text-ink-500">{d.imei}</span></Td>
                  <Td>
                    <div className="text-mono text-ink-200">{formatTHB(d.amount)} ฿</div>
                    <div className="text-xs text-ink-600">{d.rate}%/เดือน</div>
                  </Td>
                  <Td><span className="text-mono text-amber-400">{formatTHB(interest)} ฿</span></Td>
                  <Td>
                    <div className={overdue ? 'text-red-400 font-medium' : 'text-ink-400'}>
                      {formatDate(d.dueDate)}
                    </div>
                    <div className="text-xs mt-0.5">
                      {overdue
                        ? <span className="text-red-400">⚠ เกิน {Math.abs(days)} วัน</span>
                        : days <= 7 && <span className="text-amber-400">⏰ เหลือ {days} วัน</span>}
                    </div>
                  </Td>
                  <Td><Badge variant={d.locked ? 'locked' : 'active'} label={d.locked ? 'ล็อก' : 'ปกติ'} /></Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleLock(d.id, !d.locked)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${d.locked ? 'border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10' : 'border-red-500/25 text-red-400 hover:bg-red-500/10'}`}>
                        {d.locked ? '🔓' : '🔒'}
                      </button>
                      <button onClick={() => redeem(d)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-gold-700/30 text-gold-500 hover:bg-gold-500/10 transition-all">
                        💰
                      </button>
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="📱 รับจำนำมือถือ" size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>ยกเลิก</Button>
          <Button variant="gold" loading={saving} onClick={addDevice}>✅ รับจำนำ</Button>
        </>}>
        {/* OS Selector */}
        <div className="mb-5">
          <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-600 mb-2">ระบบปฏิบัติการ *</label>
          <div className="grid grid-cols-2 gap-3">
            {(['iOS', 'Android'] as const).map(os => (
              <button key={os} type="button" onClick={() => setForm(p => ({ ...p, os }))}
                className="py-3 rounded-xl border text-sm font-medium transition-all text-center"
                style={form.os === os
                  ? { background: os === 'iOS' ? 'rgba(0,122,255,0.12)' : 'rgba(61,220,132,0.12)', borderColor: os === 'iOS' ? '#007aff' : '#3ddc84', color: os === 'iOS' ? '#4da6ff' : '#4caf78' }
                  : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)', color: '#8892a4' }}>
                <span className="text-xl block mb-1">{os === 'iOS' ? '🍎' : '🤖'}</span>
                {os === 'iOS' ? 'iOS / iPhone' : 'Android'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="ชื่อเจ้าของ *" value={form.owner} onChange={f('owner')} placeholder="ชื่อ-นามสกุล" />
          <Input label="เบอร์โทร" value={form.phone} onChange={f('phone')} placeholder="08x-xxx-xxxx" />
          <Input label="รุ่นเครื่อง *" value={form.model} onChange={f('model')} placeholder="iPhone 15 Pro" />
          <Input label="สี / ความจุ" value={form.spec} onChange={f('spec')} placeholder="สีดำ / 256GB" />
          <Input label="IMEI *" value={form.imei} onChange={f('imei')} placeholder="15 หลัก" maxLength={20} />
          <Input label="Serial Number" value={form.serial} onChange={f('serial')} placeholder="SN..." />
          <Input label="วงเงินจำนำ (บาท) *" type="number" value={form.amount} onChange={f('amount')} placeholder="0" />
          <Input label="ดอกเบี้ย/เดือน (%)" type="number" value={form.rate} onChange={f('rate')} min="1" max="20" />
          <Input label="วันที่รับจำนำ" type="date" value={form.dateIn} onChange={f('dateIn')} />
          <Input label="ระยะเวลา (เดือน)" type="number" value={form.months} onChange={f('months')} min="1" max="12" />
          <div className="col-span-2">
            <Input label="รหัส MDM (เก็บเป็นความลับ)" value={form.mdmPin} onChange={f('mdmPin')} placeholder="รหัสสำหรับปลดล็อกเครื่อง" />
          </div>
          <div className="col-span-2">
            <Textarea label="หมายเหตุ" value={form.note} onChange={f('note')} placeholder="สภาพเครื่อง, รอยขีดข่วน, อุปกรณ์เสริม..." />
          </div>
        </div>
      </Modal>
    </div>
  )
}
