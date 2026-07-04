export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  tag: string | null
  created_at: string
}

export type TaskFilterState = {
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  search: string
}

export type TaskSortType =
  | 'created-desc'   // 默认：最新优先
  | 'created-asc'    // 最早优先
  | 'priority'       // 按优先级：高→中→低
  | 'status'         // 按状态：待办→进行中→已完成
  | 'status-priority' // 综合：先状态，同状态内按优先级
  | 'due-date'       // 按截止日期：最近的优先

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  doing: 1,
  done: 2,
}

export const SORT_LABELS: Record<TaskSortType, string> = {
  'created-desc': '最新优先',
  'created-asc': '最早优先',
  'priority': '按优先级',
  'status': '按状态',
  'status-priority': '综合排序',
  'due-date': '按截止日期',
}
