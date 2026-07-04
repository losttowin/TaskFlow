'use client'

import { Task, TaskStatus } from '@/app/types/task'
import { useState } from 'react'
import { getDueInfo } from '@/app/lib/date-utils'

type TaskCardProps = {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const statusLabels: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-amber-100 text-amber-800',
  doing: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
}

const priorityColors: Record<string, string> = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-zinc-400',
}

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: 'doing',
  doing: 'done',
  done: 'todo',
}

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dueInfo = getDueInfo(task.due_date, task.status === 'done')

  return (
    <div
      className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${
        dueInfo.status === 'overdue'
          ? 'border-red-300 bg-red-50/30'
          : dueInfo.status === 'urgent'
            ? 'border-orange-300 bg-orange-50/30'
            : 'border-zinc-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-medium ${
                task.status === 'done'
                  ? 'line-through text-zinc-400'
                  : 'text-zinc-900'
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${statusColors[task.status]}`}
            >
              {statusLabels[task.status]}
            </span>
            <span
              className={`text-xs font-medium ${priorityColors[task.priority]}`}
            >
              {priorityLabels[task.priority]}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className={`font-medium ${dueInfo.color}`}>
              📅 {dueInfo.label}
            </span>
            {task.tag && (
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">
                #{task.tag}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => onStatusChange(task.id, nextStatus[task.status])}
            className="text-xs px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors cursor-pointer"
            title={`移动到 ${statusLabels[nextStatus[task.status]]}`}
          >
            →
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-xs px-2 py-1 hover:bg-zinc-100 rounded transition-colors cursor-pointer"
          >
            ···
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 min-w-[100px]">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(task)
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-50 cursor-pointer"
                >
                  编辑
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(task.id)
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
