import { Redis } from '@upstash/redis'
import type { IStorage } from './interface'
import type { ChatMessage, UnansweredQuestion, AllQuestion, AdminStats, PaginatedQuestions } from './types'

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

export class KVStorage implements IStorage {
  async appendMessage(message: ChatMessage): Promise<void> {
    const redis = getRedis()
    await redis.lpush(`chat_logs:${message.sessionId}`, JSON.stringify(message))
    await redis.expire(`chat_logs:${message.sessionId}`, 60 * 60 * 24 * 30)
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const redis = getRedis()
    const raw = await redis.lrange(`chat_logs:${sessionId}`, 0, -1)
    return (raw as string[]).map((r) => JSON.parse(r)).reverse()
  }

  async addUnansweredQuestion(q: UnansweredQuestion): Promise<void> {
    const redis = getRedis()
    await redis.zadd('unanswered_questions', {
      score: new Date(q.timestamp).getTime(),
      member: JSON.stringify(q),
    })
  }

  async getUnansweredQuestions(): Promise<UnansweredQuestion[]> {
    const redis = getRedis()
    const raw = await redis.zrange('unanswered_questions', 0, -1)
    return (raw as string[])
      .map((r) => JSON.parse(r) as UnansweredQuestion)
      .filter((q) => !q.answered)
  }

  async markQuestionAnswered(id: string): Promise<void> {
    const redis = getRedis()
    const raw = await redis.zrange('unanswered_questions', 0, -1)
    for (const r of raw as string[]) {
      const q = JSON.parse(r) as UnansweredQuestion
      if (q.id === id) {
        await redis.zrem('unanswered_questions', r)
        q.answered = true
        await redis.zadd('unanswered_questions', {
          score: new Date(q.timestamp).getTime(),
          member: JSON.stringify(q),
        })
        break
      }
    }
  }

  async logQuestion(q: AllQuestion): Promise<void> {
    const redis = getRedis()
    await redis.zadd('all_questions', {
      score: new Date(q.timestamp).getTime(),
      member: JSON.stringify(q),
    })
  }

  async getAllQuestions(page: number, pageSize: number): Promise<PaginatedQuestions> {
    const redis = getRedis()
    const total = await redis.zcard('all_questions')
    const start = (page - 1) * pageSize
    const raw = await redis.zrange('all_questions', start, start + pageSize - 1, { rev: true })
    return {
      questions: (raw as string[]).map((r) => JSON.parse(r) as AllQuestion),
      total,
    }
  }

  async getStats(): Promise<AdminStats> {
    const redis = getRedis()
    const today = new Date().toISOString().split('T')[0]
    const allRaw = await redis.zrange('all_questions', 0, -1)
    const all = (allRaw as string[]).map((r) => JSON.parse(r) as AllQuestion)
    const unansweredRaw = await redis.zrange('unanswered_questions', 0, -1)
    const unanswered = (unansweredRaw as string[])
      .map((r) => JSON.parse(r) as UnansweredQuestion)
      .filter((q) => !q.answered)

    return {
      totalQuestions: all.length,
      unansweredCount: unanswered.length,
      answeredCount: all.filter((q) => q.mode === 'answered').length,
      offTopicCount: all.filter((q) => q.mode === 'off_topic').length,
      todayCount: all.filter((q) => q.timestamp.startsWith(today)).length,
    }
  }
}
