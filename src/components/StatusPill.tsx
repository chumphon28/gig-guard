import { STATUS_LABELS, STATUS_STYLES } from '@/lib/deal-utils'
import type { DealStatus } from '@/lib/types'

export default function StatusPill({ status }: { status: DealStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
