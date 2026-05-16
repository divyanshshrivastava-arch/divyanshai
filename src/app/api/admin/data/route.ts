import { NextRequest } from 'next/server'
import { checkAdminAuth } from '@/lib/auth'
import { getStorage } from '@/lib/storage'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(50, parseInt(url.searchParams.get('pageSize') ?? '20', 10))

  const storage = getStorage()
  const [{ questions, total }, unanswered, stats] = await Promise.all([
    storage.getAllQuestions(page, pageSize),
    storage.getUnansweredQuestions(),
    storage.getStats(),
  ])

  return Response.json({ questions, total, unanswered, stats, page, pageSize })
}
