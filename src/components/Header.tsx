'use client'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Header({ userName, isAdmin }: { userName?: string; isAdmin?: boolean }) {
  const router = useRouter()

  async function logout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white fixed w-full top-0 z-50 border-b border-outline-variant" style={{ boxShadow: '0 1px 0 0 #d4dfff' }}>
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1280px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center shadow-sm">
            <span
              className="material-symbols-outlined text-white text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
          </div>
          <Link href="/dashboard" className="text-[17px] font-extrabold tracking-tight text-on-surface">
            GigGuard<span className="text-primary"> DAO</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {userName && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full">
              <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <span className="text-[13px] font-semibold text-on-surface">{userName}</span>
            </div>
          )}

          {!isAdmin && (
            <Link href="/deals/new">
              <button className="px-4 py-2 green-gradient text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span className="hidden md:inline">สร้าง Deal</span>
              </button>
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-error-container text-on-error-container rounded-full text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          {userName && (
            <button
              onClick={logout}
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-all"
              title="ออกจากระบบ"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
