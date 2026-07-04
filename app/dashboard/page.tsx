'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Task, TaskFilterState, TaskPriority, TaskSortType, TaskStatus, PRIORITY_ORDER, STATUS_ORDER } from '@/app/types/task'
import {
  fetchTasks,
  createTask,
  editTask,
  removeTask,
  changeTaskStatus,
} from '@/app/lib/task-service'
import Navbar from '@/app/components/Navbar'
import StatsCards from '@/app/components/StatsCards'
import TaskFilter from '@/app/components/TaskFilter'
import TaskForm from '@/app/components/TaskForm'
import TaskList from '@/app/components/TaskList'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<TaskFilterState>({
    status: 'all',
    priority: 'all',
    search: '',
  })
  const [sort, setSort] = useState<TaskSortType>('status-priority')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

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

  const handleCreate = async (data: {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    due_date: string
    tag: string
  }) => {
    if (!user) return
    await createTask(user.id, {
      ...data,
      due_date: data.due_date || null,
    })
    setShowForm(false)
    loadTasks()
  }

  const handleEdit = async (data: {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    due_date: string
    tag: string
  }) => {
    if (!editingTask) return
    await editTask(editingTask.id, {
      ...data,
      due_date: data.due_date || null,
    })
    setEditingTask(null)
    loadTasks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return
    await removeTask(id)
    loadTasks()
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await changeTaskStatus(id, status)
    loadTasks()
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleFormSubmit = editingTask ? handleEdit : handleCreate

  const filteredTasks = tasks.filter((task) => {
    const matchStatus =
      filter.status === 'all' || task.status === filter.status
    const matchPriority =
      filter.priority === 'all' || task.priority === filter.priority
    const matchSearch = task.title
      .toLowerCase()
      .includes(filter.search.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      case 'status':
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      case 'status-priority':
        return (
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        )
      case 'due-date': {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
      case 'created-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'created-desc':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <p className="text-zinc-400">加载中...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar email={user.email} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <StatsCards tasks={tasks} />

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-zinc-900">任务列表</h2>
          {!showForm && !editingTask && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              + 新建任务
            </button>
          )}
        </div>

        {(showForm || editingTask) && (
          <TaskForm
            editingTask={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
        )}

        <TaskFilter filter={filter} sort={sort} onChange={setFilter} onSortChange={setSort} />

        {loading ? (
          <div className="text-center py-12 text-zinc-400">加载任务中...</div>
        ) : (
          <TaskList
            tasks={sortedTasks}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task)
              setShowForm(false)
            }}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  )
}
