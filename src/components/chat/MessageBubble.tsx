'use client'

import { clsx } from 'clsx'

interface Props {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function MessageBubble({ role, content, isStreaming }: Props) {
  const isUser = role === 'user'

  return (
    <div className={clsx('flex min-w-0 items-end gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={clsx(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2',
          isUser
            ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white ring-fuchsia-500/30'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white ring-cyan-500/30'
        )}
      >
        {isUser ? 'You' : 'D'}
      </div>
      <div
        className={clsx(
          'min-w-0 max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm md:max-w-[72%]',
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-fuchsia-600/90 to-pink-600/90 text-white shadow-lg shadow-fuchsia-500/20'
            : 'rounded-bl-sm bg-white/5 text-zinc-100 ring-1 ring-white/10'
        )}
      >
        <p className="break-words">{content}{isStreaming && <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-cyan-400 align-middle" />}</p>
      </div>
    </div>
  )
}
