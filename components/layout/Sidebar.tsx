'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',     icon: '◈', group: 'หลัก' },
  { href: '/devices',   label: 'รายการจำนำ',   icon: '▣', group: 'หลัก' },
  { href: '/lock',      label: 'ล็อกเครื่อง',  icon: '◉', group: 'หลัก' },
  { href: '/redeem',    label: 'ไถ่ถอน',        icon: '◎', group: 'หลัก' },
  { href: '/report',    label: 'รายงาน',        icon: '◑', group: 'วิเคราะห์' },
  { href: '/users',     label: 'ผู้ใช้งาน',    icon: '◐', group: 'ระบบ', adminOnly: true },
  { href: '/settings',  label: 'ตั้งค่า',       icon: '◌', group: 'ระบบ', adminOnly: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role

  const groups = ['หลัก', 'วิเคราะห์', 'ระบบ']

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r"
           style={{ background: 'rgba(20,18,13,0.9)', borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
               style={{ background: 'linear-gradient(135deg,#e8a800,#c48a00)' }}>📱</div>
          <div>
            <span className="text-display font-bold text-amber-100 text-base tracking-tight">PawnTech</span>
            <div className="text-xs text-ink-600 font-light">v1.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {groups.map(group => {
          const items = navItems.filter(n => n.group === group && (!n.adminOnly || role === 'admin'))
          if (!items.length) return null
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold tracking-[1.5px] uppercase text-ink-700 px-3 mb-2">{group}</p>
              <div className="space-y-0.5">
                {items.map(item => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                        active
                          ? 'nav-item-active font-medium'
                          : 'text-ink-500 hover:text-ink-200 hover:bg-white/4'
                      )}
                      style={active ? { paddingLeft: '11px' } : {}}
                    >
                      <span className="text-base w-5 text-center" style={{ fontStyle: 'normal' }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User area */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="px-3 py-2 mb-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs font-semibold text-ink-200 truncate">{(session?.user as any)?.name}</p>
          <p className="text-[11px] text-ink-600 font-mono mt-0.5">
            {role === 'admin' ? '🔑 Admin' : '👤 Staff'}
          </p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-600 hover:text-ink-300 hover:bg-white/4 transition-all">
          <span>⎋</span> ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
