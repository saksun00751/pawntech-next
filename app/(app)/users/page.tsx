'use client'
import { useEffect, useState } from 'react'
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface User { id: number; username: string; name: string; role: string; active: boolean; lastLogin: string | null; createdAt: string }

export default function UsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'staff' })
  const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const role = (session?.user as any)?.role
  useEffect(() => { if (role && role !== 'admin') router.push('/dashboard') }, [role, router])

  async function load() {
    setLoading(true)
    const res = await fetch('/api/users')
    setUsers(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function addUser() {
    if (!form.name || !form.username || !form.password) { toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return }
    if (form.password.length < 6) { toast('รหัสผ่านต้องมีอย่างน้อย 6 ตัว', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    const data = await res.json()
    if (res.ok) { toast('✓ เพิ่มผู้ใช้แล้ว', 'success'); setAddOpen(false); setForm({ name: '', username: '', password: '', role: 'staff' }); load() }
    else toast(data.error || 'เกิดข้อผิดพลาด', 'error')
  }

  async function toggleUser(id: number) {
    const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'toggle' }) })
    if (res.ok) { toast('✓ เปลี่ยนสถานะแล้ว', 'success'); load() }
  }

  async function changePassword() {
    if (!pwForm.old || !pwForm.new) { toast('กรุณากรอกรหัสผ่าน', 'error'); return }
    if (pwForm.new !== pwForm.confirm) { toast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return }
    if (pwForm.new.length < 6) { toast('รหัสผ่านต้องมีอย่างน้อย 6 ตัว', 'error'); return }
    setSaving(true)
    const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'changePassword', old: pwForm.old, new: pwForm.new }) })
    setSaving(false)
    const data = await res.json()
    if (res.ok) { toast('✓ เปลี่ยนรหัสผ่านแล้ว', 'success'); setPwOpen(false); setPwForm({ old: '', new: '', confirm: '' }) }
    else toast(data.error || 'รหัสผ่านเดิมไม่ถูกต้อง', 'error')
  }

  function f(k: keyof typeof form) { return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value })) }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between page-enter">
        <div>
          <h2 className="text-display text-3xl font-bold text-amber-100">จัดการผู้ใช้งาน</h2>
          <p className="text-ink-500 text-sm mt-1">เพิ่ม แก้ไข และจัดการสิทธิ์พนักงาน</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPwOpen(true)}>🔑 เปลี่ยนรหัสผ่าน</Button>
          <Button variant="gold" onClick={() => setAddOpen(true)}>+ เพิ่มผู้ใช้</Button>
        </div>
      </div>

      <div className="page-enter stagger-1">
        <Table>
          <THead>
            <tr><Th>ID</Th><Th>Username</Th><Th>ชื่อ</Th><Th>บทบาท</Th><Th>Login ล่าสุด</Th><Th>สมัครเมื่อ</Th><Th>สถานะ</Th><Th>จัดการ</Th></tr>
          </THead>
          <TBody>
            {loading && [...Array(3)].map((_, i) => <Tr key={i}>{[...Array(8)].map((_, j) => <Td key={j}><div className="skeleton h-4 rounded" /></Td>)}</Tr>)}
            {!loading && users.length === 0 && <EmptyRow cols={8} />}
            {!loading && users.map(u => (
              <Tr key={u.id}>
                <Td><span className="text-mono text-xs text-ink-500">#{u.id}</span></Td>
                <Td><span className="text-mono text-sm text-gold-500">{u.username}</span></Td>
                <Td><span className="font-medium text-ink-200">{u.name}</span></Td>
                <Td><Badge variant={u.role as 'admin' | 'staff'} label={u.role === 'admin' ? 'Admin' : 'Staff'} /></Td>
                <Td><span className="text-xs text-ink-500">{u.lastLogin ? formatDate(u.lastLogin) : 'ยังไม่เคย'}</span></Td>
                <Td><span className="text-xs text-ink-500">{formatDate(u.createdAt)}</span></Td>
                <Td>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${u.active ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10' : 'text-red-400 border-red-500/25 bg-red-500/10'}`}>
                    {u.active ? 'ใช้งาน' : 'ระงับ'}
                  </span>
                </Td>
                <Td>
                  <button onClick={() => toggleUser(u.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-ink-400 hover:text-ink-200 hover:border-white/20 transition-all">
                    {u.active ? '🚫 ระงับ' : '✅ เปิดใช้'}
                  </button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="👤 เพิ่มผู้ใช้งาน" size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>ยกเลิก</Button>
          <Button variant="gold" loading={saving} onClick={addUser}>➕ เพิ่มผู้ใช้</Button>
        </>}>
        <div className="space-y-4">
          <Input label="ชื่อจริง" value={form.name} onChange={f('name')} placeholder="ชื่อ-นามสกุล" />
          <Input label="Username" value={form.username} onChange={f('username')} placeholder="ชื่อผู้ใช้" />
          <Input label="รหัสผ่าน (อย่างน้อย 6 ตัว)" type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
          <Select label="บทบาท" value={form.role} onChange={f('role')}>
            <option value="staff">Staff — พนักงาน</option>
            <option value="admin">Admin — ผู้ดูแลระบบ</option>
          </Select>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="🔑 เปลี่ยนรหัสผ่าน" size="sm"
        footer={<>
          <Button variant="ghost" onClick={() => setPwOpen(false)}>ยกเลิก</Button>
          <Button variant="gold" loading={saving} onClick={changePassword}>💾 บันทึก</Button>
        </>}>
        <div className="space-y-4">
          <Input label="รหัสผ่านเดิม" type="password" value={pwForm.old} onChange={e => setPwForm(p => ({ ...p, old: e.target.value }))} placeholder="••••••••" />
          <Input label="รหัสผ่านใหม่" type="password" value={pwForm.new} onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} placeholder="••••••••" />
          <Input label="ยืนยันรหัสผ่านใหม่" type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
        </div>
      </Modal>
    </div>
  )
}
