'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      username: form.username,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) router.push('/dashboard')
    else setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(232,168,0,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(230,74,25,0.05) 0%, transparent 70%)' }} />
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e8a800" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10 page-enter">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #e8a800, #c48a00)', boxShadow: '0 12px 40px rgba(232,168,0,0.3)' }}>
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-display text-4xl font-bold text-amber-100 tracking-tight">PawnTech</h1>
          <p className="text-ink-400 mt-2 text-sm font-light tracking-wide">ระบบรับจำนำมือถือ</p>
        </div>

        {/* Card */}
        <div className="glass-card gold-border glow-gold p-8 page-enter stagger-1">
          <h2 className="text-lg font-semibold text-ink-100 mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm"
                 style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-2 tracking-wider uppercase">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="username"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm text-ink-100 placeholder-ink-600 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,168,0,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-400 mb-2 tracking-wider uppercase">รหัสผ่าน</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-ink-100 placeholder-ink-600 focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,168,0,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3 px-6 rounded-xl text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink-900/40 border-t-ink-900 rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </span>
              ) : '🔐 เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5">
            <p className="text-xs text-ink-600 text-center">
              ทดสอบ: <code className="text-ink-400 bg-white/5 px-1.5 py-0.5 rounded">admin</code> / <code className="text-ink-400 bg-white/5 px-1.5 py-0.5 rounded">Admin@1234</code>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ink-700 mt-8">
          PawnTech v1.0 · Secure System
        </p>
      </div>
    </div>
  )
}
