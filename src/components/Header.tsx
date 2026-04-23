'use client'
import Link from 'next/link'

export default function Header({ userName }: { userName?: string }) {
  return (
    <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 border-b border-slate-200 shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
          </div>
          <Link href="/dashboard" className="text-lg font-extrabold tracking-tight text-on-surface">
            GigGuard DAO
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-[14px] font-semibold text-on-surface-variant hidden md:block">
              {userName}
            </span>
          )}
          <Link href="/deals/new">
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:opacity-90 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden md:inline">สร้าง Deal</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}
