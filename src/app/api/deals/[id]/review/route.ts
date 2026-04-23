import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: deal } = await supabase
    .from('deals')
    .select('id, seller_id, buyer_id, status')
    .eq('id', params.id)
    .single()

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  if (deal.buyer_id !== user.id) return NextResponse.json({ error: 'เฉพาะ Buyer เท่านั้น' }, { status: 403 })
  if (deal.status !== 'completed') return NextResponse.json({ error: 'Deal ยังไม่เสร็จสิ้น' }, { status: 400 })

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('deal_id', params.id)
    .single()

  if (existing) return NextResponse.json({ error: 'รีวิว Deal นี้แล้ว' }, { status: 400 })

  const { rating, comment } = await request.json()
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'rating ต้องอยู่ระหว่าง 1-5' }, { status: 400 })

  const { error } = await supabase
    .from('reviews')
    .insert({
      deal_id: params.id,
      reviewer_id: user.id,
      reviewee_id: deal.seller_id,
      rating,
      comment: comment || null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
