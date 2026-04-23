import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <span className="material-symbols-outlined text-[64px] text-outline block mb-4">search_off</span>
        <h2 className="text-[24px] font-bold text-on-surface mb-2">ไม่พบ Deal</h2>
        <p className="text-on-surface-variant mb-6">Deal นี้อาจถูกลบหรือ URL ไม่ถูกต้อง</p>
        <Link
          href="/dashboard"
          className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}
