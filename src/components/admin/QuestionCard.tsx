import Badge from '@/components/ui/Badge'
import type { AllQuestion } from '@/lib/storage'

export default function QuestionCard({ question }: { question: AllQuestion }) {
  const date = new Date(question.timestamp)
  const formatted = date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition hover:bg-white/[0.07]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant={question.mode} />
        <span className="text-xs text-zinc-500">{formatted}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-100">{question.question}</p>
      <p className="mt-2 text-xs text-zinc-500">Session: {question.sessionId.slice(0, 8)}…</p>
    </div>
  )
}
