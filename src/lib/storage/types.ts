export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  mode?: 'answered' | 'off_topic' | 'forwarded'
}

export interface UnansweredQuestion {
  id: string
  question: string
  sessionId: string
  timestamp: string
  answered: boolean
  conversationContext: ChatMessage[]
}

export interface AllQuestion {
  id: string
  question: string
  sessionId: string
  timestamp: string
  mode: 'answered' | 'off_topic' | 'forwarded'
}

export interface AdminStats {
  totalQuestions: number
  unansweredCount: number
  answeredCount: number
  offTopicCount: number
  todayCount: number
}

export interface PaginatedQuestions {
  questions: AllQuestion[]
  total: number
}
