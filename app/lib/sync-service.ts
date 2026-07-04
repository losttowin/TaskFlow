'use client'

import { Task, TaskStatus } from '@/app/types/task'
import {
  createTask,
  editTask,
  removeTask,
  changeTaskStatus,
} from './task-service'
import { addLocalTask, updateLocalTask, deleteLocalTask } from './local-storage'

type OfflineAction = {
  id: string
  type: 'create' | 'update' | 'delete' | 'statusChange'
  taskId?: string
  payload: any
  timestamp: number
}

const QUEUE_KEY = 'taskflow_offline_queue'

function getQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(QUEUE_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveQueue(queue: OfflineAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const item: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  const queue = getQueue()
  queue.push(item)
  saveQueue(queue)
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export async function replayOfflineActions(userId: string): Promise<{
  success: number
  failed: number
}> {
  const queue = getQueue()
  if (queue.length === 0) return { success: 0, failed: 0 }

  let success = 0
  let failed = 0

  for (const action of queue) {
    try {
      switch (action.type) {
        case 'create':
          await createTask(userId, action.payload)
          break
        case 'update':
          if (action.taskId) {
            await editTask(action.taskId, action.payload)
          }
          break
        case 'delete':
          if (action.taskId) {
            await removeTask(action.taskId)
          }
          break
        case 'statusChange':
          if (action.taskId) {
            await changeTaskStatus(action.taskId, action.payload.status)
          }
          break
      }
      success++
    } catch {
      failed++
    }
  }

  // Clear all synced items
  saveQueue([])
  return { success, failed }
}

/**
 * Offline-first task operations: works offline with local queue
 */
export async function offlineCreateTask(userId: string, data: any): Promise<Task> {
  if (isOnline()) return createTask(userId, data)
  // Offline: save locally + queue for later
  const task: Task = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: data.title || '',
    description: data.description || null,
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    due_date: data.due_date || null,
    tag: data.tag || null,
    is_pinned: false,
    order_index: 0,
    remind_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  addLocalTask(task)
  enqueueOfflineAction({ type: 'create', payload: data })
  return task
}

export async function offlineEditTask(taskId: string, updates: any): Promise<void> {
  if (isOnline()) return editTask(taskId, updates)
  updateLocalTask(taskId, updates)
  enqueueOfflineAction({ type: 'update', taskId, payload: updates })
}

export async function offlineRemoveTask(taskId: string): Promise<void> {
  if (isOnline()) return removeTask(taskId)
  deleteLocalTask(taskId)
  enqueueOfflineAction({ type: 'delete', taskId, payload: {} })
}

export async function offlineChangeStatus(taskId: string, status: TaskStatus): Promise<void> {
  if (isOnline()) return changeTaskStatus(taskId, status)
  updateLocalTask(taskId, { status } as any)
  enqueueOfflineAction({ type: 'statusChange', taskId, payload: { status } })
}

/**
 * Listen for connectivity changes and auto-replay
 */
export function listenForReconnect(userId: string, onReplay: (r: { success: number; failed: number }) => void) {
  const handleOnline = async () => {
    const result = await replayOfflineActions(userId)
    if (result.success > 0 || result.failed > 0) {
      onReplay(result)
    }
  }
  window.addEventListener('online', handleOnline)
  return () => window.removeEventListener('online', handleOnline)
}
