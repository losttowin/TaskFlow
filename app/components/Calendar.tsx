'use client'

import { useState } from 'react'
import { Task } from '@/app/types/task'

type CalendarProps = {
  tasks: Task[]
  onDateSelect: (date: string) => void
  selectedDate: string | null
}

export default function Calendar({ tasks, onDateSelect, selectedDate }: CalendarProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const daysInMonth = lastDay.getDate()

  const todayStr = today.toISOString().split('T')[0]

  // Build task map: date -> count
  const taskMap = new Map<string, { count: number; hasOverdue: boolean }>()
  tasks.forEach((t) => {
    if (!t.due_date) return
    const entry = taskMap.get(t.due_date) || { count: 0, hasOverdue: false }
    entry.count++
    if (t.due_date < todayStr && t.status !== 'done') entry.hasOverdue = true
    taskMap.set(t.due_date, entry)
  })

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11) }
    else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0) }
    else setMonth(month + 1)
  }

  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const weekDays = ['日','一','二','三','四','五','六']

  const cells: Array<{ day: number; dateStr: string; isToday: boolean; entry?: { count: number; hasOverdue: boolean } }> = []
  for (let i = 0; i < startPad; i++) cells.push({ day: 0, dateStr: '', isToday: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateStr,
      isToday: dateStr === todayStr,
      entry: taskMap.get(dateStr),
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer">
          ‹
        </button>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {year}年 {monthNames[month]}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer">
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => cell.day > 0 && onDateSelect(cell.dateStr)}
            disabled={cell.day === 0}
            className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
              ${cell.day === 0 ? 'invisible' : ''}
              ${cell.isToday ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold' : ''}
              ${selectedDate === cell.dateStr && !cell.isToday ? 'bg-zinc-100 dark:bg-zinc-800' : ''}
              ${!cell.isToday && cell.day > 0 ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''}
            `}
          >
            <span>{cell.day > 0 ? cell.day : ''}</span>
            {cell.entry && (
              <div className="flex gap-0.5 mt-0.5">
                {cell.entry.count <= 3 ? (
                  Array.from({ length: cell.entry.count }).map((_, j) => (
                    <span
                      key={j}
                      className={`w-1 h-1 rounded-full ${cell.entry!.hasOverdue ? 'bg-red-500' : 'bg-zinc-400 dark:bg-zinc-500'}`}
                    />
                  ))
                ) : (
                  <span className={`text-[9px] font-medium ${cell.entry.hasOverdue ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {cell.entry.count}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
