'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full brand-gradient opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span
              className="material-symbols-outlined text-white text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
          </div>
          <h1 className="text-[30px] font-extrabold tracking-tight text-on-surface">
            GigGuard<span className="text-primary"> DAO</span>
          </h1>
          <p className="text-on-surface-variant mt-1.5 text-[15px]">The Trust Layer for P2P Transactions</p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-card">
          <h2 className="text-[22px] font-bold text-on-surface mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-4 text-[14px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-surface-container-low"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-surface-container-low"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full brand-gradient text-white py-3.5 rounded-xl font-bold text-[15px] hover:opacity-90 transition-all disabled:opacity-60 mt-2 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="text-center text-[14px] text-on-surface-variant mt-6">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-primary font-bold hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
