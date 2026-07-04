import { Task, TaskPriority, TaskStatus } from '@/app/types/task'
import { supabase, isSupabaseConfigured } from './supabase'
import {
  getLocalTasks,
  addLocalTask,
  updateLocalTask,
  deleteLocalTask,
  updateLocalTaskStatus,
} from './local-storage'

export async function fetchTasks(userId: string): Promise<Task[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Task[]
  }
  return getLocalTasks(userId)
}

export async function createTask(
  userId: string,
  task: {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
    tag?: string | null
  }
): Promise<Task> {
  const newTask: Task = {
    id: crypto.randomUUID(),
    user_id: userId,
    title: task.title,
    description: task.description || null,
    status: task.status || 'todo',
    priority: (task.priority || 'medium') as TaskPriority,
    due_date: task.due_date || null,
    tag: task.tag || null,
    created_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').insert(newTask)
    if (error) throw error
  } else {
    addLocalTask(newTask)
  }

  return newTask
}

export async function editTask(
  taskId: string,
  updates: {
    title?: string
    description?: string | null
    status?: TaskStatus
    priority?: TaskPriority
    due_date?: string | null
    tag?: string | null
  }
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
    if (error) throw error
  } else {
    updateLocalTask(taskId, updates)
  }
}

export async function removeTask(taskId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) throw error
  } else {
    deleteLocalTask(taskId)
  }
}

export async function changeTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
    if (error) throw error
  } else {
    updateLocalTaskStatus(taskId, status)
  }
}
