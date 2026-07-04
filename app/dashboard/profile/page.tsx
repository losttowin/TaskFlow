'use client'

import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import { isSupabaseConfigured } from '@/app/lib/supabase'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (!user) return null

  const items = [
    { label: '邮箱', value: user.email },
    {
      label: '存储模式',
      value: isSupabaseConfigured() ? 'Supabase 云端' : '本地演示',
    },
    { label: '用户 ID', value: user.id.slice(0, 8) + '...' },
    {
      label: '版本',
      value: 'v1.0-p0',
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar email={user.email} onLogout={handleLogout} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center text-2xl">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>

        {/* Info list */}
        <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-zinc-500">{item.label}</span>
              <span className="text-sm text-zinc-900 font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.clear()
                alert('本地数据已清除')
              }
            }}
            className="w-full text-left px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50 cursor-pointer"
          >
            清除本地数据
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            退出登录
          </button>
        </div>

        <p className="text-center text-xs text-zinc-400">
          TaskFlow v1.0 · PWA 移动版
        </p>
      </main>
    </div>
  )
}
