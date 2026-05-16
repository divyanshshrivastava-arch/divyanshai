'use client'

import { useState, useEffect, useCallback } from 'react'
import { Lock, RefreshCw, LogOut } from 'lucide-react'
import GradientBackground from '@/components/ui/GradientBackground'
import StatsBar from '@/components/admin/StatsBar'
import QuestionTable from '@/components/admin/QuestionTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { AllQuestion, UnansweredQuestion, AdminStats } from '@/lib/storage'

const PAGE_SIZE = 20

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{
    questions: AllQuestion[]
    unanswered: UnansweredQuestion[]
    stats: AdminStats
    total: number
  } | null>(null)

  const fetchData = useCallback(
    async (pwd: string, p: number) => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/admin/data?page=${p}&pageSize=${PAGE_SIZE}`, {
          headers: { Authorization: `Bearer ${pwd}` },
        })
        if (res.status === 401) {
          setError('Wrong password')
          setAuthed(false)
          sessionStorage.removeItem('admin_pwd')
          return
        }
        if (!res.ok) throw new Error('Failed to load')
        const json = await res.json()
        setData(json)
        setAuthed(true)
        sessionStorage.setItem('admin_pwd', pwd)
      } catch (e) {
        console.error(e)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_pwd')
    if (stored) {
      setPassword(stored)
      fetchData(stored, 1)
    }
  }, [fetchData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    fetchData(password, 1)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pwd')
    setAuthed(false)
    setPassword('')
    setData(null)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    fetchData(password, p)
  }

  if (!authed) {
    return (
      <GradientBackground>
        <div className="flex min-h-[100dvh] items-center justify-center px-4">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                <Lock size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                <p className="text-xs text-zinc-400">Ask Divyansh — internal</p>
              </div>
            </div>
            <label className="mb-2 block text-xs font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-purple-500/20 transition focus:border-purple-500/50 focus:ring-2"
              placeholder="Enter admin password"
            />
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </div>
      </GradientBackground>
    )
  }

  return (
    <GradientBackground>
      <div className="mx-auto min-h-[100dvh] max-w-5xl px-4 py-8 md:px-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-zinc-400">Daily review of conversations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchData(password, page)}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {loading && !data ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size={32} />
          </div>
        ) : data ? (
          <>
            <div className="mb-8">
              <StatsBar stats={data.stats} />
            </div>
            <QuestionTable
              questions={data.questions}
              unanswered={data.unanswered}
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={handlePageChange}
            />
          </>
        ) : null}
      </div>
    </GradientBackground>
  )
}
