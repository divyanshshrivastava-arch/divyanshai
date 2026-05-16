'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, LayoutGrid } from 'lucide-react'
import MessageList, { Message } from './MessageList'
import ChatInput from './ChatInput'
import TalkingAvatar from './TalkingAvatar'
import { useSpeech } from '@/hooks/useSpeech'
import { useSpeechInput } from '@/hooks/useSpeechInput'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('ask_divyansh_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('ask_divyansh_session_id', id)
  }
  return id
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! I'm Divyansh's virtual twin — built to give you a real look at who I am, what I've built, and what I'm aiming for next. Ask me about my role, my skills, what salary I'm targeting, or where I see myself in the next few years. This is me, unfiltered.",
}

export default function ChatContainer() {
  const [sessionId, setSessionId] = useState('')
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showAvatar, setShowAvatar] = useState(true)
  const [isVoiceMode, setIsVoiceMode] = useState(false)

  const { speak, stop, isSpeaking, isEnabled, toggleEnabled } = useSpeech()

  // Timer ref for auto-restart after speaking ends
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isVoiceModeRef = useRef(isVoiceMode)
  isVoiceModeRef.current = isVoiceMode

  const handleSend = useCallback(async (text: string) => {
    stop()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setStreamingContent('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      })

      if (!res.ok || !res.body) throw new Error('Chat request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const display = buf
          .replace(/\{"action":"forward_question"\}/g, '')
          .replace(/\{"action":"off_topic"\}/g, '')
          .trimEnd()
        setStreamingContent(display)
      }

      const cleanBuf = buf
        .replace(/\{"action":"forward_question"\}/g, '')
        .replace(/\{"action":"off_topic"\}/g, '')
        .trim()

      const finalMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: cleanBuf }
      setMessages((prev) => [...prev, finalMsg])
      setStreamingContent('')
      speak(cleanBuf)
    } catch {
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Hmm, something went wrong on my end. Give it another shot — or ping the real Divyansh directly!",
      }
      setMessages((prev) => [...prev, errMsg])
      setStreamingContent('')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, speak, stop])

  const handleVoiceResult = useCallback((transcript: string) => {
    setIsVoiceMode(true)
    handleSend(transcript)
  }, [handleSend])

  const { isListening, isSupported, startListening, stopListening } = useSpeechInput({
    onResult: handleVoiceResult,
  })

  // Auto-restart mic 5s after speaking finishes (when voice mode is on)
  const prevIsSpeaking = useRef(false)
  useEffect(() => {
    const wasJustSpeaking = prevIsSpeaking.current && !isSpeaking
    prevIsSpeaking.current = isSpeaking

    if (wasJustSpeaking && isVoiceModeRef.current && !isLoading) {
      // Clear any existing timer
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
      restartTimerRef.current = setTimeout(() => {
        if (isVoiceModeRef.current) startListening()
      }, 5000)
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    }
  }, [isSpeaking, isLoading, startListening])

  const handleMicClick = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    if (isListening) {
      // Turn off voice mode entirely
      stopListening()
      setIsVoiceMode(false)
    } else if (isVoiceMode) {
      // Already in voice mode but not listening — turn off
      setIsVoiceMode(false)
    } else {
      // Start voice mode
      setIsVoiceMode(true)
      startListening()
    }
  }, [isListening, isVoiceMode, startListening, stopListening])

  useEffect(() => {
    setSessionId(getOrCreateSessionId())
  }, [])

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide text-white">Ask Divyansh</span>
          <span className="hidden text-xs text-zinc-500 md:inline">— Virtual Twin · DevX Labs · Salary Negotiation</span>
        </div>
        <button
          onClick={() => setShowAvatar((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/10 md:hidden"
        >
          <LayoutGrid size={13} />
          {showAvatar ? 'Hide avatar' : 'Show avatar'}
        </button>
      </header>

      {/* Main: split on md+, stacked on mobile */}
      <div className="flex flex-1 overflow-hidden md:flex-row">

        {/* Left: Avatar panel */}
        <aside
          className={`
            flex-shrink-0 border-b border-white/10 bg-gradient-to-b from-[#050c1a] to-[#040810]
            transition-all duration-300 md:border-b-0 md:border-r
            ${showAvatar ? 'h-[300px]' : 'h-0 overflow-hidden'}
            md:h-auto md:w-[340px] md:overflow-visible
          `}
        >
          <TalkingAvatar
            isSpeaking={isSpeaking}
            isVoiceEnabled={isEnabled}
            onToggleVoice={toggleEnabled}
          />
        </aside>

        {/* Right: Chat panel */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            streamingContent={streamingContent}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            isListening={isListening}
            isVoiceMode={isVoiceMode}
            isVoiceSupported={isSupported}
            onMicClick={handleMicClick}
          />
        </div>
      </div>
    </div>
  )
}
