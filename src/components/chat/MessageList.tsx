'use client'

import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  messages: Message[]
  isLoading: boolean
  streamingContent: string
}

export default function MessageList({ messages, isLoading, streamingContent }: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, isLoading])

  return (
    <div className="min-w-0 flex-1 space-y-5 overflow-y-auto px-4 py-6 md:px-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} role={m.role} content={m.content} />
      ))}
      {streamingContent && (
        <MessageBubble role="assistant" content={streamingContent} isStreaming />
      )}
      {isLoading && !streamingContent && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  )
}
