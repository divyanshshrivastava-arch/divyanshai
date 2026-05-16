import { MessageSquare, AlertCircle, CheckCircle, Calendar, EyeOff } from 'lucide-react'
import type { AdminStats } from '@/lib/storage'

const cards = [
  { key: 'totalQuestions', label: 'Total Questions', icon: MessageSquare, color: 'from-purple-500 to-indigo-500' },
  { key: 'todayCount', label: 'Today', icon: Calendar, color: 'from-fuchsia-500 to-pink-500' },
  { key: 'unansweredCount', label: 'Needs Answer', icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
  { key: 'answeredCount', label: 'Answered', icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
  { key: 'offTopicCount', label: 'Off-topic', icon: EyeOff, color: 'from-zinc-500 to-zinc-600' },
] as const

export default function StatsBar({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon
        return (
          <div
            key={c.key}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
          >
            <div
              className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`}
            />
            <div className="relative">
              <Icon size={18} className="mb-2 text-zinc-400" />
              <p className="text-2xl font-bold text-white">{stats[c.key]}</p>
              <p className="text-xs text-zinc-400">{c.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
