import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: deal } = await supabase
    .from('deals')
    .select('id, buyer_id, status')
    .eq('id', params.id)
    .single()

  if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  if (deal.buyer_id !== user.id) return NextResponse.json({ error: 'เฉพาะ Buyer เท่านั้น' }, { status: 403 })
  if (deal.status !== 'shipped') return NextResponse.json({ error: 'Deal ต้องอยู่ในสถานะ shipped' }, { status: 400 })

  const { reason, evidence_url } = await request.json()
  if (!reason) return NextResponse.json({ error: 'กรุณาระบุเหตุผล' }, { status: 400 })

  const { error: disputeError } = await supabase
    .from('disputes')
    .insert({ deal_id: params.id, reason, evidence_url: evidence_url || null })

  if (disputeError) return NextResponse.json({ error: disputeError.message }, { status: 500 })

  const { error } = await supabase
    .from('deals')
    .update({ status: 'disputed' })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
