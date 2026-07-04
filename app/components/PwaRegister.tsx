'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err)
      })

    // Listen for install prompt
    let deferredPrompt: any = null
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  return null
}
