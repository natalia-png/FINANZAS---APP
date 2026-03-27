'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Inicio', emoji: '🏠' },
  { href: '/nat', label: 'Nat', emoji: '🌸' },
  { href: '/alejo', label: 'Alejo', emoji: '🚀' },
  { href: '/compartido', label: 'Juntos', emoji: '💚' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-md">
        <div className="glass-card rounded-t-2xl rounded-b-none border-b-0 px-2 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-sm scale-105'
                      : 'hover:bg-white/50'
                  }`}
                >
                  <span className="text-xl">{item.emoji}</span>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-gray-800' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
