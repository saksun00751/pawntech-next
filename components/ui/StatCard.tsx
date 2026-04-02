import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: string
  color?: 'gold' | 'jade' | 'ember' | 'sapphire' | 'default'
  delay?: number
}

const colorMap = {
  gold:     { bar: '#e8a800', glow: 'rgba(232,168,0,0.12)', text: '#fcd877' },
  jade:     { bar: '#2e7d52', glow: 'rgba(46,125,82,0.12)',  text: '#4caf78' },
  ember:    { bar: '#e64a19', glow: 'rgba(230,74,25,0.12)',  text: '#ff7043' },
  sapphire: { bar: '#1a7fd4', glow: 'rgba(26,127,212,0.12)', text: '#4da6ff' },
  default:  { bar: '#625948', glow: 'rgba(98,89,72,0.12)',   text: '#b3aa97' },
}

export default function StatCard({ label, value, sub, icon, color = 'default', delay = 0 }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div
      className="glass-card relative overflow-hidden p-5 page-enter"
      style={{ animationDelay: `${delay}ms`, opacity: 0, boxShadow: `0 0 40px ${c.glow}` }}
    >
      {/* Top color bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: c.bar }} />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium tracking-wider uppercase text-ink-500">{label}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      <p className="stat-value text-3xl mb-1" style={{ color: c.text }}>{value}</p>
      {sub && <p className="text-xs text-ink-600">{sub}</p>}
    </div>
  )
}
