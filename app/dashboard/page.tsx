'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { Task, TaskFilterState, TaskPriority, TaskSortType, TaskStatus, PRIORITY_ORDER, STATUS_ORDER } from '@/app/types/task'
import {
  fetchTasks,
  createTask,
  editTask,
  removeTask,
  changeTaskStatus,
} from '@/app/lib/task-service'
import StatsCards from '@/app/components/StatsCards'
import TaskFilter from '@/app/components/TaskFilter'
import TaskForm from '@/app/components/TaskForm'
import TaskList from '@/app/components/TaskList'
import FAB from '@/app/components/FAB'

export default function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<TaskFilterState>({
    status: 'all',
    priority: 'all',
    search: '',
  })
  const [sort, setSort] = useState<TaskSortType>('status-priority')
  const [filterOpen, setFilterOpen] = useState(false)

  // Pull-to-refresh
  const listRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

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
      setRefreshing(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadTasks()
  }, [user, loadTasks])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    loadTasks()
  }, [loadTasks])

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

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Stats - horizontal scroll on mobile */}
      <div className="px-4 pt-3">
        <StatsCards tasks={tasks} />
      </div>

      {/* Filter bar - collapsible on mobile */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索任务..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 border rounded-lg text-sm transition-colors cursor-pointer ${
              filterOpen || filter.status !== 'all' || filter.priority !== 'all'
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'border-zinc-300 text-zinc-600'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {filterOpen && (
          <div className="flex gap-2 mt-2">
            <select
              value={filter.status}
              onChange={(e) =>
                setFilter({ ...filter, status: e.target.value as TaskFilterState['status'] })
              }
              className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white"
            >
              <option value="all">全部状态</option>
              <option value="todo">待办</option>
              <option value="doing">进行中</option>
              <option value="done">已完成</option>
            </select>
            <select
              value={filter.priority}
              onChange={(e) =>
                setFilter({ ...filter, priority: e.target.value as TaskFilterState['priority'] })
              }
              className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white"
            >
              <option value="all">全部优先级</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as TaskSortType)}
              className="flex-1 px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white"
            >
              <option value="status-priority">综合排序</option>
              <option value="priority">按优先级</option>
              <option value="status">按状态</option>
              <option value="due-date">按截止日期</option>
              <option value="created-desc">最新优先</option>
              <option value="created-asc">最早优先</option>
            </select>
          </div>
        )}
      </div>

      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="text-center py-3 text-sm text-zinc-400 animate-pulse">
          刷新中...
        </div>
      )}

      {/* Task form (modal-style on mobile) */}
      {(showForm || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => {
              setShowForm(false)
              setEditingTask(null)
            }}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 shadow-xl">
            <TaskForm
              editingTask={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-4"
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY
        }}
        onTouchEnd={(e) => {
          const dy = e.changedTouches[0].clientY - touchStartY.current
          if (dy > 80 && listRef.current?.scrollTop === 0) {
            handleRefresh()
          }
        }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <p className="text-sm text-zinc-400 mt-2">加载中...</p>
          </div>
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
      </div>

      {/* FAB - quick create */}
      <FAB onClick={() => setShowForm(true)} />
    </div>
  )
}
