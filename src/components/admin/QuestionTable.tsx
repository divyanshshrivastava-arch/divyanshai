'use client'

import QuestionCard from './QuestionCard'
import type { AllQuestion, UnansweredQuestion } from '@/lib/storage'

interface Props {
  questions: AllQuestion[]
  unanswered: UnansweredQuestion[]
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}

export default function QuestionTable({
  questions,
  unanswered,
  page,
  pageSize,
  total,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6">
      {unanswered.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Needs your answer ({unanswered.length})
          </h2>
          <div className="space-y-3">
            {unanswered.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 backdrop-blur-sm"
              >
                <p className="text-sm leading-relaxed text-amber-100">{q.question}</p>
                <p className="mt-2 text-xs text-amber-200/60">
                  {new Date(q.timestamp).toLocaleString('en-IN')} · Session{' '}
                  {q.sessionId.slice(0, 8)}…
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-300">All questions</h2>
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-zinc-400">
              No questions yet. Share the link with your founders!
            </p>
          ) : (
            questions.map((q) => <QuestionCard key={q.id} question={q} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
