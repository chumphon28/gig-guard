import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import StatusPill from '@/components/StatusPill'
import { formatCurrency } from '@/lib/deal-utils'

export const revalidate = 0

export default async function AdminDisputesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  const { data: disputedDeals } = await supabase
    .from('deals')
    .select(`
      *,
      seller:profiles!deals_seller_id_fkey(*),
      buyer:profiles!deals_buyer_id_fkey(*),
      dispute:disputes(*)
    `)
    .eq('status', 'disputed')
    .order('updated_at', { ascending: false })

  const deals = disputedDeals ?? []

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header userName={profile.name} isAdmin />

      <main className="pt-20 px-4 md:px-6 max-w-[1280px] mx-auto mt-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-error text-[32px]">gavel</span>
          <div>
            <h1 className="text-[32px] font-bold text-on-surface">ศูนย์ข้อพิพาท</h1>
            <p className="text-on-surface-variant text-[14px]">Admin Dispute Center</p>
          </div>
          <span className="ml-auto bg-error text-on-error px-4 py-2 rounded-full font-bold text-[14px]">
            {deals.length} รอตัดสิน
          </span>
        </div>

        {deals.length === 0 ? (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-[64px] text-outline block mb-4">verified</span>
            <p className="text-[18px] font-semibold text-on-surface">ไม่มีข้อพิพาทที่รอตัดสิน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal: any) => (
              <div key={deal.id} className="bg-white border border-error/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[18px] font-bold text-on-surface">{deal.title}</h3>
                      <StatusPill status={deal.status} />
                    </div>
                    <p className="text-[13px] text-on-surface-variant font-mono">#{deal.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <p className="font-bold text-[18px] text-on-surface flex-shrink-0">{formatCurrency(deal.total_amount)}</p>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface-container rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Seller</p>
                    <p className="font-semibold text-on-surface text-[14px]">{deal.seller?.name || 'Unknown'}</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Buyer</p>
                    <p className="font-semibold text-on-surface text-[14px]">{deal.buyer?.name || 'Unknown'}</p>
                  </div>
                </div>

                {/* Dispute reason */}
                {deal.dispute && (
                  <div className="bg-error-container rounded-xl p-4 mb-4">
                    <p className="text-[12px] font-semibold text-on-error-container uppercase tracking-wider mb-1">เหตุผลข้อพิพาท</p>
                    <p className="text-on-error-container text-[14px]">{deal.dispute.reason}</p>
                    {deal.dispute.evidence_url && (
                      <a href={deal.dispute.evidence_url} target="_blank" rel="noopener noreferrer"
                        className="text-[13px] underline text-on-error-container mt-2 block">
                        ดูหลักฐาน →
                      </a>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href={`/deals/${deal.id}`}
                    className="flex-1 border border-outline text-on-surface py-3 rounded-xl font-semibold text-center hover:bg-surface-container transition-all text-[14px]"
                  >
                    ดู Deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
