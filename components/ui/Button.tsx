import { cn } from '@/lib/utils'

type Variant = 'gold' | 'danger' | 'success' | 'ghost' | 'outline'
type Size = 'sm' | 'md'

const variants: Record<Variant, string> = {
  gold:    'bg-gradient-to-br from-gold-500 to-gold-700 text-ink-950 font-semibold hover:from-gold-400 hover:to-gold-600 hover:-translate-y-px shadow-lg shadow-gold-900/20',
  danger:  'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20',
  ghost:   'text-ink-400 hover:text-ink-200 hover:bg-white/5',
  outline: 'border border-white/10 text-ink-300 hover:border-white/20 hover:text-ink-100',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export default function Button({ variant = 'outline', size = 'md', loading, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant], sizes[size], className
      )}
    >
      {loading
        ? <><span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> กำลังโหลด...</>
        : children}
    </button>
  )
}
