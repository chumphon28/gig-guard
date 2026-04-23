import type { DealStatus } from './types'

export const ALLOWED_TRANSITIONS: Record<
  DealStatus,
  { to: DealStatus; role: 'buyer' | 'seller' | 'admin'; paymentStatus?: string }[]
> = {
  created: [{ to: 'awaiting_deposit', role: 'buyer' }],
  awaiting_deposit: [{ to: 'pending_confirmation', role: 'buyer', paymentStatus: 'deposit_paid' }],
  pending_confirmation: [
    { to: 'confirmed', role: 'seller' },
    { to: 'cancelled', role: 'seller' },
  ],
  confirmed: [{ to: 'shipped', role: 'seller' }],
  shipped: [
    { to: 'completed', role: 'buyer', paymentStatus: 'fully_paid' },
    { to: 'disputed', role: 'buyer' },
  ],
  disputed: [
    { to: 'completed', role: 'admin', paymentStatus: 'fully_paid' },
    { to: 'cancelled', role: 'admin' },
  ],
  completed: [],
  cancelled: [],
}

export function getUserRole(
  deal: { seller_id: string; buyer_id: string | null },
  userId: string,
  isAdmin: boolean
): 'seller' | 'buyer' | 'admin' | 'guest' {
  if (isAdmin) return 'admin'
  if (deal.seller_id === userId) return 'seller'
  if (deal.buyer_id === userId) return 'buyer'
  return 'guest'
}

export function canTransition(
  currentStatus: DealStatus,
  targetStatus: DealStatus,
  role: 'buyer' | 'seller' | 'admin' | 'guest'
): boolean {
  if (role === 'guest') return false
  return ALLOWED_TRANSITIONS[currentStatus].some(
    t => t.to === targetStatus && t.role === role
  )
}

export function computeAmounts(totalAmount: number, depositPercent: number = 30) {
  const depositAmount = Math.round((totalAmount * depositPercent) / 100 * 100) / 100
  const remainingAmount = Math.round((totalAmount - depositAmount) * 100) / 100
  const feeAmount = Math.round(totalAmount * 1) / 100
  return { depositAmount, remainingAmount, feeAmount }
}

export function isVerified(profile: { completed_deals_as_seller: number; avg_rating_as_seller: number }) {
  return profile.completed_deals_as_seller >= 10 && Number(profile.avg_rating_as_seller) >= 4.0
}

export const STATUS_LABELS: Record<DealStatus, string> = {
  created: 'รอ Buyer',
  awaiting_deposit: 'รอมัดจำ',
  pending_confirmation: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  shipped: 'จัดส่งแล้ว',
  completed: 'เสร็จสิ้น',
  disputed: 'มีข้อพิพาท',
  cancelled: 'ยกเลิก',
}

export const STATUS_STYLES: Record<DealStatus, string> = {
  created: 'bg-surface-container-high text-on-surface-variant',
  awaiting_deposit: 'bg-surface-container-high text-on-surface-variant',
  pending_confirmation: 'bg-error-container text-on-error-container',
  confirmed: 'bg-secondary-container text-on-secondary-container',
  shipped: 'bg-on-tertiary-container text-white',
  completed: 'bg-secondary text-on-secondary',
  disputed: 'bg-error-container text-error',
  cancelled: 'bg-surface-container-high text-on-surface-variant',
}

export function formatCurrency(amount: number): string {
  return `฿${Number(amount).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
