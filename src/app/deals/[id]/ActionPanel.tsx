'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReviewStars from '@/components/ReviewStars'
import { formatCurrency } from '@/lib/deal-utils'
import type { Deal } from '@/lib/types'

type Role = 'seller' | 'buyer' | 'admin' | 'guest'

export default function ActionPanel({
  deal,
  role,
  userId,
}: {
  deal: Deal
  role: Role
  userId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trackingInput, setTrackingInput] = useState('')
  const [showDispute, setShowDispute] = useState(false)
  const [showReview, setShowReview] = useState(false)

  async function transition(to: string, extra?: Record<string, unknown>) {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/deals/${deal.id}/transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, ...extra }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
    }
  }

  const { status } = deal

  return (
    <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-[16px] font-bold text-on-surface">
        {role === 'guest' ? 'ข้อมูล Deal' : role === 'admin' ? 'แผงผู้ดูแล' : 'การดำเนินการ'}
      </h3>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px]">
          {error}
        </div>
      )}

      {/* GUEST */}
      {role === 'guest' && deal.status === 'created' && !deal.buyer_id && (
        userId ? (
          <JoinDealButton dealId={deal.id} />
        ) : (
          <Link
            href={`/login?redirect=/deals/${deal.id}/join`}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">login</span>
            Login เพื่อเข้าร่วม Deal
          </Link>
        )
      )}
      {role === 'guest' && (deal.status !== 'created' || deal.buyer_id) && (
        <div className="bg-surface-container rounded-xl p-4 text-center text-[14px] text-on-surface-variant">
          Deal นี้ไม่เปิดรับ Buyer แล้ว
        </div>
      )}

      {/* SELLER: created — waiting for buyer */}
      {role === 'seller' && status === 'created' && (
        <div className="bg-surface-container rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant block mb-2">schedule</span>
          <p className="text-[14px] text-on-surface-variant font-semibold">รอ Buyer เข้าร่วม</p>
          <p className="text-[12px] text-outline mt-1">แชร์ลิงก์ด้านบนให้ Buyer</p>
        </div>
      )}

      {/* BUYER: awaiting_deposit — show bank info + confirm button */}
      {role === 'buyer' && status === 'awaiting_deposit' && (
        <div className="space-y-4">
          <div className="bg-tertiary-container rounded-xl p-4 flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">wallet</span>
            <p className="text-[13px] text-on-tertiary-container font-semibold">โอนเงินเต็มจำนวนเข้ากระเป๋ากลาง</p>
          </div>
          <div className="bg-secondary/10 border border-secondary rounded-xl p-4 space-y-2 text-[14px]">
            <div className="flex justify-between"><span className="text-on-surface-variant">ธนาคาร</span><span className="font-semibold">{deal.seller_bank_name}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">เลขบัญชี</span><span className="font-semibold font-mono">{deal.seller_account_number}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">ชื่อบัญชี</span><span className="font-semibold">{deal.seller_account_name}</span></div>
            <div className="flex justify-between border-t border-secondary/30 pt-2 mt-2">
              <span className="font-bold text-secondary">ยอดที่ต้องโอน (100%)</span>
              <span className="font-bold text-secondary text-[18px]">{formatCurrency(deal.total_amount)}</span>
            </div>
          </div>
          <button
            onClick={() => transition('pending_confirmation')}
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {loading ? 'กำลังดำเนินการ...' : 'ฉันโอนเงินเข้ากระเป๋ากลางแล้ว'}
          </button>
        </div>
      )}

      {/* SELLER: pending_confirmation */}
      {role === 'seller' && status === 'pending_confirmation' && (
        <div className="space-y-3">
          <div className="bg-error-container text-on-error-container rounded-xl p-4 text-[14px] font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            Buyer แจ้งว่าโอนมัดจำแล้ว
          </div>
          <button
            onClick={() => transition('confirmed')}
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">verified</span>
            {loading ? '...' : 'ยืนยันรับมัดจำ'}
          </button>
          <button
            onClick={() => transition('cancelled')}
            disabled={loading}
            className="w-full border border-error text-error py-3 rounded-xl font-semibold hover:bg-error-container transition-all disabled:opacity-60"
          >
            ยกเลิก Deal
          </button>
        </div>
      )}

      {/* SELLER: confirmed — fill tracking */}
      {role === 'seller' && status === 'confirmed' && (
        <div className="space-y-3">
          <div>
            <label className="block text-[14px] font-semibold text-on-surface mb-2">ข้อมูลการจัดส่ง / หมายเลขพัสดุ</label>
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              placeholder="เช่น TH123456789"
              className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <button
            onClick={() => transition('shipped', { tracking_info: trackingInput })}
            disabled={loading || !trackingInput}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">local_shipping</span>
            {loading ? '...' : 'ส่งแล้ว'}
          </button>
        </div>
      )}

      {/* BUYER: shipped */}
      {role === 'buyer' && status === 'shipped' && !showDispute && (
        <div className="space-y-3">
          <div className="bg-surface-container rounded-xl p-4 text-[14px]">
            <p className="font-semibold text-on-surface mb-1">ข้อมูลการจัดส่ง</p>
            <p className="font-mono text-on-surface-variant">{deal.tracking_info}</p>
          </div>
          <div className="bg-tertiary-container rounded-xl p-3 text-[13px] text-on-tertiary-container flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">wallet</span>
            เงิน {formatCurrency(deal.total_amount)} อยู่ในกระเป๋ากลาง รอคุณยืนยันรับของ
          </div>
          <button
            onClick={() => transition('releasing_deposit')}
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">lock_open</span>
            {loading ? '...' : 'ยืนยันรับของ — ปล่อยเงินให้ผู้ขาย'}
          </button>
          <button
            onClick={() => setShowDispute(true)}
            className="w-full border border-error text-error py-3 rounded-xl font-semibold hover:bg-error-container transition-all"
          >
            มีปัญหา / เปิด Dispute
          </button>
        </div>
      )}

      {/* BUYER: releasing_deposit */}
      {role === 'buyer' && status === 'releasing_deposit' && (
        <div className="bg-tertiary-container rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-[40px] text-on-tertiary-container block mb-2">wallet</span>
          <p className="text-[14px] font-semibold text-on-tertiary-container">ระบบกำลังโอนเงินให้ผู้ขาย</p>
          <p className="text-[12px] text-on-tertiary-container/70 mt-1">รอผู้ขายยืนยันรับเงิน {formatCurrency(deal.total_amount)}</p>
        </div>
      )}

      {/* SELLER: releasing_deposit */}
      {role === 'seller' && status === 'releasing_deposit' && (
        <div className="space-y-4">
          <div className="bg-tertiary-container rounded-xl p-4 text-[14px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">wallet</span>
              <p className="font-bold text-on-tertiary-container">กระเป๋ากลางโอนเงินให้คุณแล้ว</p>
            </div>
            <p className="text-on-tertiary-container/80">
              Buyer ยืนยันรับของแล้ว ระบบโอนเงิน {formatCurrency(deal.total_amount)} เข้าบัญชีของคุณ
            </p>
          </div>
          <button
            onClick={() => transition('completed')}
            disabled={loading}
            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            {loading ? '...' : 'รับเงินและปิด Deal'}
          </button>
        </div>
      )}

      {/* Dispute form */}
      {role === 'buyer' && status === 'shipped' && showDispute && (
        <DisputeForm dealId={deal.id} onCancel={() => setShowDispute(false)} />
      )}

      {/* BUYER: completed — show review form if not reviewed */}
      {role === 'buyer' && status === 'completed' && !deal.review && !showReview && (
        <div className="space-y-3">
          <div className="bg-secondary/10 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-secondary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <p className="font-semibold text-on-surface mt-2">Deal เสร็จสิ้น!</p>
          </div>
          <button
            onClick={() => setShowReview(true)}
            className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">star</span>
            รีวิว Seller
          </button>
        </div>
      )}

      {/* Review form */}
      {role === 'buyer' && showReview && (
        <ReviewForm dealId={deal.id} onDone={() => { setShowReview(false); router.refresh() }} />
      )}

      {/* Completed + already reviewed */}
      {role === 'buyer' && status === 'completed' && deal.review && (
        <div className="bg-secondary/10 rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-secondary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <p className="font-semibold text-on-surface mt-2">Deal เสร็จสิ้น และรีวิวแล้ว</p>
        </div>
      )}

      {/* Seller: completed */}
      {role === 'seller' && (status === 'completed' || status === 'cancelled') && (
        <div className={`rounded-xl p-4 text-center ${status === 'completed' ? 'bg-secondary/10' : 'bg-surface-container'}`}>
          <p className={`font-semibold ${status === 'completed' ? 'text-secondary' : 'text-on-surface-variant'}`}>
            {status === 'completed' ? '✓ Deal เสร็จสิ้น' : 'Deal ถูกยกเลิก'}
          </p>
        </div>
      )}

      {/* ADMIN: disputed */}
      {role === 'admin' && status === 'disputed' && (
        <AdminVerdictPanel dealId={deal.id} />
      )}
    </div>
  )
}

function JoinDealButton({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function join() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/deals/${dealId}/join`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'เกิดข้อผิดพลาด')
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 mb-3 text-[14px]">{error}</div>
      )}
      <button
        onClick={join}
        disabled={loading}
        className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">handshake</span>
        {loading ? 'กำลังเข้าร่วม...' : 'เข้าร่วม Deal นี้'}
      </button>
    </div>
  )
}

function DisputeForm({ dealId, onCancel }: { dealId: string; onCancel: () => void }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!reason) { setError('กรุณาระบุเหตุผล'); return }
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, evidence_url: evidenceUrl }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false) }
    else { router.refresh() }
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-on-surface">เปิดข้อพิพาท</h4>
      {error && <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px]">{error}</div>}
      <div>
        <label className="block text-[14px] font-semibold text-on-surface mb-1">เหตุผล *</label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-error resize-none"
          placeholder="อธิบายปัญหาที่เกิดขึ้น..."
        />
      </div>
      <div>
        <label className="block text-[14px] font-semibold text-on-surface mb-1">URL หลักฐาน (ไม่บังคับ)</label>
        <input
          type="url"
          value={evidenceUrl}
          onChange={e => setEvidenceUrl(e.target.value)}
          className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-error"
          placeholder="https://..."
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-error text-on-error py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
        >
          {loading ? '...' : 'ยืนยันเปิด Dispute'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-outline text-on-surface py-3 rounded-xl font-semibold hover:bg-surface-container transition-all"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  )
}

function ReviewForm({ dealId, onDone }: { dealId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false) }
    else onDone()
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-on-surface">รีวิว Seller</h4>
      {error && <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px]">{error}</div>}
      <div>
        <label className="block text-[14px] font-semibold text-on-surface mb-2">คะแนน</label>
        <ReviewStars rating={rating} onChange={setRating} size={32} />
      </div>
      <div>
        <label className="block text-[14px] font-semibold text-on-surface mb-1">ความคิดเห็น (ไม่บังคับ)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          className="w-full border border-outline-variant rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
          placeholder="แสดงความคิดเห็น..."
        />
      </div>
      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
      >
        {loading ? '...' : 'ส่งรีวิว'}
      </button>
    </div>
  )
}

function AdminVerdictPanel({ dealId }: { dealId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function verdict(v: 'refund_buyer' | 'release_seller') {
    setLoading(true)
    const res = await fetch(`/api/deals/${dealId}/verdict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict: v }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false) }
    else { router.refresh() }
  }

  return (
    <div className="space-y-3">
      <div className="bg-error-container rounded-xl p-3 text-[13px] text-on-error-container font-semibold">
        Admin: ตัดสินข้อพิพาท
      </div>
      {error && <div className="text-error text-[13px]">{error}</div>}
      <button
        onClick={() => verdict('refund_buyer')}
        disabled={loading}
        className="w-full bg-error text-on-error py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
      >
        คืนเงิน Buyer (ยกเลิก Deal)
      </button>
      <button
        onClick={() => verdict('release_seller')}
        disabled={loading}
        className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-60"
      >
        ปลดให้ Seller (Deal เสร็จสิ้น)
      </button>
    </div>
  )
}
