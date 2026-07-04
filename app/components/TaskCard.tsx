'use client'

import { Task, TaskStatus } from '@/app/types/task'
import { useState } from 'react'
import { getDueInfo } from '@/app/lib/date-utils'
import SwipeableCard from './SwipeableCard'

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
    <SwipeableCard
      rightAction={{
        label: nextStatus[task.status] === 'done' ? '完成' : '推进',
        color: 'bg-green-500',
        onAction: () => onStatusChange(task.id, nextStatus[task.status]),
      }}
    >
      <div
        className={`bg-white border rounded-xl p-4 active:bg-zinc-50 transition-colors ${
          dueInfo.status === 'overdue'
            ? 'border-red-300 bg-red-50/30'
            : dueInfo.status === 'urgent'
              ? 'border-orange-300 bg-orange-50/30'
              : 'border-zinc-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-medium text-[15px] ${
                  task.status === 'done'
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-900'
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}
              >
                {statusLabels[task.status]}
              </span>
              <span className={`text-[11px] font-medium ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Date + tag */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className={`font-medium ${dueInfo.color}`}>
                📅 {dueInfo.label}
              </span>
              {task.tag && (
                <span className="bg-zinc-100 px-1.5 py-0.5 rounded-full text-zinc-500 text-[11px]">
                  #{task.tag}
                </span>
              )}
            </div>
          </div>

          {/* Action button - larger touch target */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 active:bg-zinc-200 transition-colors cursor-pointer"
            aria-label="任务操作"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-2 top-10 z-20 bg-white border border-zinc-200 rounded-xl shadow-lg py-1 min-w-[100px]">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onStatusChange(task.id, nextStatus[task.status])
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 cursor-pointer"
                >
                  推进状态
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(task)
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 cursor-pointer"
                >
                  编辑
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(task.id)
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  删除
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </SwipeableCard>
  )
}
