import type { DealStatus } from '@/lib/types'

const STEPS: { key: DealStatus; label: string; icon: string }[] = [
  { key: 'created', label: 'สร้าง Deal', icon: 'description' },
  { key: 'awaiting_deposit', label: 'Buyer เข้าร่วม', icon: 'person_add' },
  { key: 'pending_confirmation', label: 'ส่งมัดจำ', icon: 'payments' },
  { key: 'confirmed', label: 'ยืนยันมัดจำ', icon: 'check_circle' },
  { key: 'shipped', label: 'จัดส่ง', icon: 'local_shipping' },
  { key: 'releasing_deposit', label: 'โอนเงิน', icon: 'account_balance' },
  { key: 'completed', label: 'เสร็จสิ้น', icon: 'lock_open' },
]

const STATUS_STEP_INDEX: Record<DealStatus, number> = {
  created: 0,
  awaiting_deposit: 1,
  pending_confirmation: 2,
  confirmed: 3,
  shipped: 4,
  releasing_deposit: 5,
  completed: 6,
  disputed: 4,
  cancelled: -1,
}

export default function EscrowStepper({ status }: { status: DealStatus }) {
  const currentIdx = STATUS_STEP_INDEX[status]

  return (
    <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-card">
      <div className="relative flex justify-between items-start overflow-x-auto">
        {/* Track bg */}
        <div className="absolute h-0.5 bg-outline-variant left-4 right-4 top-4 z-0" />
        {/* Track filled */}
        {currentIdx > 0 && (
          <div
            className="absolute h-0.5 brand-gradient left-4 top-4 z-0 transition-all duration-700"
            style={{ width: `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - 8px)` }}
          />
        )}
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx || (i === currentIdx && i === STEPS.length - 1)
          const isCurrent = i === currentIdx && i !== STEPS.length - 1
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 px-1 min-w-[52px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isDone
                    ? 'brand-gradient shadow-sm'
                    : isCurrent
                    ? 'bg-white border-2 border-primary shadow-md'
                    : 'bg-white border-2 border-outline-variant'
                  }`}
              >
                {isDone ? (
                  <span
                    className="material-symbols-outlined text-[16px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : (
                  <span className={`material-symbols-outlined text-[16px] ${isCurrent ? 'text-primary' : 'text-outline'}`}>
                    {step.icon}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-bold whitespace-nowrap text-center leading-tight
                  ${isDone ? 'text-on-surface' : isCurrent ? 'text-primary' : 'text-outline'}`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {status === 'disputed' && (
        <div className="mt-4 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
          อยู่ระหว่างการพิจารณาข้อพิพาท
        </div>
      )}
      {status === 'cancelled' && (
        <div className="mt-4 bg-surface-container text-on-surface-variant rounded-xl px-4 py-3 text-[13px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          Deal ถูกยกเลิก
        </div>
      )}
    </div>
  )
}
