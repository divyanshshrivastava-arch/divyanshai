import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getGroqClient, GROQ_MODEL, detectMode } from '@/lib/groq'
import { buildSystemPrompt } from '@/lib/system-prompt'
import { getStorage } from '@/lib/storage'
import type { ChatMessage, AllQuestion, UnansweredQuestion } from '@/lib/storage'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body?.message || typeof body.message !== 'string') {
    return new Response(JSON.stringify({ error: 'message is required' }), { status: 400 })
  }

  const { message, sessionId: clientSessionId } = body
  const sessionId: string = clientSessionId || uuidv4()
  const userMsgId = uuidv4()
  const timestamp = new Date().toISOString()

  const storage = getStorage()

  // Log the user message (fire and forget)
  const userMsg: ChatMessage = {
    id: userMsgId,
    sessionId,
    role: 'user',
    content: message,
    timestamp,
  }
  storage.appendMessage(userMsg).catch(console.error)

  const groq = getGroqClient()
  const systemPrompt = buildSystemPrompt()

  try {
    const stream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
    })

    let fullText = ''

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? ''
            if (token) {
              // Strip JSON markers from streaming output before sending to client
              const forwardMarker = '{"action":"forward_question"}'
              const offTopicMarker = '{"action":"off_topic"}'
              let filtered = token
              if (filtered.includes(forwardMarker)) {
                filtered = filtered.replace(forwardMarker, '').replace(/\n+$/, '')
              }
              if (filtered.includes(offTopicMarker)) {
                filtered = filtered.replace(offTopicMarker, '').replace(/\n+$/, '')
              }
              fullText += token
              if (filtered) {
                controller.enqueue(encoder.encode(filtered))
              }
            }
          }
        } finally {
          controller.close()

          // Post-stream: detect mode and log
          const { mode, cleanText } = detectMode(fullText)
          const assistantMsgId = uuidv4()
          const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            sessionId,
            role: 'assistant',
            content: cleanText,
            timestamp: new Date().toISOString(),
            mode,
          }
          storage.appendMessage(assistantMsg).catch(console.error)

          const question: AllQuestion = {
            id: userMsgId,
            question: message,
            sessionId,
            timestamp,
            mode,
          }
          storage.logQuestion(question).catch(console.error)

          if (mode === 'forwarded') {
            const sessionMsgs = await storage.getSessionMessages(sessionId).catch(() => [])
            const uq: UnansweredQuestion = {
              id: uuidv4(),
              question: message,
              sessionId,
              timestamp,
              answered: false,
              conversationContext: sessionMsgs.slice(-6),
            }
            storage.addUnansweredQuestion(uq).catch(console.error)
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Session-Id': sessionId,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Groq error:', err)
    return new Response(JSON.stringify({ error: 'AI service error' }), { status: 500 })
  }
}
