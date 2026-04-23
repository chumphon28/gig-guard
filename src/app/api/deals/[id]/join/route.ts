import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: deal, error: fetchError } = await supabase
    .from('deals')
    .select('id, seller_id, buyer_id, status')
    .eq('id', params.id)
    .single()

  if (fetchError || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  if (deal.seller_id === user.id) return NextResponse.json({ error: 'คุณเป็นผู้สร้าง Deal นี้' }, { status: 400 })
  if (deal.buyer_id) return NextResponse.json({ error: 'Deal นี้มี Buyer แล้ว' }, { status: 400 })
  if (deal.status !== 'created') return NextResponse.json({ error: 'Deal ไม่อยู่ในสถานะที่รับ Buyer ได้' }, { status: 400 })

  const { error, count } = await supabase
    .from('deals')
    .update({ buyer_id: user.id, status: 'awaiting_deposit' }, { count: 'exact' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (count === 0) return NextResponse.json({ error: 'ไม่สามารถเข้าร่วม Deal ได้ (RLS blocked)' }, { status: 403 })
  return NextResponse.json({ success: true })
}
