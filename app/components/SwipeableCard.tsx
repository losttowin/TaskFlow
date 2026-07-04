'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'

type SwipeAction = {
  label: string
  color: string
  onAction: () => void
}

type SwipeableCardProps = {
  children: ReactNode
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  threshold?: number
}

export default function SwipeableCard({
  children,
  leftAction,
  rightAction,
  threshold = 80,
}: SwipeableCardProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [animating, setAnimating] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)

  const handleStart = useCallback((clientX: number) => {
    if (animating) return
    startX.current = clientX
    currentX.current = clientX
    isDragging.current = true
    setOffsetX(0)
  }, [animating])

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return
    currentX.current = clientX
    const dx = clientX - startX.current
    setOffsetX(dx)
  }, [])

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    const dx = currentX.current - startX.current

    if (dx > threshold && rightAction) {
      setAnimating(true)
      setOffsetX(200)
      setTimeout(() => {
        rightAction.onAction()
        setOffsetX(0)
        setAnimating(false)
      }, 200)
    } else if (dx < -threshold && leftAction) {
      setAnimating(true)
      setOffsetX(-200)
      setTimeout(() => {
        leftAction.onAction()
        setOffsetX(0)
        setAnimating(false)
      }, 200)
    } else {
      setOffsetX(0)
    }
  }, [threshold, leftAction, rightAction])

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background actions */}
      {rightAction && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-green-500 rounded-r-lg">
          <span className="text-white text-sm font-medium">{rightAction.label}</span>
        </div>
      )}
      {leftAction && (
        <div className="absolute inset-y-0 left-0 flex items-center px-4 bg-green-500 rounded-l-lg">
          <span className="text-white text-sm font-medium">{leftAction.label}</span>
        </div>
      )}

      {/* Foreground card */}
      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: animating ? 'transform 0.2s ease' : 'none',
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => {
          if (isDragging.current) handleMove(e.clientX)
        }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {children}
      </div>
    </div>
  )
}
