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
    <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1280px] mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="NONG POMz" className="h-14 w-auto" />
          <span className="text-lg font-extrabold tracking-tight text-on-surface hidden md:block">
            NONG POMz
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-[14px] font-semibold text-on-surface-variant hidden md:block">
              {userName}
            </span>
          )}
          {!isAdmin && (
            <Link href="/deals/new">
              <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="hidden md:inline">สร้าง Deal</span>
              </button>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="px-4 py-2 bg-error-container text-on-error-container rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}
          {userName && (
            <button
              onClick={logout}
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
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
