import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole, canTransition } from '@/lib/deal-utils'
import type { DealStatus } from '@/lib/types'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { to, tracking_info }: { to: DealStatus; tracking_info?: string } = body

  const { data: deal, error: fetchError } = await supabase
    .from('deals')
    .select('id, seller_id, buyer_id, status, payment_status')
    .eq('id', params.id)
    .single()

  if (fetchError || !deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const role = getUserRole(deal, user.id, profile?.is_admin ?? false)

  if (!canTransition(deal.status, to, role)) {
    return NextResponse.json({ error: `ไม่สามารถเปลี่ยนสถานะจาก ${deal.status} → ${to} ได้` }, { status: 403 })
  }

  const updateData: Record<string, unknown> = { status: to }

  if (to === 'pending_confirmation') updateData.payment_status = 'deposit_paid'
  if (to === 'completed') updateData.payment_status = 'fully_paid'
  if (to === 'shipped') {
    if (!tracking_info) return NextResponse.json({ error: 'กรุณากรอกข้อมูลการจัดส่ง' }, { status: 400 })
    updateData.tracking_info = tracking_info
  }

  const { error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, status: to })
}
