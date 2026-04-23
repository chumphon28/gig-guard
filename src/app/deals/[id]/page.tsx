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
      <Header userName={userProfile?.name} isAdmin={userProfile?.is_admin} />

      {/* Page hero */}
      <div className="brand-gradient pt-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-2 text-[12px] text-white/60 mb-3">
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-white font-semibold truncate max-w-[200px]">{d.title}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] md:text-[26px] font-extrabold text-white leading-tight">{d.title}</h1>
              <div className="mt-2">
                <StatusPill status={d.status} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">มูลค่ารวม</p>
              <p className="text-[22px] font-extrabold text-white">{formatCurrency(d.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 md:px-6 max-w-[1280px] mx-auto mt-6">
        {/* Stepper */}
        <div className="mb-6">
          <EscrowStepper status={d.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: deal info */}
          <div className="md:col-span-7 space-y-4">
            {/* Amount breakdown */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
              <h3 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">รายละเอียดราคา</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">ยอดรวม</p>
                  <p className="text-[18px] font-extrabold text-on-surface mt-1">{formatCurrency(d.total_amount)}</p>
                </div>
                <div className="bg-secondary-container rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-on-secondary-container uppercase tracking-wider">มัดจำ {d.deposit_percent}%</p>
                  <p className="text-[18px] font-extrabold text-on-secondary-container mt-1">{formatCurrency(d.deposit_amount)}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 text-center">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">ที่เหลือ</p>
                  <p className="text-[18px] font-extrabold text-on-surface mt-1">{formatCurrency(d.remaining_amount)}</p>
                </div>
              </div>
              {d.description && (
                <p className="text-[14px] text-on-surface-variant mt-4 pt-4 border-t border-outline-variant">{d.description}</p>
              )}
            </div>

            {/* Deal ID + share link */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Deal ID</p>
                  <p className="font-mono text-[13px] text-on-surface">{d.id.toUpperCase()}</p>
                </div>
                {role === 'seller' && d.status === 'created' && (
                  <CopyLinkButton dealId={d.id} />
                )}
              </div>
            </div>

            {/* Seller profile */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
              <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 brand-gradient rounded-xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <div>
                  <Link href={`/profile/${d.seller_id}`} className="font-bold text-on-surface hover:text-primary transition-colors">
                    {d.seller?.name || 'Unknown'}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
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
              <div className="bg-white border border-secondary/30 rounded-2xl p-5 shadow-card">
                <h3 className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  ข้อมูลบัญชีโอนเงิน
                </h3>
                <div className="space-y-2.5 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ธนาคาร</span>
                    <span className="font-bold text-on-surface">{d.seller_bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">เลขบัญชี</span>
                    <span className="font-bold font-mono text-on-surface">{d.seller_account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">ชื่อบัญชี</span>
                    <span className="font-bold text-on-surface">{d.seller_account_name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking info */}
            {d.tracking_info && (
              <div className="bg-tertiary-container rounded-2xl p-5">
                <h3 className="text-[11px] font-bold text-on-tertiary-container uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  ข้อมูลการจัดส่ง
                </h3>
                <p className="text-on-tertiary-container font-mono text-[14px]">{d.tracking_info}</p>
              </div>
            )}

            {/* Dispute info */}
            {d.dispute && (
              <div className="bg-error-container rounded-2xl p-5">
                <h3 className="text-[11px] font-bold text-on-error-container uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  ข้อพิพาท
                </h3>
                <p className="text-on-error-container text-[14px] mb-2">{d.dispute.reason}</p>
                {d.dispute.evidence_url && (
                  <a href={d.dispute.evidence_url} target="_blank" rel="noopener noreferrer" className="text-[13px] underline text-on-error-container">
                    ดูหลักฐาน
                  </a>
                )}
                {d.dispute.verdict && (
                  <div className="mt-3 font-bold text-[14px] text-on-error-container">
                    ผลตัดสิน: {d.dispute.verdict === 'refund_buyer' ? 'คืนเงิน Buyer' : 'ปลดให้ Seller'}
                  </div>
                )}
              </div>
            )}

            {/* Review */}
            {d.review && (
              <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
                <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">รีวิว</h3>
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
