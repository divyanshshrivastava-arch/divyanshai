import Groq from 'groq-sdk'

let _client: Groq | null = null

export function getGroqClient(): Groq {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _client
}

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

export function detectMode(text: string): {
  mode: 'answered' | 'off_topic' | 'forwarded'
  cleanText: string
} {
  const forwardMarker = '{"action":"forward_question"}'
  const offTopicMarker = '{"action":"off_topic"}'

  if (text.includes(forwardMarker)) {
    return {
      mode: 'forwarded',
      cleanText: text.replace(forwardMarker, '').trim(),
    }
  }

  if (text.includes(offTopicMarker)) {
    return {
      mode: 'off_topic',
      cleanText: text.replace(offTopicMarker, '').trim(),
    }
  }

  return { mode: 'answered', cleanText: text.trim() }
}
