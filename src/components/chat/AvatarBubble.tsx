'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const AVATARS = ['/avatars/divyansh-1.jpg', '/avatars/divyansh-2.jpg', '/avatars/divyansh-3.jpg']

export default function AvatarBubble({ size = 40 }: { size?: number }) {
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [hasAvatar, setHasAvatar] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setAvatarIndex((i) => (i + 1) % AVATARS.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const initials = 'D'

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-full ring-2 ring-purple-500/50"
      style={{ width: size, height: size }}
    >
      {hasAvatar ? (
        <Image
          src={AVATARS[avatarIndex]}
          alt="Divyansh"
          fill
          className="object-cover"
          onError={() => setHasAvatar(false)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm">
          {initials}
        </div>
      )}
      {/* Online indicator */}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0a1a]" />
    </div>
  )
}
