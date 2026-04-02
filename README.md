# 📱 PawnTech — Next.js Edition

ระบบรับจำนำมือถือสำหรับทีมงาน พร้อม Login, Dashboard, ล็อกเครื่อง และ Report  
สร้างด้วย **Next.js 14 App Router** + **Prisma ORM** + **NextAuth** + **Recharts**

---

## 📁 โครงสร้างไฟล์

```
pawntech-next/
├── app/
│   ├── (app)/                    ← หน้าหลัง login (authenticated)
│   │   ├── layout.tsx            ← AppShell + Toast Provider
│   │   ├── dashboard/page.tsx    ← ภาพรวมระบบ
│   │   ├── devices/page.tsx      ← รับจำนำ / รายการทั้งหมด
│   │   ├── lock/page.tsx         ← ล็อก/ปลดล็อกเครื่อง
│   │   ├── redeem/page.tsx       ← ไถ่ถอน + คำนวณดอก
│   │   ├── report/page.tsx       ← 📊 รายงาน + กราฟ
│   │   ├── users/page.tsx        ← จัดการพนักงาน (Admin)
│   │   └── settings/page.tsx     ← ตั้งค่าระบบ (Admin)
│   ├── api/
│   │   ├── auth/[...nextauth]/   ← NextAuth endpoint
│   │   ├── stats/                ← GET สถิติ
│   │   ├── devices/              ← GET list, POST add
│   │   ├── lock/                 ← POST lock/unlock
│   │   ├── redeem/               ← POST ไถ่ถอน
│   │   ├── report/               ← GET รายงาน + กราฟ
│   │   ├── users/                ← GET/POST/PATCH จัดการ user
│   │   └── settings/             ← GET/POST ตั้งค่า
│   ├── login/page.tsx            ← หน้า Login
│   ├── layout.tsx                ← Root layout
│   ├── page.tsx                  ← redirect → /dashboard
│   └── globals.css               ← Tailwind + custom styles
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          ← Auth wrapper + layout
│   │   ├── Sidebar.tsx           ← Navigation sidebar
│   │   └── TopBar.tsx            ← Header bar
│   └── ui/
│       ├── Badge.tsx             ← iOS/Android/Locked badges
│       ├── Button.tsx            ← Multi-variant button
│       ├── Input.tsx             ← Input, Select, Textarea
│       ├── Modal.tsx             ← Dialog modal
│       ├── StatCard.tsx          ← KPI stat card
│       ├── Table.tsx             ← Data table components
│       └── Toast.tsx             ← Global toast notifications
├── lib/
│   ├── auth.ts                   ← NextAuth config
│   ├── apiAuth.ts                ← Server-side auth helpers
│   ├── prisma.ts                 ← Prisma singleton
│   └── utils.ts                  ← Utilities (format, calc)
├── prisma/
│   ├── schema.prisma             ← Database schema
│   └── seed.ts                   ← Default users & settings
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.example                  ← Copy → .env
```

---

## 🚀 ติดตั้งบน Server (VPS / Shared Hosting)

### ✅ ความต้องการ
- **Node.js 18+** (แนะนำ 20 LTS)
- **npm** หรือ **pnpm**
- Database: **SQLite** (dev) หรือ **MySQL/PostgreSQL** (production)

---

### ขั้นตอนที่ 1 — อัพโหลดและติดตั้ง

```bash
# อัพโหลด pawntech-next/ ไปยัง server แล้วรัน:
cd pawntech-next

# ติดตั้ง dependencies
npm install

# หรือถ้าใช้ pnpm
pnpm install
```

---

### ขั้นตอนที่ 2 — ตั้งค่า Environment

```bash
# คัดลอก .env.example เป็น .env
cp .env.example .env

# แก้ไขค่าใน .env
nano .env
```

**ค่าที่ต้องแก้ใน `.env`:**

```env
# สำหรับ SQLite (ง่าย ไม่ต้องติดตั้งเพิ่ม)
DATABASE_URL="file:./prisma/prod.db"

# สำหรับ MySQL (Shared Hosting ส่วนใหญ่)
DATABASE_URL="mysql://DB_USER:DB_PASS@localhost:3306/pawntech"

# สร้าง secret ด้วย: openssl rand -base64 32
NEXTAUTH_SECRET="ใส่ random string ยาวๆ ที่นี่"

# URL จริงของเว็บไซต์
NEXTAUTH_URL="https://yourdomain.com"
```

---

### ขั้นตอนที่ 3 — Setup Database

```bash
# สร้าง database tables
npx prisma migrate dev --name init

# หรือสำหรับ production
npx prisma migrate deploy

# เพิ่มข้อมูลเริ่มต้น (users + settings)
npx prisma db seed
```

---

### ขั้นตอนที่ 4 — Build & Start

```bash
# Build production
npm run build

# Start server (port 3000)
npm start

# หรือระบุ port
PORT=8080 npm start
```

---

### ขั้นตอนที่ 5 — PM2 (แนะนำ สำหรับ VPS)

```bash
# ติดตั้ง PM2
npm install -g pm2

# Start
pm2 start npm --name "pawntech" -- start

# Auto-start เมื่อ reboot
pm2 startup
pm2 save
```

---

## 🌐 Deploy บน Vercel (ง่ายที่สุด)

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Deploy
vercel

# ตั้งค่า Environment Variables ใน Vercel Dashboard:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

---

## 🐳 Docker (ตัวเลือก)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔐 บัญชีเริ่มต้น (หลัง seed)

| Username | Password     | Role  |
|----------|-------------|-------|
| admin    | `Admin@1234` | Admin |
| staff1   | `Staff@1234` | Staff |

> ⚠️ **เปลี่ยนรหัสผ่านทันทีหลัง deploy!**  
> ไปที่ `/users` → "เปลี่ยนรหัสผ่าน"

---

## 👥 สิทธิ์การใช้งาน

| ฟีเจอร์                | Staff | Admin |
|-----------------------|:-----:|:-----:|
| Dashboard             | ✅    | ✅    |
| รับจำนำ               | ✅    | ✅    |
| ล็อก/ปลดล็อกเครื่อง  | ✅    | ✅    |
| ไถ่ถอน               | ✅    | ✅    |
| รายงาน + กราฟ        | ✅    | ✅    |
| จัดการพนักงาน         | ❌    | ✅    |
| ตั้งค่าระบบ           | ❌    | ✅    |

---

## 🛡️ Security Features

- ✅ รหัสผ่าน Bcrypt (cost 12)
- ✅ JWT Session (NextAuth)
- ✅ Session timeout 8 ชั่วโมง
- ✅ Protected API routes ทุก endpoint
- ✅ Role-based access (Admin/Staff)
- ✅ Audit log บันทึกทุก action
- ✅ SQL Injection protection (Prisma ORM)

---

## 🔄 เปลี่ยน Database จาก SQLite → MySQL

1. แก้ `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"   // เปลี่ยนจาก "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. แก้ `.env`:
   ```env
   DATABASE_URL="mysql://user:pass@localhost:3306/pawntech"
   ```

3. รัน:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

---

## ❓ แก้ปัญหาที่พบบ่อย

**`Cannot find module '@prisma/client'`**
```bash
npx prisma generate
```

**`Database connection failed`**
- ตรวจสอบ `DATABASE_URL` ใน `.env`
- ตรวจสอบว่า MySQL/PostgreSQL รันอยู่

**`NEXTAUTH_SECRET is not set`**
```bash
openssl rand -base64 32
# นำ output ไปใส่ใน .env
```

**Port ถูกใช้งานอยู่**
```bash
PORT=4000 npm start
```
