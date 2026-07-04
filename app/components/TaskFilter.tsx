'use client'

import { TaskFilterState, TaskSortType, SORT_LABELS } from '@/app/types/task'

type TaskFilterProps = {
  filter: TaskFilterState
  sort: TaskSortType
  onChange: (filter: TaskFilterState) => void
  onSortChange: (sort: TaskSortType) => void
}

export default function TaskFilter({
  filter,
  sort,
  onChange,
  onSortChange,
}: TaskFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="搜索任务..."
        value={filter.search}
        onChange={(e) => onChange({ ...filter, search: e.target.value })}
        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-zinc-400"
      />
      <select
        value={filter.status}
        onChange={(e) =>
          onChange({
            ...filter,
            status: e.target.value as TaskFilterState['status'],
          })
        }
        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        <option value="all">全部状态</option>
        <option value="todo">待办</option>
        <option value="doing">进行中</option>
        <option value="done">已完成</option>
      </select>
      <select
        value={filter.priority}
        onChange={(e) =>
          onChange({
            ...filter,
            priority: e.target.value as TaskFilterState['priority'],
          })
        }
        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        <option value="all">全部优先级</option>
        <option value="high">高</option>
        <option value="medium">中</option>
        <option value="low">低</option>
      </select>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as TaskSortType)}
        className="px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
      >
        {(Object.keys(SORT_LABELS) as TaskSortType[]).map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  )
}
