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

      <main className="pt-16">
        {/* Hero banner */}
        <div className="brand-gradient">
          <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
            <p className="text-white/70 text-[13px] font-semibold uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-[26px] md:text-[30px] font-extrabold text-white">
              สวัสดี, {profile?.name || 'User'} 👋
            </h1>
            <p className="text-white/70 text-[14px] mt-1">จัดการ Escrow Deals ของคุณ</p>

            {/* Stat cards inside hero */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">Active</p>
                <p className="text-[28px] font-extrabold text-white mt-0.5">{activeDeals.length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">เสร็จสิ้น</p>
                <p className="text-[28px] font-extrabold text-secondary-fixed-dim mt-0.5">{completedDeals.length}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-wider">มูลค่ารวม</p>
                <p className="text-[18px] font-extrabold text-white mt-0.5 leading-tight">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
          {/* Seller Deals */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">storefront</span>
                </div>
                <h2 className="text-[18px] font-bold text-on-surface">
                  ฉันเป็น Seller
                  <span className="ml-2 px-2 py-0.5 bg-primary-container text-primary text-[12px] font-bold rounded-full">{sellerDeals.length}</span>
                </h2>
              </div>
              <Link
                href="/deals/new"
                className="flex items-center gap-1.5 green-gradient text-white px-4 py-2 rounded-full text-[13px] font-bold hover:opacity-90 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                สร้าง Deal
              </Link>
            </div>
            {sellerDeals.length === 0 ? (
              <div className="bg-white border border-outline-variant rounded-2xl p-10 text-center shadow-card">
                <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[36px] text-outline">handshake</span>
                </div>
                <p className="font-bold text-on-surface text-[16px]">ยังไม่มี Deal ที่คุณสร้าง</p>
                <p className="text-on-surface-variant text-[14px] mt-1 mb-4">เริ่มสร้าง Escrow Deal แรกของคุณได้เลย</p>
                <Link
                  href="/deals/new"
                  className="inline-flex items-center gap-1.5 green-gradient text-white px-5 py-2.5 rounded-full text-[14px] font-bold hover:opacity-90 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  สร้าง Deal แรก
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-secondary-container rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container text-[18px]">shopping_bag</span>
              </div>
              <h2 className="text-[18px] font-bold text-on-surface">
                ฉันเป็น Buyer
                <span className="ml-2 px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[12px] font-bold rounded-full">{buyerDeals.length}</span>
              </h2>
            </div>
            {buyerDeals.length === 0 ? (
              <div className="bg-white border border-outline-variant rounded-2xl p-10 text-center shadow-card">
                <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[36px] text-outline">receipt_long</span>
                </div>
                <p className="font-bold text-on-surface text-[16px]">ยังไม่มี Deal ที่คุณเข้าร่วม</p>
                <p className="text-on-surface-variant text-[14px] mt-1">รอรับลิงก์จาก Seller เพื่อเข้าร่วม Deal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {buyerDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} role="buyer" />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
