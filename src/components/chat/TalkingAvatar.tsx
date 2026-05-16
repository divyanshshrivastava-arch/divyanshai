'use client'

import dynamic from 'next/dynamic'
import { Volume2, VolumeX, Mic } from 'lucide-react'

const AvatarCanvas = dynamic(() => import('./AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-40 w-32 animate-pulse rounded-2xl bg-purple-500/10" />
    </div>
  ),
})

interface Props {
  isSpeaking: boolean
  isVoiceEnabled: boolean
  onToggleVoice: () => void
}

export default function TalkingAvatar({ isSpeaking, isVoiceEnabled, onToggleVoice }: Props) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 px-4 py-6">
      {/* Holographic background glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-500"
        style={{
          background: isSpeaking
            ? 'radial-gradient(ellipse at center, rgba(0,212,255,0.14) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(0,100,180,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Name + role badge */}
      <div className="z-10 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <span className="relative flex h-1.5 w-1.5">
            {isSpeaking && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
          </span>
          {isSpeaking ? 'Speaking…' : 'Online · Ask me anything'}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative z-10 h-72 w-56 md:h-96 md:w-72">
        <AvatarCanvas isSpeaking={isSpeaking} />
      </div>

      {/* Name + title */}
      <div className="z-10 text-center">
        <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
          Divyansh Shrivastava
        </h2>
        <p className="mt-0.5 text-sm text-cyan-400">Founder's Office · DevX Labs</p>
        <p className="mt-0.5 text-xs text-zinc-500">B.Tech CSE · VIT Vellore</p>
      </div>

      {/* Voice toggle */}
      <button
        onClick={onToggleVoice}
        title={isVoiceEnabled ? 'Mute voice' : 'Enable voice'}
        className={`z-10 flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all hover:scale-105 ${
          isVoiceEnabled
            ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
            : 'border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60'
        }`}
      >
        {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        {isVoiceEnabled ? 'Voice on' : 'Voice off'}
      </button>

      {/* Speaking waveform bars */}
      {isSpeaking && (
        <div className="z-10 flex items-end gap-1">
          {[3, 6, 4, 7, 5, 8, 3, 6, 4].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-cyan-400"
              style={{
                height: `${h * 3}px`,
                animation: `waveBar 0.6s ease-in-out ${i * 0.07}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes waveBar {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
