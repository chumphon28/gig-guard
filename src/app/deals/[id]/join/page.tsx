import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JoinButton from './JoinButton'
import { formatCurrency } from '@/lib/deal-utils'
import StatusPill from '@/components/StatusPill'

export default async function JoinDealPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: deal } = await supabase
    .from('deals')
    .select('*, seller:profiles!deals_seller_id_fkey(*)')
    .eq('id', params.id)
    .single()

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant">ไม่พบ Deal นี้</p>
          <Link href="/dashboard" className="text-secondary font-semibold mt-2 block">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  if (user && deal.buyer_id === user.id) redirect(`/deals/${params.id}`)

  const isSeller = user && deal.seller_id === user.id
  const canJoin = deal.status === 'created' && !deal.buyer_id
  const loginUrl = `/login?redirect=/deals/${params.id}/join`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
          </div>
          <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">GigGuard Escrow</p>
        </div>

        <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-[22px] font-bold text-on-surface leading-tight">{deal.title}</h2>
              <StatusPill status={deal.status} />
            </div>
            {deal.description && (
              <p className="text-[14px] text-on-surface-variant mb-4">{deal.description}</p>
            )}
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-on-surface-variant">ยอดรวม</span>
                <span className="font-bold text-on-surface">{formatCurrency(deal.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-on-surface-variant">มัดจำ ({deal.deposit_percent}%)</span>
                <span className="font-semibold text-secondary">{formatCurrency(deal.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-on-surface-variant">ยอดที่เหลือ</span>
                <span className="font-semibold text-on-surface">{formatCurrency(deal.remaining_amount)}</span>
              </div>
            </div>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-4 mb-6">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">person</span>
            </div>
            <div>
              <p className="text-[12px] text-on-surface-variant">Seller</p>
              <p className="font-semibold text-on-surface text-[14px]">{deal.seller?.name || 'Unknown'}</p>
            </div>
          </div>

          {isSeller ? (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px] text-center font-semibold">
              คุณเป็นผู้สร้าง Deal นี้
            </div>
          ) : !canJoin ? (
            <div className="bg-surface-container-high text-on-surface-variant rounded-xl px-4 py-3 text-[14px] text-center">
              Deal นี้ไม่เปิดรับ Buyer แล้ว
            </div>
          ) : !user ? (
            <Link
              href={loginUrl}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-[16px] hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">login</span>
              Login เพื่อเข้าร่วม Deal
            </Link>
          ) : (
            <JoinButton dealId={params.id} />
          )}
        </div>
      </div>
    </div>
  )
}
