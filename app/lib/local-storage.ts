import { Task, TaskStatus } from '@/app/types/task'

const TASKS_KEY = 'taskflow_tasks'
const USER_KEY = 'taskflow_user'

// ---- Auth helpers ----
export function getLocalUser(): { id: string; email: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setLocalUser(user: { id: string; email: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearLocalUser() {
  localStorage.removeItem(USER_KEY)
}

// ---- Task CRUD ----
function readTasks(): Task[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(TASKS_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function getLocalTasks(userId: string): Task[] {
  return readTasks().filter((t) => t.user_id === userId)
}

export function addLocalTask(task: Task) {
  const tasks = readTasks()
  tasks.push(task)
  writeTasks(tasks)
}

export function updateLocalTask(taskId: string, updates: Partial<Task>) {
  const tasks = readTasks()
  const idx = tasks.findIndex((t) => t.id === taskId)
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates }
    writeTasks(tasks)
  }
}

export function deleteLocalTask(taskId: string) {
  const tasks = readTasks()
  writeTasks(tasks.filter((t) => t.id !== taskId))
}

export function updateLocalTaskStatus(taskId: string, status: TaskStatus) {
  updateLocalTask(taskId, { status })
}
