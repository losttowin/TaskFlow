export type DueStatus = 'overdue' | 'urgent' | 'normal' | 'pending'

export type DueInfo = {
  status: DueStatus
  label: string
  color: string
}

/**
 * 计算截止日期状态
 * - pending: 未设置日期
 * - overdue: 已过期（仅未完成的任务）
 * - urgent: 3天内到期（仅未完成的任务）
 * - normal: 3天以上
 */
export function getDueInfo(dueDate: string | null, isDone: boolean): DueInfo {
  if (!dueDate) {
    return { status: 'pending', label: '待定', color: 'text-zinc-400' }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (isDone) {
    return { status: 'normal', label: dueDate, color: 'text-zinc-500' }
  }

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return {
      status: 'overdue',
      label: `已逾期 ${days} 天`,
      color: 'text-red-600',
    }
  }

  if (diffDays === 0) {
    return {
      status: 'urgent',
      label: '今天截止',
      color: 'text-red-500',
    }
  }

  if (diffDays === 1) {
    return {
      status: 'urgent',
      label: '明天截止',
      color: 'text-orange-500',
    }
  }

  if (diffDays <= 3) {
    return {
      status: 'urgent',
      label: `还剩 ${diffDays} 天`,
      color: 'text-orange-500',
    }
  }

  return { status: 'normal', label: dueDate, color: 'text-zinc-500' }
}
