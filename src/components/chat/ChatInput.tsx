'use client'

import { useState, KeyboardEvent } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
  isListening?: boolean
  isVoiceMode?: boolean
  isVoiceSupported?: boolean
  onMicClick?: () => void
}

const SUGGESTIONS = [
  'Tell me about your current role',
  'What salary are you expecting?',
  'Why do you deserve a raise?',
  'What are your future goals?',
]

export default function ChatInput({
  onSend,
  disabled,
  isListening = false,
  isVoiceMode = false,
  isVoiceSupported = false,
  onMicClick,
}: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-white/10 bg-black/30 px-4 py-4 backdrop-blur-lg md:px-6">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            disabled={disabled}
            className="flex-shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 transition hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isListening ? 'Listening…' : isVoiceMode ? 'Voice mode on — speak anytime…' : 'Ask me anything about my work, salary, or goals…'}
          rows={1}
          disabled={disabled || isListening}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none disabled:opacity-50"
          style={{ maxHeight: '120px' }}
        />

        {isVoiceSupported && (
          <button
            onClick={onMicClick}
            disabled={disabled}
            title={isListening ? 'Stop recording' : isVoiceMode ? 'Voice mode on — click to turn off' : 'Turn on voice mode'}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                : isVoiceMode
                ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50'
                : 'bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white'
            }`}
          >
            {isListening && (
              <span className="absolute inset-0 animate-ping rounded-xl bg-red-500 opacity-30" />
            )}
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
