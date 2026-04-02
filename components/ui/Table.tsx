import { cn } from '@/lib/utils'

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden border', className)}
         style={{ background: 'rgba(28,25,18,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {children}
    </thead>
  )
}

export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('px-4 py-3 text-left text-[10px] font-semibold tracking-[1.5px] uppercase text-ink-600', className)}>
      {children}
    </th>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>{children}</tbody>
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn('transition-colors hover:bg-white/[0.02] table-row-hover', className)}>
      {children}
    </tr>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 text-sm text-ink-300', className)}>{children}</td>
}

export function EmptyRow({ cols, message = 'ไม่พบรายการ' }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center">
        <div className="text-3xl mb-3">📭</div>
        <p className="text-ink-600 text-sm">{message}</p>
      </td>
    </tr>
  )
}
