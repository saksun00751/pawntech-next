'use client'
import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className={`glass-card gold-border w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        style={{ animation: 'fadeUp 0.2s cubic-bezier(0.16,1,0.3,1) forwards', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
             style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-display font-semibold text-amber-100 text-lg">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-200 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex-shrink-0 flex gap-3 justify-end px-6 py-4 border-t"
               style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
