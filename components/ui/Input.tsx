import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

const base = 'w-full px-3.5 py-2.5 text-sm text-ink-200 placeholder-ink-700 rounded-xl transition-all focus:outline-none focus:border-gold-600/60 focus:ring-1 focus:ring-gold-600/20'
const bg   = 'bg-white/[0.03] border border-white/[0.08]'

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-600">{label}</label>}
      <input {...props} className={cn(base, bg, className)} />
    </div>
  )
}

export function Select({ label, children, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-600">{label}</label>}
      <select {...props} className={cn(base, bg, 'cursor-pointer', className)}
              style={{ colorScheme: 'dark' }}>
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] font-semibold tracking-widest uppercase text-ink-600">{label}</label>}
      <textarea {...props} className={cn(base, bg, 'resize-none min-h-[80px]', className)} />
    </div>
  )
}
