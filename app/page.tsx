'use client'

import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-zinc-900 mb-3">TaskFlow</h1>
        <p className="text-zinc-500 mb-8">
          简洁高效的任务管理工具，帮助你轻松组织和追踪工作进度
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-100 transition-colors"
          >
            注册
          </Link>
        </div>
        <p className="text-xs text-zinc-400 mt-6">
          演示模式：无需真实邮箱即可注册使用
        </p>
      </div>
    </div>
  )
}
