'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface Device { id: string; owner: string; model: string; os: string; imei: string; locked: boolean }

export default function LockPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  async function load() {
    setLoading(true)
    const res = await fetch('/api/devices')
    setDevices(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function toggle(id: string, lock: boolean) {
    await fetch('/api/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, locked: lock }) })
    setDevices(p => p.map(d => d.id === id ? { ...d, locked: lock } : d))
    toast(lock ? `🔒 ล็อก ${id} แล้ว` : `🔓 ปลดล็อก ${id} แล้ว`, lock ? 'error' : 'success')
  }

  async function lockAll(lock: boolean) {
    if (!confirm(lock ? 'ล็อกทุกเครื่อง?' : 'ปลดล็อกทุกเครื่อง?')) return
    await fetch('/api/lock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true, locked: lock }) })
    setDevices(p => p.map(d => ({ ...d, locked: lock })))
    toast(lock ? '🔒 ล็อกทุกเครื่องแล้ว' : '🔓 ปลดล็อกทุกเครื่องแล้ว', lock ? 'error' : 'success')
  }

  const lockedCount = devices.filter(d => d.locked).length
  const totalCount = devices.length

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between page-enter">
        <div>
          <h2 className="text-display text-3xl font-bold text-amber-100">ล็อก / ปลดล็อกเครื่อง</h2>
          <p className="text-ink-500 text-sm mt-1">
            ล็อกแล้ว <span className="text-red-400 font-semibold">{lockedCount}</span> จาก <span className="text-ink-300">{totalCount}</span> เครื่อง
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" size="sm" onClick={() => lockAll(false)}>🔓 ปลดล็อกทั้งหมด</Button>
          <Button variant="danger" size="sm" onClick={() => lockAll(true)}>🔒 ล็อกทั้งหมด</Button>
        </div>
      </div>

      {/* Alert */}
      <div className="rounded-xl px-5 py-4 text-sm page-enter stagger-1"
           style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', color: '#fcd877' }}>
        <span className="font-semibold">⚠️ หมายเหตุ:</span> การล็อกในระบบนี้เป็นการบันทึกสถานะ ต้องดำเนินการจริงผ่าน MDM Console แยกต่างหาก
      </div>

      {/* Lock cards grid */}
      <div className="grid gap-3 page-enter stagger-2">
        {loading && [...Array(4)].map((_, i) => <div key={i} className="glass-card h-20 skeleton" />)}
        {!loading && devices.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🔓</div>
            <p className="text-ink-600">ยังไม่มีเครื่องในระบบ</p>
          </div>
        )}
        {!loading && devices.map(d => (
          <div key={d.id} className="glass-card flex items-center gap-4 px-5 py-4 transition-all"
               style={{ border: d.locked ? '1px solid rgba(239,68,68,0.2)' : undefined }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                 style={{ background: d.os === 'iOS' ? 'rgba(0,122,255,0.1)' : 'rgba(61,220,132,0.1)' }}>
              {d.os === 'iOS' ? '🍎' : '🤖'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-200 text-sm">
                {d.model} <span className="font-normal text-ink-500">— {d.owner}</span>
              </div>
              <div className="text-xs text-ink-600 text-mono mt-0.5">{d.imei} · {d.id} · {d.os}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500">{d.locked ? '🔒 ล็อกอยู่' : '🔓 ปกติ'}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={d.locked} onChange={e => toggle(d.id, e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 rounded-full peer transition-all duration-200 peer-focus:outline-none
                  bg-white/10 border border-white/10
                  peer-checked:bg-red-500/25 peer-checked:border-red-500/40
                  after:content-[''] after:absolute after:top-[3px] after:left-[3px]
                  after:bg-ink-400 after:rounded-full after:h-[18px] after:w-[18px]
                  after:transition-all after:duration-200
                  peer-checked:after:translate-x-[20px] peer-checked:after:bg-red-400" />
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* MDM Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 page-enter stagger-3">
        {[
          { title: '🍎 วิธีล็อก iOS / iPhone', steps: ['เปิดใช้ Apple MDM (Mobile Device Management)', 'ลงทะเบียนเครื่องด้วย Apple Configurator 2', 'ส่งคำสั่ง Lost Mode ผ่าน MDM Console', 'เครื่องแสดงหน้า Lost Mode + ข้อความร้าน', 'ยกเลิก Lost Mode เมื่อลูกค้าไถ่ถอนสำเร็จ'] },
          { title: '🤖 วิธีล็อก Android', steps: ['ใช้ Samsung Knox / Google MDM / Device Policy', 'ติดตั้ง Device Owner App ก่อนรับเครื่อง', 'ส่งคำสั่ง lockNow() ผ่าน Android Device Policy', 'ตั้งรหัสผ่านใหม่ที่ลูกค้าไม่ทราบผ่าน MDM', 'Reset password เมื่อลูกค้าไถ่ถอนเรียบร้อย'] }
        ].map(section => (
          <div key={section.title} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-ink-200 mb-4 tracking-wide">{section.title}</h3>
            <div className="space-y-3">
              {section.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-mono mt-0.5"
                       style={{ background: 'rgba(232,168,0,0.15)', color: '#e8a800' }}>{i+1}</div>
                  <p className="text-xs text-ink-500 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
