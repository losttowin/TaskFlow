'use client'

import { Task, TaskStatus } from '@/app/types/task'
import TaskCard from './TaskCard'

type TaskListProps = {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export default function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-lg">暂无任务</p>
        <p className="text-sm mt-1">点击上方按钮创建第一个任务</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
