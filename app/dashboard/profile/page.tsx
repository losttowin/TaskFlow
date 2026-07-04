'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Task } from '@/app/types/task'
import { fetchTasks } from '@/app/lib/task-service'
import { exportCSV, exportJSON, downloadFile } from '@/app/lib/export'
import { isOnline, replayOfflineActions } from '@/app/lib/sync-service'
import { isSupabaseConfigured } from '@/app/lib/supabase'
import { useToast } from '@/app/lib/toast'
import { useTheme } from '@/app/lib/theme-context'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const { theme, toggle } = useTheme()
  const [tasks, setTasks] = useState<Task[]>([])
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadTasks = useCallback(async () => {
    if (!user) return
    try {
      const data = await fetchTasks(user.id)
      setTasks(data)
    } catch { /* silent */ }
  }, [user])

  useEffect(() => {
    if (user) loadTasks()
  }, [user, loadTasks])

  useEffect(() => {
    setOnline(isOnline())
    const onStatus = () => setOnline(isOnline())
    window.addEventListener('online', onStatus)
    window.addEventListener('offline', onStatus)
    return () => {
      window.removeEventListener('online', onStatus)
      window.removeEventListener('offline', onStatus)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleExportCSV = () => {
    const csv = exportCSV(tasks)
    const ts = new Date().toISOString().split('T')[0]
    downloadFile(csv, `taskflow-${ts}.csv`, 'text/csv;charset=utf-8')
    toast.success('CSV 已下载')
  }

  const handleExportJSON = () => {
    const json = exportJSON(tasks)
    const ts = new Date().toISOString().split('T')[0]
    downloadFile(json, `taskflow-${ts}.json`, 'application/json')
    toast.success('JSON 已下载')
  }

  const handleSync = async () => {
    if (!user) return
    setSyncing(true)
    const result = await replayOfflineActions(user.id)
    setSyncing(false)
    if (result.success > 0) {
      toast.success(`已同步 ${result.success} 项操作`)
      loadTasks()
    } else if (result.failed > 0) {
      toast.error(`${result.failed} 项同步失败`)
    } else {
      toast.info('没有需要同步的数据')
    }
  }

  if (!user) return null

  const items = [
    { label: '邮箱', value: user.email },
    {
      label: '存储模式',
      value: isSupabaseConfigured() ? 'Supabase 云端' : '本地演示',
    },
    {
      label: '网络状态',
      value: (
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {online ? '在线' : '离线'}
        </span>
      ),
    },
    { label: '任务总数', value: `${tasks.length} 项` },
    { label: '版本', value: 'v1.0-p1' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center text-2xl font-medium text-zinc-600">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>

          {/* Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-zinc-500">{item.label}</span>
                <span className="text-sm text-zinc-900 font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Export */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            <button
              onClick={handleExportCSV}
              disabled={tasks.length === 0}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>导出 CSV</span>
              <span className="text-zinc-400">📄</span>
            </button>
            <button
              onClick={handleExportJSON}
              disabled={tasks.length === 0}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>导出 JSON</span>
              <span className="text-zinc-400">📦</span>
            </button>
          </div>

          {/* Theme */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            <button
              onClick={toggle}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <span className="dark:text-zinc-100">外观模式</span>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                {theme === 'dark' ? '🌙 深色' : '☀️ 浅色'}
              </span>
            </button>
          </div>

          {/* Sync */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            <button
              onClick={handleSync}
              disabled={syncing || online}
              className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{syncing ? '同步中...' : '同步离线数据'}</span>
              <span className="text-zinc-400">🔄</span>
            </button>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.clear()
                  toast.success('本地数据已清除')
                }
              }}
              className="w-full text-left px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              清除本地数据
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              退出登录
            </button>
          </div>

          <p className="text-center text-xs text-zinc-400">
            TaskFlow v1.0 · PWA 移动版
          </p>
        </div>
      </div>
    </div>
  )
}
