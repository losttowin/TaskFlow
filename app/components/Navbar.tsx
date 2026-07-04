'use client'

import { useRouter } from 'next/navigation'

type NavbarProps = {
  email?: string
  onLogout: () => void
}

export default function Navbar({ email, onLogout }: NavbarProps) {
  const router = useRouter()

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-lg font-bold text-zinc-900">TaskFlow</span>
        </button>

        {email && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 max-w-[120px] truncate hidden sm:block">
              {email}
            </span>
            <button
              onClick={onLogout}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              退出
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
