'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/app/types/task'
import { getDueInfo } from '@/app/lib/date-utils'

type KanbanProps = {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
}

const COLUMNS: { key: TaskStatus; label: string; color: string; bg: string; darkBg: string }[] = [
  { key: 'todo', label: '待办', color: 'bg-amber-500', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-950/30' },
  { key: 'doing', label: '进行中', color: 'bg-blue-500', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-950/30' },
  { key: 'done', label: '已完成', color: 'bg-green-500', bg: 'bg-green-50', darkBg: 'dark:bg-green-950/30' },
]

export default function Kanban({ tasks, onStatusChange }: KanbanProps) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)

  const getTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status)

  const handleDragStart = (id: string) => setDragId(id)

  const handleDragOver = (e: React.DragEvent, col: TaskStatus) => {
    e.preventDefault()
    setDragOverCol(col)
  }

  const handleDrop = (col: TaskStatus) => {
    if (dragId) {
      onStatusChange(dragId, col)
    }
    setDragId(null)
    setDragOverCol(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverCol(null)
  }

  const priorityLabels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  const priorityColors: Record<string, string> = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    low: 'text-zinc-400 dark:text-zinc-500',
  }

  return (
    <div className="flex gap-3 h-full overflow-x-auto pb-2 snap-x">
      {COLUMNS.map((col) => {
        const colTasks = getTasks(col.key)
        const isOver = dragOverCol === col.key

        return (
          <div
            key={col.key}
            className={`flex-shrink-0 w-[72vw] max-w-[300px] flex flex-col rounded-xl ${col.bg} ${col.darkBg} border border-zinc-200 dark:border-zinc-800 snap-center`}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDrop={() => handleDrop(col.key)}
            onDragLeave={() => setDragOverCol(null)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {col.label}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div
              className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] transition-colors ${
                isOver ? 'bg-zinc-200/50 dark:bg-zinc-700/30' : ''
              }`}
            >
              {colTasks.map((task) => {
                const dueInfo = getDueInfo(task.due_date, task.status === 'done')
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white dark:bg-zinc-900 rounded-lg border p-2.5 cursor-grab active:cursor-grabbing active:opacity-60 transition-all shadow-sm hover:shadow ${
                      dragId === task.id ? 'opacity-50 scale-95' : ''
                    } ${
                      dueInfo.status === 'overdue'
                        ? 'border-red-300 dark:border-red-800'
                        : dueInfo.status === 'urgent'
                          ? 'border-orange-300 dark:border-orange-800'
                          : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                    title={task.title}
                  >
                    <p
                      className={`text-sm font-medium leading-snug ${
                        task.status === 'done'
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-medium ${priorityColors[task.priority]}`}>
                        {priorityLabels[task.priority]}
                      </span>
                      {task.due_date && (
                        <span className={`text-[10px] ${dueInfo.color}`}>
                          {dueInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}

              {colTasks.length === 0 && !isOver && (
                <p className="text-xs text-zinc-300 dark:text-zinc-600 text-center py-8">
                  拖拽任务到此处
                </p>
              )}
              {colTasks.length === 0 && isOver && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-8 font-medium">
                  释放以移入
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
