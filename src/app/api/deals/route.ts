import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { computeAmounts } from '@/lib/deal-utils'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('deals')
    .select('*, seller:profiles!deals_seller_id_fkey(*), buyer:profiles!deals_buyer_id_fkey(*)')
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, description, total_amount, deposit_percent, seller_bank_name, seller_account_number, seller_account_name } = body

  if (!title || !total_amount || !seller_bank_name || !seller_account_number || !seller_account_name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const pct = deposit_percent ?? 30
  const { depositAmount, remainingAmount, feeAmount } = computeAmounts(Number(total_amount), pct)

  const { data, error } = await supabase
    .from('deals')
    .insert({
      seller_id: user.id,
      title,
      description: description || null,
      total_amount: Number(total_amount),
      deposit_percent: pct,
      deposit_amount: depositAmount,
      remaining_amount: remainingAmount,
      fee_amount: feeAmount,
      payment_status: 'unpaid',
      status: 'created',
      seller_bank_name,
      seller_account_number,
      seller_account_name,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
