import fs from 'fs/promises'
import path from 'path'
import type { IStorage } from './interface'
import type { ChatMessage, UnansweredQuestion, AllQuestion, AdminStats, PaginatedQuestions } from './types'

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json')

interface StoreShape {
  chat_logs: ChatMessage[]
  unanswered_questions: UnansweredQuestion[]
  all_questions: AllQuestion[]
}

// Simple promise-based write lock to prevent concurrent read-modify-write races
let _writeLock: Promise<void> = Promise.resolve()

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { chat_logs: [], unanswered_questions: [], all_questions: [] }
  }
}

async function writeStore(data: StoreShape): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  const tmp = STORE_PATH + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(data, null, 2))
  await fs.rename(tmp, STORE_PATH)
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = _writeLock.then(() => fn())
  _writeLock = next.then(
    () => {},
    () => {}
  )
  return next
}

export class LocalStorage implements IStorage {
  async appendMessage(message: ChatMessage): Promise<void> {
    return withLock(async () => {
      const store = await readStore()
      store.chat_logs.push(message)
      await writeStore(store)
    })
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const store = await readStore()
    return store.chat_logs.filter((m) => m.sessionId === sessionId)
  }

  async addUnansweredQuestion(q: UnansweredQuestion): Promise<void> {
    return withLock(async () => {
      const store = await readStore()
      store.unanswered_questions.push(q)
      await writeStore(store)
    })
  }

  async getUnansweredQuestions(): Promise<UnansweredQuestion[]> {
    const store = await readStore()
    return store.unanswered_questions.filter((q) => !q.answered)
  }

  async markQuestionAnswered(id: string): Promise<void> {
    return withLock(async () => {
      const store = await readStore()
      const q = store.unanswered_questions.find((q) => q.id === id)
      if (q) q.answered = true
      await writeStore(store)
    })
  }

  async logQuestion(q: AllQuestion): Promise<void> {
    return withLock(async () => {
      const store = await readStore()
      store.all_questions.push(q)
      await writeStore(store)
    })
  }

  async getAllQuestions(page: number, pageSize: number): Promise<PaginatedQuestions> {
    const store = await readStore()
    const sorted = [...store.all_questions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const start = (page - 1) * pageSize
    return {
      questions: sorted.slice(start, start + pageSize),
      total: sorted.length,
    }
  }

  async getStats(): Promise<AdminStats> {
    const store = await readStore()
    const today = new Date().toISOString().split('T')[0]
    const qs = store.all_questions
    return {
      totalQuestions: qs.length,
      unansweredCount: store.unanswered_questions.filter((q) => !q.answered).length,
      answeredCount: qs.filter((q) => q.mode === 'answered').length,
      offTopicCount: qs.filter((q) => q.mode === 'off_topic').length,
      todayCount: qs.filter((q) => q.timestamp.startsWith(today)).length,
    }
  }
}
