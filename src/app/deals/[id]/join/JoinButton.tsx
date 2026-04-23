'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinButton({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/deals/${dealId}/join`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    } else {
      router.push(`/deals/${dealId}`)
      router.refresh()
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-3 text-[14px]">
          {error}
        </div>
      )}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">handshake</span>
        {loading ? 'กำลังเข้าร่วม...' : 'เข้าร่วม Deal นี้'}
      </button>
    </div>
  )
}
