'use client'
import { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  msg: string
  type: ToastType
}

interface ToastCtx {
  toast: (msg: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function useToast() { return useContext(ToastContext) }

const icons: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠' }
const styles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 text-emerald-300',
  error:   'border-red-500/30 text-red-300',
  warning: 'border-amber-500/30 text-amber-300',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  let counter = 0

  const toast = useCallback((msg: string, type: ToastType = 'success') => {
    const id = ++counter
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id}
            className={`glass-card flex items-center gap-3 px-4 py-3 text-sm min-w-[260px] border ${styles[t.type]}`}
            style={{ animation: 'fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <span className="text-base font-bold">{icons[t.type]}</span>
            <span className="text-ink-200">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
