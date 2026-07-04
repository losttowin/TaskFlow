'use client'

type FABProps = {
  onClick: () => void
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-20 z-40 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-zinc-800 active:scale-95 transition-transform flex items-center justify-center text-2xl cursor-pointer"
      aria-label="新建任务"
    >
      +
    </button>
  )
}
