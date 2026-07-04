'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { Task, TaskStatus } from '@/app/types/task'
import { fetchTasks, changeTaskStatus } from '@/app/lib/task-service'
import { useToast } from '@/app/lib/toast'
import Calendar from '@/app/components/Calendar'
import TaskCard from '@/app/components/TaskCard'

export default function CalendarPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  // Tasks for selected date
  const dateTasks = selectedDate
    ? tasks.filter((t) => t.due_date === selectedDate)
    : []

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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {/* Calendar */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <Calendar
              tasks={tasks}
              onDateSelect={(d) => setSelectedDate(d === selectedDate ? null : d)}
              selectedDate={selectedDate}
            />
          </div>

          {/* Tasks for selected date */}
          {selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {selectedDate} 的任务
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                >
                  清除
                </button>
              </div>
              {dateTasks.length === 0 ? (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-8">
                  当天没有任务
                </p>
              ) : (
                <div className="space-y-2">
                  {dateTasks.map((task) => (
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
          )}
        </div>
      </div>
    </div>
  )
}
