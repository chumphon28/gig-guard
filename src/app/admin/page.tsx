import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import StatusPill from '@/components/StatusPill'
import { formatCurrency, STATUS_LABELS } from '@/lib/deal-utils'
import type { DealStatus } from '@/lib/types'

export const revalidate = 0

const STATUS_ORDER: DealStatus[] = [
  'disputed', 'releasing_deposit', 'shipped', 'confirmed',
  'pending_confirmation', 'awaiting_deposit', 'created', 'completed', 'cancelled',
]

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const [{ data: allDeals }, { data: txRows }] = await Promise.all([
    supabase
      .from('deals')
      .select('*, seller:profiles!deals_seller_id_fkey(*), buyer:profiles!deals_buyer_id_fkey(*), dispute:disputes(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('escrow_transactions')
      .select('*, deal:deals(id, title)')
      .order('created_at', { ascending: false }),
  ])

  const deals = allDeals ?? []
  const txs = txRows ?? []

  const depositIn = txs.filter(t => t.type === 'deposit_in').reduce((s, t) => s + Number(t.amount), 0)
  const depositOut = txs.filter(t => t.type === 'deposit_out').reduce((s, t) => s + Number(t.amount), 0)
  const remainingIn = txs.filter(t => t.type === 'remaining_in').reduce((s, t) => s + Number(t.amount), 0)
  const remainingOut = txs.filter(t => t.type === 'remaining_out').reduce((s, t) => s + Number(t.amount), 0)
  const escrowBalance = (depositIn - depositOut) + (remainingIn - remainingOut)

  const activeDeals = deals.filter(d => !['completed', 'cancelled'].includes(d.status))
  const completedDeals = deals.filter(d => d.status === 'completed')
  const disputedDeals = deals.filter(d => d.status === 'disputed')
  const totalValue = deals.reduce((s, d) => s + Number(d.total_amount), 0)

  const byStatus = STATUS_ORDER.map(s => ({
    status: s,
    deals: deals.filter(d => d.status === s),
  })).filter(g => g.deals.length > 0)

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header userName={profile.name} isAdmin />

      {/* Page hero */}
      <div className="brand-gradient pt-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
          <p className="text-white/70 text-[12px] font-bold uppercase tracking-widest mb-1">Admin Panel</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-extrabold text-white">GigGuard Report</h1>
              <p className="text-white/70 text-[14px] mt-1">ภาพรวมระบบ GigGuard DAO</p>
            </div>
            <Link
              href="/admin/disputes"
              className="flex items-center gap-2 bg-error text-on-error px-4 py-2.5 rounded-xl font-bold text-[13px] hover:opacity-90 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              ตัดสินข้อพิพาท
              {disputedDeals.length > 0 && (
                <span className="bg-white text-error rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold">
                  {disputedDeals.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <main className="px-4 md:px-6 max-w-[1280px] mx-auto mt-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Deal ทั้งหมด</p>
            <p className="text-[30px] font-extrabold text-on-surface mt-1">{deals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Active</p>
            <p className="text-[30px] font-extrabold text-primary mt-1">{activeDeals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">เสร็จสิ้น</p>
            <p className="text-[30px] font-extrabold text-secondary mt-1">{completedDeals.length}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-card ${disputedDeals.length > 0 ? 'bg-error-container border border-error/20' : 'bg-white border border-outline-variant'}`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider ${disputedDeals.length > 0 ? 'text-on-error-container' : 'text-on-surface-variant'}`}>
              ข้อพิพาท
            </p>
            <p className={`text-[30px] font-extrabold mt-1 ${disputedDeals.length > 0 ? 'text-error' : 'text-on-surface'}`}>
              {disputedDeals.length}
            </p>
          </div>
          <div className="bg-tertiary-container rounded-2xl p-5 shadow-card col-span-2 md:col-span-1 border border-tertiary/10">
            <p className="text-[11px] font-bold text-on-tertiary-container uppercase tracking-wider">เงิน Escrow</p>
            <p className="text-[20px] font-extrabold text-on-tertiary-container mt-1">{formatCurrency(escrowBalance)}</p>
          </div>
        </div>

        {/* Escrow breakdown */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card mb-6">
          <h2 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            สรุป Escrow
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'มัดจำเข้าระบบ', value: depositIn, color: 'text-secondary' },
              { label: 'มัดจำโอนให้ Seller', value: depositOut, color: 'text-primary' },
              { label: 'ยอดที่เหลือเข้า', value: remainingIn, color: 'text-secondary' },
              { label: 'ยอดที่เหลือออก', value: remainingOut, color: 'text-primary' },
            ].map(item => (
              <div key={item.label} className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                <p className={`text-[16px] font-extrabold ${item.color} mt-1`}>{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-on-surface">คงเหลือในระบบ</p>
              <p className="text-[18px] font-extrabold text-tertiary">{formatCurrency(escrowBalance)}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold text-on-surface">มูลค่ารวม</p>
              <p className="text-[18px] font-extrabold text-on-surface">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <h2 className="text-[18px] font-extrabold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">receipt_long</span>
          Escrow Transactions ({txs.length})
        </h2>
        <div className="bg-white border border-outline-variant rounded-2xl shadow-card mb-8 overflow-hidden">
          {txs.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">ยังไม่มี Transaction</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container">
                    <th className="text-left px-5 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">เวลา</th>
                    <th className="text-left px-5 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">ประเภท</th>
                    <th className="text-left px-5 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">Deal</th>
                    <th className="text-left px-5 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">รายละเอียด</th>
                    <th className="text-right px-5 py-3 font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">จำนวน</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx: any) => {
                    const isIn = tx.type === 'deposit_in' || tx.type === 'remaining_in'
                    const typeLabel: Record<string, string> = {
                      deposit_in: 'มัดจำเข้า',
                      deposit_out: 'มัดจำออก',
                      remaining_in: 'ยอดเหลือเข้า',
                      remaining_out: 'ยอดเหลือออก',
                    }
                    return (
                      <tr key={tx.id} className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                        <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isIn ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-primary'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{isIn ? 'arrow_downward' : 'arrow_upward'}</span>
                            {typeLabel[tx.type] ?? tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {tx.deal ? (
                            <Link href={`/deals/${tx.deal.id}`} className="hover:text-primary hover:underline font-semibold text-on-surface truncate max-w-[200px] block">
                              {tx.deal.title}
                            </Link>
                          ) : (
                            <span className="text-on-surface-variant font-mono text-[11px]">{tx.deal_id?.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-on-surface-variant">{tx.description}</td>
                        <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${isIn ? 'text-secondary' : 'text-on-surface'}`}>
                          {isIn ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All deals by status */}
        <h2 className="text-[18px] font-extrabold text-on-surface mb-4">Deal ทั้งหมด ({deals.length})</h2>
        <div className="space-y-6">
          {byStatus.map(({ status, deals: groupDeals }) => (
            <section key={status}>
              <div className="flex items-center gap-2 mb-3">
                <StatusPill status={status as DealStatus} />
                <span className="text-[12px] text-on-surface-variant font-bold">({groupDeals.length})</span>
              </div>
              <div className="space-y-3">
                {groupDeals.map((deal: any) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-card hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{deal.title}</p>
                          <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">#{deal.id.slice(0, 8).toUpperCase()}</p>
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-on-surface-variant">
                            <span>Seller: <span className="font-bold text-on-surface">{deal.seller?.name || '-'}</span></span>
                            <span>·</span>
                            <span>Buyer: <span className="font-bold text-on-surface">{deal.buyer?.name || '(รอ Buyer)'}</span></span>
                          </div>
                          {deal.dispute && (
                            <p className="text-[12px] text-error mt-1 truncate font-semibold">⚠ {deal.dispute.reason}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-extrabold text-[16px] text-on-surface">{formatCurrency(deal.total_amount)}</p>
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            {new Date(deal.created_at).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
          {deals.length === 0 && (
            <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center text-on-surface-variant">
              ยังไม่มี Deal ในระบบ
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
