'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span
              className="material-symbols-outlined text-white text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-on-surface">GigGuard DAO</h1>
          <p className="text-on-surface-variant mt-1">The Trust Layer for P2P Transactions</p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
          <h2 className="text-[24px] font-semibold text-on-surface mb-6">สมัครสมาชิก</h2>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-4 text-[14px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[14px] font-semibold text-on-surface mb-2">ชื่อ</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="ชื่อของคุณ"
              />
            </div>
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
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="text-center text-[14px] text-on-surface-variant mt-6">
            มีบัญชีแล้ว?{' '}
            <Link href="/login" className="text-secondary font-semibold hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
