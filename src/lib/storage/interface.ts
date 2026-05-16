import type { ChatMessage, UnansweredQuestion, AllQuestion, AdminStats, PaginatedQuestions } from './types'

export interface IStorage {
  appendMessage(message: ChatMessage): Promise<void>
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>

  addUnansweredQuestion(q: UnansweredQuestion): Promise<void>
  getUnansweredQuestions(): Promise<UnansweredQuestion[]>
  markQuestionAnswered(id: string): Promise<void>

  logQuestion(q: AllQuestion): Promise<void>
  getAllQuestions(page: number, pageSize: number): Promise<PaginatedQuestions>

  getStats(): Promise<AdminStats>
}
