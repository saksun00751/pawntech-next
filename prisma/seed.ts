// prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port || 3306),
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
  connectionLimit: 2,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminHash = await bcrypt.hash('Admin@1234', 12)
  const staffHash = await bcrypt.hash('Staff@1234', 12)

  await prisma.users.upsert({
    where: { username: 'admin' },
    update: { password: adminHash },
    create: { username: 'admin', password: adminHash, name: 'ผู้ดูแลระบบ', role: 'admin' },
  })
  await prisma.users.upsert({
    where: { username: 'staff1' },
    update: { password: staffHash },
    create: { username: 'staff1', password: staffHash, name: 'พนักงาน 1', role: 'staff' },
  })

  const settings = [
    { k: 'shop_name',      v: 'PawnTech มือถือ' },
    { k: 'interest_rate',  v: '3' },
    { k: 'max_months',     v: '3' },
    { k: 'mdm_server',     v: '' },
  ]
  for (const s of settings) {
    await prisma.settings.upsert({ where: { k: s.k }, update: {}, create: s })
  }

  console.log('✅ Seed complete')
  console.log('   admin  / Admin@1234')
  console.log('   staff1 / Staff@1234')
}

main().catch(console.error).finally(() => prisma.$disconnect())
