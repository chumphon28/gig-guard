import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      seller:profiles!deals_seller_id_fkey(*),
      buyer:profiles!deals_buyer_id_fkey(*),
      dispute:disputes(*),
      review:reviews(*, reviewer:profiles!reviews_reviewer_id_fkey(*))
    `)
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
