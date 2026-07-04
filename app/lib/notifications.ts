'use client'

/**
 * Request notification permission and return status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  const result = await Notification.requestPermission()
  return result
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

/**
 * Send a local notification (for deadline reminders)
 */
export function sendNotification(title: string, body: string, tag?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const notif = new Notification(title, {
    body,
    tag: tag || 'taskflow-reminder',
    icon: '/icons/icon-192.png',
    requireInteraction: true,
  })
  // vibrate is supported but not in TS types
  ;(notif as any).vibrate = [200, 100, 200]
}

/**
 * Check tasks and send deadline notifications
 * - Overdue tasks (not done)
 * - Tasks due today
 * - Tasks due tomorrow (morning check)
 */
export function checkDeadlineNotifications(tasks: Array<{
  title: string;
  due_date: string | null;
  status: string;
}>) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const today = new Date().toISOString().split('T')[0]
  const overdue = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== 'done'
  )
  const dueToday = tasks.filter(
    (t) => t.due_date === today && t.status !== 'done'
  )
  const dueTomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const tomorrow = tasks.filter(
    (t) => t.due_date === dueTomorrow && t.status !== 'done'
  )

  // One notification per category
  if (overdue.length > 0) {
    sendNotification(
      '⚠️ 逾期任务',
      `你有 ${overdue.length} 个任务已逾期: ${overdue.slice(0, 3).map((t) => t.title).join('、')}${overdue.length > 3 ? '等' : ''}`,
      'taskflow-overdue'
    )
  }
  if (dueToday.length > 0) {
    sendNotification(
      '📅 今日待办',
      `${dueToday.length} 个任务今天截止: ${dueToday.slice(0, 3).map((t) => t.title).join('、')}${dueToday.length > 3 ? '等' : ''}`,
      'taskflow-today'
    )
  }
  if (tomorrow.length > 0) {
    sendNotification(
      '🔔 明日提醒',
      `${tomorrow.length} 个任务明天截止`,
      'taskflow-tomorrow'
    )
  }
}

/**
 * Schedule periodic deadline checks (every 30 min)
 */
export function startDeadlineChecker(
  getTasks: () => Array<{ title: string; due_date: string | null; status: string }>
): () => void {
  // Check immediately
  checkDeadlineNotifications(getTasks())

  // Check every 30 minutes
  const interval = setInterval(() => {
    checkDeadlineNotifications(getTasks())
  }, 30 * 60 * 1000)

  return () => clearInterval(interval)
}
