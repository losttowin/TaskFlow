'use client'

import { Task } from '@/app/types/task'

/**
 * Export tasks as CSV string
 */
export function exportCSV(tasks: Task[]): string {
  const headers = [
    '标题',
    '描述',
    '状态',
    '优先级',
    '截止日期',
    '标签',
    '创建时间',
  ]
  const statusMap: Record<string, string> = {
    todo: '待办',
    doing: '进行中',
    done: '已完成',
  }
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低',
  }

  const rows = tasks.map((t) =>
    [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      statusMap[t.status] || t.status,
      priorityMap[t.priority] || t.priority,
      t.due_date || '',
      t.tag || '',
      t.created_at ? new Date(t.created_at).toLocaleDateString('zh-CN') : '',
    ].join(',')
  )

  return '﻿' + headers.join(',') + '\n' + rows.join('\n')
}

/**
 * Export tasks as JSON string
 */
export function exportJSON(tasks: Task[]): string {
  return JSON.stringify(tasks, null, 2)
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
