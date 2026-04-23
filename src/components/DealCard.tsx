import Link from 'next/link'
import StatusPill from './StatusPill'
import { formatCurrency } from '@/lib/deal-utils'
import type { Deal } from '@/lib/types'

export default function DealCard({ deal, role }: { deal: Deal; role: 'seller' | 'buyer' }) {
  return (
    <div className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/deals/${deal.id}`}>
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant">handshake</span>
            </div>
            <div>
              <h4 className="font-semibold text-[14px] text-on-surface">{deal.title}</h4>
              <p className="text-[12px] text-outline mt-0.5">
                Deal #{deal.id.slice(0, 8).toUpperCase()} •{' '}
                {role === 'seller' ? 'คุณเป็น Seller' : 'คุณเป็น Buyer'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-[18px] text-on-surface">{formatCurrency(deal.total_amount)}</p>
              <div className="mt-1">
                <StatusPill status={deal.status} />
              </div>
            </div>
            <span className="material-symbols-outlined text-outline">chevron_right</span>
          </div>
        </div>
      </Link>
    </div>
  )
}
