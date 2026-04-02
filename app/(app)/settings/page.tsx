'use client'
import { useEffect, useState } from 'react'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const [form, setForm] = useState({ shop_name: '', interest_rate: '3', max_months: '3', mdm_server: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setForm(d))
  }, [])

  function f(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }))
  }

  async function save() {
    setSaving(true)
    const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) toast('✓ บันทึกการตั้งค่าแล้ว', 'success')
    else toast('เกิดข้อผิดพลาด', 'error')
  }

  return (
    <div className="space-y-6">
      <div className="page-enter">
        <h2 className="text-display text-3xl font-bold text-amber-100">ตั้งค่าระบบ</h2>
        <p className="text-ink-500 text-sm mt-1">กำหนดค่าเริ่มต้นและข้อมูลร้าน</p>
      </div>
      <div className="max-w-xl page-enter stagger-1">
        <div className="glass-card gold-border p-6 space-y-5">
          <Input label="ชื่อร้าน" value={form.shop_name} onChange={f('shop_name')} placeholder="ชื่อร้านรับจำนำ" />
          <Input label="อัตราดอกเบี้ยเริ่มต้น (%/เดือน)" type="number" value={form.interest_rate} onChange={f('interest_rate')} min="1" max="20" />
          <Input label="ระยะเวลาจำนำสูงสุด (เดือน)" type="number" value={form.max_months} onChange={f('max_months')} min="1" max="12" />
          <Input label="MDM Server URL (ไม่บังคับ)" value={form.mdm_server} onChange={f('mdm_server')} placeholder="https://mdm.yourshop.com" />
          <div className="pt-2">
            <Button variant="gold" loading={saving} onClick={save}>💾 บันทึกการตั้งค่า</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
