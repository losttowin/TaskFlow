'use client'

import { useRouter, usePathname } from 'next/navigation'

type Tab = {
  key: string
  label: string
  icon: string
  path: string
}

const tabs: Tab[] = [
  { key: 'today', label: '今日', icon: '📅', path: '/dashboard/today' },
  { key: 'tasks', label: '任务', icon: '📋', path: '/dashboard' },
  { key: 'stats', label: '统计', icon: '📊', path: '/dashboard/stats' },
  { key: 'profile', label: '我的', icon: '👤', path: '/dashboard/profile' },
]

export default function TabBar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (tab: Tab) => {
    if (tab.key === 'tasks') return pathname === '/dashboard'
    return pathname.startsWith(tab.path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab)
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors cursor-pointer ${
                active ? 'text-zinc-900' : 'text-zinc-400'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
