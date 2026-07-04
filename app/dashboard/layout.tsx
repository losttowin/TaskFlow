'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import TabBar from '@/app/components/TabBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar email={user.email} onLogout={handleLogout} />
      {children}
      <div className="h-16 safe-area-bottom" /> {/* TabBar spacer */}
      <TabBar />
    </div>
  )
}
