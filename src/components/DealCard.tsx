import Link from 'next/link'
import StatusPill from './StatusPill'
import { formatCurrency } from '@/lib/deal-utils'
import type { Deal } from '@/lib/types'

export default function DealCard({ deal, role }: { deal: Deal; role: 'seller' | 'buyer' }) {
  return (
    <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden hover:shadow-card-hover hover:border-primary/20 transition-all duration-200">
      <Link href={`/deals/${deal.id}`}>
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 brand-gradient rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-on-surface">{deal.title}</h4>
              <p className="text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <span className="font-mono">{deal.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-outline">•</span>
                <span className={`font-semibold ${role === 'seller' ? 'text-primary' : 'text-secondary'}`}>
                  {role === 'seller' ? 'Seller' : 'Buyer'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-extrabold text-[18px] text-on-surface">{formatCurrency(deal.total_amount)}</p>
              <div className="mt-1.5">
                <StatusPill status={deal.status} />
              </div>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">chevron_right</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
