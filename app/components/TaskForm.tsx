'use client'

import { Task, TaskStatus, TaskPriority } from '@/app/types/task'
import { useState, useEffect, FormEvent, useMemo } from 'react'
import { getDueInfo } from '@/app/lib/date-utils'

type TaskFormProps = {
  editingTask: Task | null
  onSubmit: (data: {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    due_date: string
    tag: string
  }) => void
  onCancel: () => void
}

export default function TaskForm({
  editingTask,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tag, setTag] = useState('')

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description || '')
      setStatus(editingTask.status)
      setPriority(editingTask.priority)
      setDueDate(editingTask.due_date || '')
      setTag(editingTask.tag || '')
    } else {
      setTitle('')
      setDescription('')
      setStatus('todo')
      setPriority('medium')
      setDueDate('')
      setTag('')
    }
  }, [editingTask])

  const dueInfo = useMemo(
    () => getDueInfo(dueDate || null, status === 'done'),
    [dueDate, status]
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate || '',
      tag: tag.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-lg p-4 space-y-3"
    >
      <h3 className="font-medium text-zinc-900">
        {editingTask ? '编辑任务' : '新建任务'}
      </h3>

      <input
        type="text"
        placeholder="任务标题 *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
      />

      <textarea
        placeholder="任务描述（可选）"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="todo">待办</option>
            <option value="doing">进行中</option>
            <option value="done">已完成</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">优先级</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">截止日期</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              dueInfo.status === 'overdue'
                ? 'border-red-300 focus:ring-red-400 bg-red-50'
                : dueInfo.status === 'urgent'
                  ? 'border-orange-300 focus:ring-orange-400 bg-orange-50'
                  : 'border-zinc-300 focus:ring-zinc-400'
            }`}
          />
          {dueDate && (
            <p className={`text-xs mt-1 font-medium ${dueInfo.color}`}>
              {dueInfo.label}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">标签</label>
          <input
            type="text"
            placeholder="如: 工作"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        >
          {editingTask ? '保存' : '创建'}
        </button>
      </div>
    </form>
  )
}
