'use client'

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050c1a]">
      {/* Animated gradient orbs — DevX cyan/navy palette */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-pulse-slow absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
        <div className="animate-pulse-slow absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl [animation-delay:1s]" />
        <div className="animate-pulse-slow absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl [animation-delay:2s]" />
        <div className="animate-pulse-slow absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-indigo-600/12 blur-3xl [animation-delay:0.5s]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
