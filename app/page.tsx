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
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="text-center max-w-sm w-full">
        {/* Hero */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">TaskFlow</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            简洁高效的移动端任务管理工具
            <br />
            随时随地追踪你的工作进度
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '📝', label: '快速记录' },
            { icon: '📊', label: '数据统计' },
            { icon: '🔔', label: '逾期提醒' },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs text-zinc-500">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/register"
            className="block w-full py-3 bg-zinc-900 text-white text-sm font-medium rounded-xl text-center hover:bg-zinc-800 active:scale-[0.98] transition-transform"
          >
            开始使用
          </Link>
          <Link
            href="/login"
            className="block w-full py-3 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-xl text-center hover:bg-zinc-50 active:scale-[0.98] transition-transform"
          >
            已有账户？登录
          </Link>
        </div>

        <p className="text-xs text-zinc-400 mt-6">
          演示模式 · 无需注册即可体验
        </p>
      </div>
    </div>
  )
}
