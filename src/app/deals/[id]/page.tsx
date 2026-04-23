import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import EscrowStepper from '@/components/EscrowStepper'
import StatusPill from '@/components/StatusPill'
import VerifiedBadge from '@/components/VerifiedBadge'
import ReviewStars from '@/components/ReviewStars'
import ActionPanel from './ActionPanel'
import CopyLinkButton from './CopyLinkButton'
import { formatCurrency, getUserRole, isVerified } from '@/lib/deal-utils'
import type { Deal } from '@/lib/types'

export const revalidate = 0

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      seller:profiles!deals_seller_id_fkey(*),
      buyer:profiles!deals_buyer_id_fkey(*),
      dispute:disputes(*),
      review:reviews(*, reviewer:profiles!reviews_reviewer_id_fkey(*))
    `)
    .eq('id', params.id)
    .single()

  if (!deal) notFound()

  const d = deal as unknown as Deal

  let userProfile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    userProfile = data
  }

  const role = user ? getUserRole(d, user.id, userProfile?.is_admin ?? false) : 'guest'
  const sellerVerified = d.seller ? isVerified(d.seller) : false

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header userName={userProfile?.name} />

      <main className="pt-20 px-4 md:px-6 max-w-[1280px] mx-auto mt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-on-surface-variant mb-4">
          <Link href="/dashboard" className="hover:text-secondary">Dashboard</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface font-semibold truncate max-w-[200px]">{d.title}</span>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <EscrowStepper status={d.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: deal info */}
          <div className="md:col-span-7 space-y-5">
            {/* Hero card */}
            <div className="bg-primary-container rounded-2xl p-6 text-on-primary-container">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-[24px] font-bold leading-tight">{d.title}</h1>
                <StatusPill status={d.status} />
              </div>
              {d.description && (
                <p className="text-[14px] opacity-80 mb-4">{d.description}</p>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] opacity-60 uppercase tracking-wider font-semibold">ยอดรวม</p>
                  <p className="text-[20px] font-bold mt-1">{formatCurrency(d.total_amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] opacity-60 uppercase tracking-wider font-semibold">มัดจำ {d.deposit_percent}%</p>
                  <p className="text-[20px] font-bold mt-1 text-secondary-fixed-dim">{formatCurrency(d.deposit_amount)}</p>
                </div>
                <div>
                  <p className="text-[11px] opacity-60 uppercase tracking-wider font-semibold">ที่เหลือ</p>
                  <p className="text-[20px] font-bold mt-1">{formatCurrency(d.remaining_amount)}</p>
                </div>
              </div>
            </div>

            {/* Deal ID + share link */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Deal ID</p>
                  <p className="font-mono text-[14px] text-on-surface">{d.id.toUpperCase()}</p>
                </div>
                {role === 'seller' && d.status === 'created' && (
                  <CopyLinkButton dealId={d.id} />
                )}
              </div>
            </div>

            {/* Seller profile */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary-container">person</span>
                </div>
                <div>
                  <Link href={`/profile/${d.seller_id}`} className="font-semibold text-on-surface hover:text-secondary">
                    {d.seller?.name || 'Unknown'}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {sellerVerified && <VerifiedBadge />}
                    <span className="text-[12px] text-on-surface-variant">
                      {d.seller?.completed_deals_as_seller ?? 0} deals •{' '}
                      ⭐ {Number(d.seller?.avg_rating_as_seller ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank info — shown to buyer only */}
            {(role === 'buyer' || role === 'admin') && (
              <div className="bg-white border border-secondary rounded-2xl p-5 shadow-sm">
                <h3 className="text-[14px] font-semibold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  ข้อมูลบัญชีโอนเงิน
                </h3>
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ธนาคาร</span>
                    <span className="font-semibold text-on-surface">{d.seller_bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">เลขบัญชี</span>
                    <span className="font-semibold font-mono text-on-surface">{d.seller_account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ชื่อบัญชี</span>
                    <span className="font-semibold text-on-surface">{d.seller_account_name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking info — shown when shipped */}
            {d.tracking_info && (
              <div className="bg-tertiary-container rounded-2xl p-5">
                <h3 className="text-[14px] font-semibold text-on-tertiary-container uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  ข้อมูลการจัดส่ง
                </h3>
                <p className="text-on-tertiary-container font-mono">{d.tracking_info}</p>
              </div>
            )}

            {/* Dispute info */}
            {d.dispute && (
              <div className="bg-error-container rounded-2xl p-5">
                <h3 className="text-[14px] font-semibold text-on-error-container uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">gavel</span>
                  ข้อพิพาท
                </h3>
                <p className="text-on-error-container text-[14px] mb-2">{d.dispute.reason}</p>
                {d.dispute.evidence_url && (
                  <a href={d.dispute.evidence_url} target="_blank" rel="noopener noreferrer" className="text-[13px] underline text-on-error-container">
                    ดูหลักฐาน
                  </a>
                )}
                {d.dispute.verdict && (
                  <div className="mt-3 font-semibold text-[14px] text-on-error-container">
                    ผลตัดสิน: {d.dispute.verdict === 'refund_buyer' ? 'คืนเงิน Buyer' : 'ปลดให้ Seller'}
                  </div>
                )}
              </div>
            )}

            {/* Review */}
            {d.review && (
              <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
                <h3 className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">รีวิว</h3>
                <div className="flex items-center gap-2 mb-2">
                  <ReviewStars rating={d.review.rating} size={20} />
                  <span className="text-[13px] text-on-surface-variant">โดย {(d.review as any).reviewer?.name}</span>
                </div>
                {d.review.comment && <p className="text-[14px] text-on-surface">{d.review.comment}</p>}
              </div>
            )}
          </div>

          {/* Right: action panel */}
          <div className="md:col-span-5">
            <div className="sticky top-24">
              <ActionPanel deal={d} role={role} userId={user?.id} />
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
