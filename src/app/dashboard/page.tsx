import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import DealCard from '@/components/DealCard'
import { formatCurrency } from '@/lib/deal-utils'
import type { Deal } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: allDeals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('deals')
      .select('*, seller:profiles!deals_seller_id_fkey(*), buyer:profiles!deals_buyer_id_fkey(*)')
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
      .order('created_at', { ascending: false }),
  ])

  if (profile?.is_admin) redirect('/admin')

  const deals = (allDeals ?? []) as Deal[]
  const sellerDeals = deals.filter(d => d.seller_id === user.id)
  const buyerDeals = deals.filter(d => d.buyer_id === user.id)
  const activeDeals = deals.filter(d => !['completed', 'cancelled'].includes(d.status))
  const completedDeals = deals.filter(d => d.status === 'completed')
  const totalValue = deals.reduce((sum, d) => sum + Number(d.total_amount), 0)

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header userName={profile?.name} isAdmin={profile?.is_admin} />

      <main className="pt-20 px-4 md:px-6 max-w-[1280px] mx-auto">
        {/* Stats bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Active Deals</p>
            <p className="text-[32px] font-bold text-on-surface mt-1">{activeDeals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">เสร็จสิ้น</p>
            <p className="text-[32px] font-bold text-secondary mt-1">{completedDeals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">มูลค่ารวม</p>
            <p className="text-[24px] font-bold text-on-surface mt-1">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-primary-container rounded-2xl p-5 shadow-sm">
            <p className="text-[12px] font-semibold text-on-primary-container uppercase tracking-wider">ยินดีต้อนรับ</p>
            <p className="text-[18px] font-bold text-on-primary-container mt-1 truncate">{profile?.name || 'User'}</p>
          </div>
        </div>

        {/* Seller Deals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] font-semibold text-on-surface">
              <span className="material-symbols-outlined text-[22px] align-middle mr-2">storefront</span>
              ฉันเป็น Seller ({sellerDeals.length})
            </h2>
            <Link
              href="/deals/new"
              className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              สร้าง Deal
            </Link>
          </div>
          {sellerDeals.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-2xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">handshake</span>
              <p className="font-semibold">ยังไม่มี Deal ที่คุณสร้าง</p>
              <Link href="/deals/new" className="text-secondary font-semibold text-[14px] mt-2 block hover:underline">
                + สร้าง Deal แรกของคุณ
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sellerDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} role="seller" />
              ))}
            </div>
          )}
        </section>

        {/* Buyer Deals */}
        <section>
          <h2 className="text-[24px] font-semibold text-on-surface mb-4">
            <span className="material-symbols-outlined text-[22px] align-middle mr-2">shopping_bag</span>
            ฉันเป็น Buyer ({buyerDeals.length})
          </h2>
          {buyerDeals.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-2xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline mb-3 block">receipt_long</span>
              <p className="font-semibold">ยังไม่มี Deal ที่คุณเข้าร่วม</p>
            </div>
          ) : (
            <div className="space-y-3">
              {buyerDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} role="buyer" />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
