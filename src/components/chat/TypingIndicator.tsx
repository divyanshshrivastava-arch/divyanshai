export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-xs font-bold ring-2 ring-purple-500/30">
        D
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/5 px-4 py-3 backdrop-blur-sm ring-1 ring-white/10">
        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
      </div>
    </div>
  )
}
