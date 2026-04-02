import { cn } from '@/lib/utils'

type BadgeVariant = 'ios' | 'android' | 'locked' | 'active' | 'warning' | 'admin' | 'staff'

const variants: Record<BadgeVariant, string> = {
  ios:      'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  android:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  locked:   'bg-red-500/10 text-red-400 border border-red-500/20',
  active:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  admin:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  staff:    'bg-white/5 text-ink-400 border border-white/10',
}

const icons: Record<BadgeVariant, string> = {
  ios: '🍎', android: '🤖', locked: '🔒', active: '🔓', warning: '⚠️', admin: '👑', staff: '👤'
}

export default function Badge({ variant, label }: { variant: BadgeVariant; label?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-mono', variants[variant])}>
      <span>{icons[variant]}</span>
      {label ?? variant}
    </span>
  )
}
