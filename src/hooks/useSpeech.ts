'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  // Load best available voice
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      // Priority: Google en-IN > any en-IN > Google en-US Male > any en-US > any en
      voiceRef.current =
        voices.find((v) => v.lang === 'en-IN' && v.name.toLowerCase().includes('google')) ||
        voices.find((v) => v.lang === 'en-IN') ||
        voices.find((v) => v.lang === 'en-US' && v.name.includes('Google') && !v.name.includes('Female')) ||
        voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Premium'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null
    }

    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      if (!isEnabled) return

      // Cancel any current speech
      window.speechSynthesis.cancel()

      // Clean text: strip markdown, trim
      const clean = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/```[\s\S]*?```/g, 'code block omitted')
        .replace(/`([^`]+)`/g, '$1')
        .trim()

      if (!clean) return

      const utterance = new SpeechSynthesisUtterance(clean)
      if (voiceRef.current) utterance.voice = voiceRef.current
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isEnabled]
  )

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) stop() // stop current speech if disabling
      return !prev
    })
  }, [stop])

  return { speak, stop, isSpeaking, isEnabled, toggleEnabled }
}
