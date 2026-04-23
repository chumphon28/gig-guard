'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'receipt_long', label: 'Deals' },
  { href: '/deals/new', icon: 'add_circle', label: 'New Deal' },
  { href: '/admin/disputes', icon: 'gavel', label: 'Disputes' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_0_rgba(15,23,42,0.05)] z-50 rounded-t-xl">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-colors ${
            pathname.startsWith(item.href)
              ? 'text-on-surface bg-surface-container'
              : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
