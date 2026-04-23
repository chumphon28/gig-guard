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

  const [{ data: allDeals }, { data: txRows, error: txError }] = await Promise.all([
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
  const txTableMissing = txError?.code === '42P01'

  // Escrow balance = deposit_in - deposit_out (deposits still held by system)
  const depositIn = txs.filter(t => t.type === 'deposit_in').reduce((s, t) => s + Number(t.amount), 0)
  const depositOut = txs.filter(t => t.type === 'deposit_out').reduce((s, t) => s + Number(t.amount), 0)
  const remainingIn = txs.filter(t => t.type === 'remaining_in').reduce((s, t) => s + Number(t.amount), 0)
  const remainingOut = txs.filter(t => t.type === 'remaining_out').reduce((s, t) => s + Number(t.amount), 0)
  const escrowBalance = (depositIn - depositOut) + (remainingIn - remainingOut)

  const activeDeals = deals.filter(d => !['completed', 'cancelled'].includes(d.status))
  const completedDeals = deals.filter(d => d.status === 'completed')
  const disputedDeals = deals.filter(d => d.status === 'disputed')
  const totalValue = deals.reduce((s, d) => s + Number(d.total_amount), 0)

  // Group by status for the breakdown
  const byStatus = STATUS_ORDER.map(s => ({
    status: s,
    deals: deals.filter(d => d.status === s),
  })).filter(g => g.deals.length > 0)

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header userName={profile.name} isAdmin />

      <main className="pt-20 px-4 md:px-6 max-w-[1280px] mx-auto mt-6">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-[32px] text-error">admin_panel_settings</span>
          <div>
            <h1 className="text-[28px] font-bold text-on-surface">Admin Report</h1>
            <p className="text-on-surface-variant text-[14px]">ภาพรวมระบบ GigGuard DAO</p>
          </div>
          <Link
            href="/admin/disputes"
            className="ml-auto flex items-center gap-2 bg-error text-on-error px-4 py-2 rounded-xl font-semibold text-[14px] hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            ตัดสินข้อพิพาท
            {disputedDeals.length > 0 && (
              <span className="bg-white text-error rounded-full w-5 h-5 flex items-center justify-center text-[12px] font-bold">
                {disputedDeals.length}
              </span>
            )}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Deal ทั้งหมด</p>
            <p className="text-[32px] font-bold text-on-surface mt-1">{deals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Active</p>
            <p className="text-[32px] font-bold text-primary mt-1">{activeDeals.length}</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">เสร็จสิ้น</p>
            <p className="text-[32px] font-bold text-secondary mt-1">{completedDeals.length}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-sm ${disputedDeals.length > 0 ? 'bg-error-container' : 'bg-white border border-outline-variant'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${disputedDeals.length > 0 ? 'text-on-error-container' : 'text-on-surface-variant'}`}>
              ข้อพิพาท
            </p>
            <p className={`text-[32px] font-bold mt-1 ${disputedDeals.length > 0 ? 'text-error' : 'text-on-surface'}`}>
              {disputedDeals.length}
            </p>
          </div>
          <div className="bg-tertiary-container rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
            <p className="text-[11px] font-semibold text-on-tertiary-container uppercase tracking-wider">เงิน Escrow ในระบบ</p>
            <p className="text-[22px] font-bold text-on-tertiary-container mt-1">{formatCurrency(escrowBalance)}</p>
          </div>
        </div>

        {/* Escrow breakdown */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm mb-8">
          <h2 className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">wallet</span>
            สรุปกระเป๋ากลาง
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary-container rounded-xl p-4">
              <p className="text-[11px] text-on-secondary-container font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                เงินเข้ากระเป๋ากลาง
              </p>
              <p className="text-[22px] font-bold text-on-secondary-container mt-1">{formatCurrency(depositIn)}</p>
              <p className="text-[11px] text-on-secondary-container/70 mt-1">{txs.filter((t: any) => t.type === 'deposit_in').length} รายการ</p>
            </div>
            <div className="bg-tertiary-container rounded-xl p-4">
              <p className="text-[11px] text-on-tertiary-container font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                โอนออกให้ Seller
              </p>
              <p className="text-[22px] font-bold text-on-tertiary-container mt-1">{formatCurrency(depositOut)}</p>
              <p className="text-[11px] text-on-tertiary-container/70 mt-1">{txs.filter((t: any) => t.type === 'deposit_out').length} รายการ</p>
            </div>
            <div className="bg-primary-container rounded-xl p-4">
              <p className="text-[11px] text-on-primary-container font-semibold uppercase tracking-wider">คงเหลือในกระเป๋ากลาง</p>
              <p className="text-[22px] font-bold text-on-primary-container mt-1">{formatCurrency(escrowBalance)}</p>
              <p className="text-[11px] text-on-primary-container/70 mt-1">มูลค่า Deal รวม {formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        {/* SQL not run yet warning */}
        {txTableMissing && (
          <div className="bg-error-container text-on-error-container rounded-2xl p-5 mb-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[22px] flex-shrink-0">warning</span>
            <div>
              <p className="font-bold mb-1">ตาราง escrow_transactions ยังไม่มีใน DB</p>
              <p className="text-[13px]">รัน <code className="bg-black/10 px-1 rounded">requirements/escrow_transactions.sql</code> ใน Supabase SQL Editor ก่อน</p>
            </div>
          </div>
        )}

        {/* All transactions */}
        <h2 className="text-[20px] font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          Escrow Transactions ({txs.length})
        </h2>
        <div className="bg-white border border-outline-variant rounded-2xl shadow-sm mb-10 overflow-hidden">
          {txTableMissing ? (
            <div className="p-10 text-center text-on-surface-variant">ยังไม่ได้สร้างตาราง — รัน SQL ก่อน</div>
          ) : txs.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">ยังไม่มี Transaction — เกิดขึ้นเมื่อ Deal ผ่านขั้นตอน pending_confirmation, releasing_deposit, completed</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container">
                    <th className="text-left px-5 py-3 font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">เวลา</th>
                    <th className="text-left px-5 py-3 font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">ประเภท</th>
                    <th className="text-left px-5 py-3 font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">Deal</th>
                    <th className="text-left px-5 py-3 font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">รายละเอียด</th>
                    <th className="text-right px-5 py-3 font-semibold text-on-surface-variant uppercase tracking-wider text-[11px]">จำนวน</th>
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
                      <tr key={tx.id} className="border-b border-outline-variant/50 hover:bg-surface-container/50 transition-colors">
                        <td className="px-5 py-3 text-on-surface-variant whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isIn
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-tertiary-container text-on-tertiary-container'
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{isIn ? 'arrow_downward' : 'arrow_upward'}</span>
                            {typeLabel[tx.type] ?? tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {tx.deal ? (
                            <Link href={`/deals/${tx.deal.id}`} className="hover:text-secondary hover:underline font-semibold text-on-surface truncate max-w-[200px] block">
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
        <h2 className="text-[20px] font-bold text-on-surface mb-4">Deal ทั้งหมด ({deals.length})</h2>
        <div className="space-y-8">
          {byStatus.map(({ status, deals: groupDeals }) => (
            <section key={status}>
              <div className="flex items-center gap-2 mb-3">
                <StatusPill status={status as DealStatus} />
                <span className="text-[13px] text-on-surface-variant font-semibold">({groupDeals.length})</span>
              </div>
              <div className="space-y-3">
                {groupDeals.map((deal: any) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-secondary hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{deal.title}</p>
                          <p className="text-[12px] font-mono text-on-surface-variant mt-0.5">#{deal.id.slice(0, 8).toUpperCase()}</p>
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-on-surface-variant">
                            <span>Seller: <span className="font-semibold text-on-surface">{deal.seller?.name || '-'}</span></span>
                            <span>·</span>
                            <span>Buyer: <span className="font-semibold text-on-surface">{deal.buyer?.name || <span className="italic">รอ Buyer</span>}</span></span>
                          </div>
                          {deal.dispute && (
                            <p className="text-[12px] text-error mt-1 truncate">⚠ {deal.dispute.reason}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[16px] text-on-surface">{formatCurrency(deal.total_amount)}</p>
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
