'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { Task, TaskStatus } from '@/app/types/task'
import { fetchTasks, changeTaskStatus } from '@/app/lib/task-service'
import { useToast } from '@/app/lib/toast'
import Kanban from '@/app/components/Kanban'

export default function KanbanPage() {
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
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    await changeTaskStatus(id, status)
    toast.success('已移动到 ' + { todo: '待办', doing: '进行中', done: '已完成' }[status])
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-300 rounded-full animate-spin" />
          <p className="text-sm text-zinc-400 mt-2">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          看板
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          拖拽任务卡片切换状态
        </p>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden px-2">
        <Kanban tasks={tasks} onStatusChange={handleStatusChange} />
      </div>
    </div>
  )
}
