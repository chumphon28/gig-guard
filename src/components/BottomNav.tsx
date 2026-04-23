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
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-6 pt-2 bg-white border-t border-outline-variant z-50">
      {NAV_ITEMS.map(item => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all ${
              isActive ? 'bg-primary-container text-primary' : 'text-on-surface-variant'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isActive ? 'text-primary' : ''}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
