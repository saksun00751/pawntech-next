'use client'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/devices':   'รายการจำนำ',
  '/lock':      'ล็อก / ปลดล็อกเครื่อง',
  '/redeem':    'ไถ่ถอน',
  '/report':    'รายงานและสถิติ',
  '/users':     'จัดการผู้ใช้งาน',
  '/settings':  'ตั้งค่าระบบ',
}

export default function TopBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const now = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0"
            style={{ background: 'rgba(20,18,13,0.7)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div>
        <h1 className="text-display font-bold text-amber-100 text-lg leading-none">
          {titles[pathname] ?? 'PawnTech'}
        </h1>
        <p className="text-[11px] text-ink-600 mt-0.5">{now}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="w-1.5 h-1.5 bg-jade-400 rounded-full animate-pulse" />
          <span className="text-ink-400">{(session?.user as any)?.name}</span>
        </div>
      </div>
    </header>
  )
}
