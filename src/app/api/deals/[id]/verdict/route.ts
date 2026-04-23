import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Admin only' }, { status: 403 })

  const { verdict }: { verdict: 'refund_buyer' | 'release_seller' } = await request.json()
  if (!['refund_buyer', 'release_seller'].includes(verdict)) {
    return NextResponse.json({ error: 'Invalid verdict' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { error: disputeError } = await adminClient
    .from('disputes')
    .update({ verdict, resolved_at: new Date().toISOString() })
    .eq('deal_id', params.id)

  if (disputeError) return NextResponse.json({ error: disputeError.message }, { status: 500 })

  const newStatus = verdict === 'refund_buyer' ? 'cancelled' : 'completed'
  const updateData: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'completed') updateData.payment_status = 'fully_paid'

  const { error } = await adminClient
    .from('deals')
    .update(updateData)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, status: newStatus })
}
