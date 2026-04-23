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
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="NONG POMz" className="h-60 w-auto mx-auto mb-2" />
          <p className="text-on-surface-variant mt-1">The Trust Layer for P2P Transactions</p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h2 className="text-[24px] font-semibold text-on-surface mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-4 text-[14px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="text-center text-[14px] text-on-surface-variant mt-6">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="text-secondary font-semibold hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
