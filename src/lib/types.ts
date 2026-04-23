export type DealStatus =
  | 'created'
  | 'awaiting_deposit'
  | 'pending_confirmation'
  | 'confirmed'
  | 'shipped'
  | 'releasing_deposit'
  | 'completed'
  | 'disputed'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'fully_paid'

export interface Profile {
  id: string
  name: string
  completed_deals_as_seller: number
  avg_rating_as_seller: number
  is_admin: boolean
  created_at: string
}

export interface Deal {
  id: string
  seller_id: string
  buyer_id: string | null
  title: string
  description: string | null
  total_amount: number
  deposit_percent: number
  deposit_amount: number
  remaining_amount: number
  fee_amount: number
  payment_status: PaymentStatus
  status: DealStatus
  seller_bank_name: string
  seller_account_number: string
  seller_account_name: string
  tracking_info: string | null
  created_at: string
  updated_at: string
  seller?: Profile
  buyer?: Profile
  dispute?: Dispute
  review?: Review
}

export interface Dispute {
  id: string
  deal_id: string
  reason: string
  evidence_url: string | null
  verdict: 'refund_buyer' | 'release_seller' | null
  created_at: string
  resolved_at: string | null
}

export interface EscrowTransaction {
  id: string
  deal_id: string
  type: 'deposit_in' | 'deposit_out' | 'remaining_in' | 'remaining_out'
  amount: number
  description: string
  created_at: string
}

export interface Review {
  id: string
  deal_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
}
