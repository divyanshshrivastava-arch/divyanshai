import { clsx } from 'clsx'

type BadgeVariant = 'answered' | 'forwarded' | 'off_topic' | 'unanswered'

const variants: Record<BadgeVariant, string> = {
  answered: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  forwarded: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  off_topic: 'bg-zinc-500/15 text-zinc-400 ring-1 ring-zinc-500/30',
  unanswered: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
}

const labels: Record<BadgeVariant, string> = {
  answered: 'Answered',
  forwarded: 'Forwarded to Divyansh',
  off_topic: 'Off-topic',
  unanswered: 'Needs Answer',
}

export default function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant]
      )}
    >
      {labels[variant]}
    </span>
  )
}
