'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { Task } from '@/app/types/task'
import { fetchTasks } from '@/app/lib/task-service'
import Navbar from '@/app/components/Navbar'
import { useRouter } from 'next/navigation'

export default function StatsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchTasks(user.id)
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadTasks()
  }, [user, loadTasks])

  const total = tasks.length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const doing = tasks.filter((t) => t.status === 'doing').length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length
  const rate = total === 0 ? 0 : Math.round((done / total) * 100)

  const stats = [
    { label: '全部任务', value: total, color: 'bg-zinc-100' },
    { label: '待办', value: todo, color: 'bg-amber-100' },
    { label: '进行中', value: doing, color: 'bg-blue-100' },
    { label: '已完成', value: done, color: 'bg-green-100' },
    { label: '已逾期', value: overdue, color: 'bg-red-100' },
    { label: '高优先未完成', value: highPriority, color: 'bg-orange-100' },
  ]

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-2">
      <Navbar email={user?.email} onLogout={handleLogout} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h2 className="text-lg font-semibold text-zinc-900">任务统计</h2>

        {loading ? (
          <p className="text-center text-zinc-400 py-8">加载中...</p>
        ) : (
          <>
            {/* Completion ring */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#f4f4f5" strokeWidth="10" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(rate / 100) * 251} 251`}
                  />
                </svg>
                <span className="absolute text-2xl font-bold text-zinc-900">{rate}%</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2">任务完成率</p>
            </div>

            {/* Detail stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                  <div className="text-3xl font-bold text-zinc-900">{s.value}</div>
                  <div className="text-sm text-zinc-600 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-4">
              <h3 className="font-medium text-zinc-900 text-sm">状态分布</h3>
              {[
                { label: '待办', count: todo, color: 'bg-amber-500' },
                { label: '进行中', count: doing, color: 'bg-blue-500' },
                { label: '已完成', count: done, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{item.label}</span>
                    <span>{total > 0 ? Math.round((item.count / total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
