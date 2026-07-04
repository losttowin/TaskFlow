'use client'

type NavbarProps = {
  email?: string
  onLogout: () => void
}

export default function Navbar({ email, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-zinc-900">TaskFlow</span>
          <span className="text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
            v0.1
          </span>
        </div>

        {email && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{email}</span>
            <button
              onClick={onLogout}
              className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
            >
              退出
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
