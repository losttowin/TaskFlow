'use client'

import { Task } from '@/app/types/task'

type StatsCardsProps = {
  tasks: Task[]
}

export default function StatsCards({ tasks }: StatsCardsProps) {
  const total = tasks.length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const doing = tasks.filter((t) => t.status === 'doing').length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter((t) => {
    return (
      t.due_date &&
      new Date(t.due_date) < new Date() &&
      t.status !== 'done'
    )
  }).length
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100)

  const cards = [
    { label: '全部', value: total, color: 'bg-zinc-100 text-zinc-900' },
    { label: '待办', value: todo, color: 'bg-amber-50 text-amber-700' },
    { label: '进行中', value: doing, color: 'bg-blue-50 text-blue-700' },
    { label: '已完成', value: done, color: 'bg-green-50 text-green-700' },
    { label: '已逾期', value: overdue, color: 'bg-red-50 text-red-700' },
    { label: '完成率', value: `${completionRate}%`, color: 'bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-hide">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-xl p-3 text-center flex-shrink-0 w-[72px] sm:flex-1 snap-start`}
        >
          <div className="text-lg font-bold leading-tight">{card.value}</div>
          <div className="text-[10px] mt-0.5 opacity-75 leading-tight">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
