import type { DealStatus } from '@/lib/types'

const STEPS: { key: DealStatus; label: string; icon: string }[] = [
  { key: 'created', label: 'สร้าง Deal', icon: 'description' },
  { key: 'awaiting_deposit', label: 'Buyer เข้าร่วม', icon: 'person_add' },
  { key: 'pending_confirmation', label: 'โอนเข้ากระเป๋ากลาง', icon: 'wallet' },
  { key: 'confirmed', label: 'ยืนยันแล้ว', icon: 'check_circle' },
  { key: 'shipped', label: 'จัดส่ง', icon: 'local_shipping' },
  { key: 'releasing_deposit', label: 'โอนเงินให้ผู้ขาย', icon: 'account_balance' },
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
    <div className="bg-white rounded-2xl border border-outline-variant p-6">
      <div className="relative flex justify-between items-start overflow-x-auto">
        <div className="absolute h-[2px] bg-slate-100 left-4 right-4 top-4 z-0" />
        {currentIdx > 0 && (
          <div
            className="absolute h-[2px] bg-secondary left-4 top-4 z-0 transition-all duration-500"
            style={{ width: `calc(${(currentIdx / (STEPS.length - 1)) * 100}% - 8px)` }}
          />
        )}
        {STEPS.map((step, i) => {
          const isDone = i < currentIdx
          const isCurrent = i === currentIdx
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 px-2 min-w-[60px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isDone ? 'bg-secondary text-white' : isCurrent ? 'bg-white border-4 border-secondary text-secondary shadow-sm' : 'bg-white border-2 border-slate-300 text-slate-400'}`}
              >
                {isDone ? (
                  <span
                    className="material-symbols-outlined text-[18px] text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold whitespace-nowrap text-center
                  ${isDone ? 'text-on-surface' : isCurrent ? 'text-secondary' : 'text-slate-400'}`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
      {status === 'disputed' && (
        <div className="mt-4 bg-error-container text-on-error-container rounded-xl px-4 py-3 text-[14px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">gavel</span>
          อยู่ระหว่างการพิจารณาข้อพิพาท
        </div>
      )}
      {status === 'cancelled' && (
        <div className="mt-4 bg-surface-container-high text-on-surface-variant rounded-xl px-4 py-3 text-[14px] font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">cancel</span>
          Deal ถูกยกเลิก
        </div>
      )}
    </div>
  )
}
