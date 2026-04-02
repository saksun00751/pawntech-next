import { requireAdmin, requireSession, ok, err } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const users = await prisma.users.findMany({
    select: { id: true, username: true, name: true, role: true, active: true, last_login: true, created_at: true },
    orderBy: { id: 'asc' },
  })
  return ok(users)
}

export async function POST(req: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { name, username, password, role } = await req.json()
  if (!name || !username || !password) return err('Missing fields', 422)
  if (password.length < 6) return err('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 422)

  const exists = await prisma.users.findUnique({ where: { username } })
  if (exists) return err('Username นี้มีอยู่แล้ว', 409)

  const hash = await bcrypt.hash(password, 12)
  await prisma.users.create({ data: { username, password: hash, name, role: role || 'staff' } })

  return ok({ success: true }, 201)
}

export async function PATCH(req: Request) {
  const { error: adminErr, session } = await requireSession()
  if (adminErr || !session) return adminErr!

  const body   = await req.json()
  const userId = parseInt((session.user as any).id)

  // Change own password (any role)
  if (body.action === 'changePassword') {
    const { old: oldPw, new: newPw } = body
    if (!oldPw || !newPw) return err('Missing fields', 422)
    if (newPw.length < 6) return err('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 422)

    const user = await prisma.users.findUnique({ where: { id: userId } })
    if (!user || !(await bcrypt.compare(oldPw, user.password)))
      return err('รหัสผ่านเดิมไม่ถูกต้อง', 400)

    const hash = await bcrypt.hash(newPw, 12)
    await prisma.users.update({ where: { id: userId }, data: { password: hash } })
    await prisma.audit_log.create({ data: { user_id: userId, action: 'change_password', detail: 'เปลี่ยนรหัสผ่าน' } })
    return ok({ success: true })
  }

  // Toggle active (admin only)
  if (body.action === 'toggle') {
    const { error: aErr } = await requireAdmin()
    if (aErr) return aErr

    if (body.id === userId) return err('ไม่สามารถระงับบัญชีตัวเองได้', 400)

    const target = await prisma.users.findUnique({ where: { id: body.id } })
    if (!target) return err('User not found', 404)

    await prisma.users.update({ where: { id: body.id }, data: { active: !target.active } })
    return ok({ success: true })
  }

  return err('Unknown action', 400)
}
