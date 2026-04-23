'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { formatCurrency } from '@/lib/deal-utils'
import { createClient } from '@/lib/supabase/client'

export default function NewDealPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.user.id).single()
      setUserName(profile?.name || '')
    })
  }, [router])

  const feeAmount = totalAmount ? Math.round(Number(totalAmount) * 1) / 100 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        total_amount: Number(totalAmount),
        deposit_percent: 100,
        seller_bank_name: bankName,
        seller_account_number: accountNumber,
        seller_account_name: accountName,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    } else {
      setCreatedId(data.id)
      setLoading(false)
    }
  }

  function copyLink() {
    const link = `${window.location.origin}/deals/${createdId}/join`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (createdId) {
    const link = typeof window !== 'undefined' ? `${window.location.origin}/deals/${createdId}/join` : ''
    return (
      <div className="min-h-screen bg-background">
        <Header userName={userName} />
        <main className="pt-24 px-4 max-w-lg mx-auto">
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-secondary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-[24px] font-bold text-on-surface mb-2">สร้าง Deal สำเร็จ!</h2>
            <p className="text-on-surface-variant mb-6">ส่งลิงก์นี้ให้ Buyer เพื่อเข้าร่วม Deal</p>
            <div className="bg-surface-container rounded-xl p-4 mb-4 text-[14px] font-mono text-on-surface break-all">
              {link}
            </div>
            <button
              onClick={copyLink}
              className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
            </button>
            <button
              onClick={() => router.push(`/deals/${createdId}`)}
              className="w-full mt-3 border border-outline text-on-surface py-3 rounded-xl font-semibold hover:bg-surface-container transition-all"
            >
              ดู Deal
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header userName={userName} />
      <main className="pt-24 px-4 md:px-6 max-w-[1280px] mx-auto">
        <h1 className="text-[32px] font-bold text-on-surface mb-8">สร้าง Escrow Deal</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form */}
          <div className="md:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px]">
                  {error}
                </div>
              )}

              {/* Section 1 */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <h3 className="text-[18px] font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">description</span>
                  ชื่อและรายละเอียด
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">ชื่อรายการ *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="เช่น ขายรถมือสอง Toyota Yaris 2020"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">รายละเอียด (ไม่บังคับ)</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      placeholder="รายละเอียดเพิ่มเติม..."
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <h3 className="text-[18px] font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                  ราคา
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">ยอดรวมทั้งหมด (บาท) *</label>
                    <input
                      type="number"
                      value={totalAmount}
                      onChange={e => setTotalAmount(e.target.value)}
                      required
                      min="1"
                      placeholder="0.00"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div className="bg-tertiary-container rounded-xl p-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">wallet</span>
                    <p className="text-[13px] text-on-tertiary-container font-semibold">
                      Buyer จะโอนเงินเต็มจำนวน 100% เข้ากระเป๋ากลางก่อน จากนั้นระบบโอนให้ผู้ขายเมื่อ Buyer ยืนยันรับของ
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <h3 className="text-[18px] font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                  ข้อมูลบัญชีรับโอน
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">ธนาคาร *</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      required
                      placeholder="เช่น กสิกรไทย, SCB, กรุงเทพ"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">เลขบัญชี *</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={e => setAccountNumber(e.target.value)}
                      required
                      placeholder="xxx-x-xxxxx-x"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-on-surface mb-2">ชื่อบัญชี *</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      required
                      placeholder="ชื่อเจ้าของบัญชี"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">link</span>
                {loading ? 'กำลังสร้าง...' : 'สร้าง Deal และรับ Link'}
              </button>
            </form>
          </div>

          {/* Summary sticky */}
          <div className="md:col-span-5">
            <div className="sticky top-24 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-[18px] font-semibold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">receipt</span>
                สรุป
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="text-on-surface-variant">ยอดรวม</span>
                  <span className="font-semibold text-on-surface">{formatCurrency(Number(totalAmount) || 0)}</span>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">wallet</span>
                    เข้ากระเป๋ากลาง (100%)
                  </span>
                  <span className="font-semibold text-secondary">{formatCurrency(Number(totalAmount) || 0)}</span>
                </div>
                <div className="border-t border-outline-variant pt-3 flex justify-between text-[14px]">
                  <span className="text-on-surface-variant">Fee GigGuard (1%)</span>
                  <span className="text-outline">{formatCurrency(feeAmount)}</span>
                </div>
              </div>

              <div className="mt-6 bg-surface-container rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-[13px] text-on-surface-variant">
                    ระบบนี้เป็นแค่ตัวกลางบันทึกสถานะ การโอนเงินจริงทำผ่านบัญชีธนาคารที่ระบุ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
