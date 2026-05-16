'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseSpeechInputOptions {
  onResult: (transcript: string) => void
  onError?: (error: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export function useSpeechInput({ onResult, onError }: UseSpeechInputOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<AnyRecognition>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    setIsSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition))
  }, [])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const API = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!API) return

    const recognition = new API()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: AnyRecognition) => {
      const transcript: string = event.results[0][0].transcript
      if (transcript.trim()) onResult(transcript.trim())
    }

    recognition.onerror = (event: AnyRecognition) => {
      setIsListening(false)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        onError?.(event.error as string)
      }
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [onResult, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, startListening, stopListening }
}
