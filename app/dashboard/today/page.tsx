'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { Task, TaskStatus } from '@/app/types/task'
import { fetchTasks, changeTaskStatus } from '@/app/lib/task-service'
import { useToast } from '@/app/lib/toast'
import TaskCard from '@/app/components/TaskCard'

export default function TodayPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchTasks(user.id)
      setTasks(data)
    } catch {
      toast.error('加载任务失败')
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (user) loadTasks()
  }, [user, loadTasks])

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await changeTaskStatus(id, status)
    toast.success('任务状态已更新')
    loadTasks()
  }

  // Filter: today + overdue, not done
  const todayStr = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter((t) => {
    if (t.status === 'done') return false
    if (!t.due_date) return false
    return t.due_date <= todayStr
  })

  // Sort: overdue first, then today, then by priority
  const sorted = [...todayTasks].sort((a, b) => {
    const aOverdue = a.due_date! < todayStr ? 0 : 1
    const bOverdue = b.due_date! < todayStr ? 0 : 1
    if (aOverdue !== bOverdue) return aOverdue - bOverdue
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return (
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder]
    )
  })

  const overdue = sorted.filter((t) => t.due_date! < todayStr).length

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">今日</h2>
            <p className="text-xs text-zinc-500">
              {new Date().toLocaleDateString('zh-CN', {
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
          </div>
          {overdue > 0 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {overdue} 项逾期
            </span>
          )}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-zinc-900 font-medium">今天没有待办任务</p>
            <p className="text-sm text-zinc-400 mt-1">太棒了，享受你的一天！</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
