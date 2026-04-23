import { STATUS_LABELS, STATUS_STYLES } from '@/lib/deal-utils'
import type { DealStatus } from '@/lib/types'

export default function StatusPill({ status }: { status: DealStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
