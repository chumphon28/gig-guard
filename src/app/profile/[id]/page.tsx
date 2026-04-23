import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import VerifiedBadge from '@/components/VerifiedBadge'
import ReviewStars from '@/components/ReviewStars'
import { isVerified, formatCurrency } from '@/lib/deal-utils'

export const revalidate = 0

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!profile) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
    .eq('reviewee_id', params.id)
    .order('created_at', { ascending: false })

  const { data: currentUserProfile } = user
    ? await supabase.from('profiles').select('name').eq('id', user.id).single()
    : { data: null }

  const verified = isVerified(profile)

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header userName={currentUserProfile?.name} />

      <main className="pt-24 px-4 md:px-6 max-w-[800px] mx-auto">
        {/* Profile hero */}
        <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-primary-container text-[40px]">person</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-[28px] font-bold text-on-surface">{profile.name}</h1>
                {verified && <VerifiedBadge />}
              </div>
              <div className="flex items-center gap-4 text-[14px] text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">handshake</span>
                  {profile.completed_deals_as_seller} deals สำเร็จ
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-yellow-400">star</span>
                  {Number(profile.avg_rating_as_seller).toFixed(1)} avg rating
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <p className="text-[28px] font-bold text-on-surface">{profile.completed_deals_as_seller}</p>
              <p className="text-[12px] font-semibold text-on-surface-variant mt-1">Deals สำเร็จ</p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <p className="text-[28px] font-bold text-on-surface">{Number(profile.avg_rating_as_seller).toFixed(1)}</p>
              <p className="text-[12px] font-semibold text-on-surface-variant mt-1">Rating เฉลี่ย</p>
            </div>
            <div className="bg-surface-container rounded-xl p-4 text-center">
              <p className="text-[28px] font-bold text-on-surface">{reviews?.length ?? 0}</p>
              <p className="text-[12px] font-semibold text-on-surface-variant mt-1">รีวิวทั้งหมด</p>
            </div>
          </div>

          {verified && (
            <div className="mt-4 bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_with_heart
              </span>
              <div>
                <p className="font-semibold text-secondary text-[14px]">GigGuard Verified Seller</p>
                <p className="text-[12px] text-on-surface-variant">ผ่านการตรวจสอบ: deals ≥ 10 และ rating ≥ 4.0</p>
              </div>
            </div>
          )}
        </div>

        {/* Reviews */}
        <section>
          <h2 className="text-[20px] font-bold text-on-surface mb-4">
            รีวิวจาก Buyer ({reviews?.length ?? 0})
          </h2>
          {!reviews || reviews.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-2xl p-8 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-outline block mb-2">rate_review</span>
              <p>ยังไม่มีรีวิว</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-on-surface text-[14px]">{review.reviewer?.name || 'Anonymous'}</p>
                        <p className="text-[12px] text-on-surface-variant">
                          {new Date(review.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                      <ReviewStars rating={review.rating} size={18} />
                      {review.comment && (
                        <p className="text-[14px] text-on-surface mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
