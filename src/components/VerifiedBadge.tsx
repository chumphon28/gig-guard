export default function VerifiedBadge() {
  return (
    <span
      className="flex items-center gap-1 px-3 py-1 bg-secondary/20 text-secondary rounded-full font-bold text-[12px] cursor-help"
      title="ร้านค้านี้มียอดสำเร็จ ≥ 10 ดีล และ rating ≥ 4.0"
    >
      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        verified_user
      </span>
      GigGuard Verified
    </span>
  )
}
