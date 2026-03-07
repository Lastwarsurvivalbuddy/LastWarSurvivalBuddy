'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DailyActionPlan from '@/components/DailyActionPlan'
import TeachBuddy from '@/components/TeachBuddy'

interface Profile {
  id: string
  commander_name: string
  hq_level: number
  troop_tier: string
  troop_type: string
  playstyle: string
  spend_style: string
  server_rank?: number
  hero_power?: number
  total_power?: number
  goals?: string[]
  server_number?: number
  server_day?: number
  subscription_tier?: string
  onboarding_complete?: boolean
}

// Alliance Duel day helper (mirrors actionPlan.ts)
function getDuelDay(): { day: number; name: string; points: number } {
  const duelDays: Record<number, { name: string; points: number }> = {
    1: { name: 'Drones', points: 1 },
    2: { name: 'Building', points: 2 },
    3: { name: 'Research', points: 2 },
    4: { name: 'Heroes', points: 2 },
    5: { name: 'Training', points: 2 },
    6: { name: 'Enemy Buster', points: 4 },
    7: { name: 'Reset', points: 0 },
  }
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcDay = now.getUTCDay()
  const adjustedDay = utcHour < 2 ? (utcDay === 0 ? 6 : utcDay - 1) : utcDay
  const dayMap: Record<number, number> = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }
  const day = dayMap[adjustedDay] ?? 1
  return { day, ...duelDays[day] }
}

function formatPower(val?: number): string {
  if (!val) return '—'
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`
  return val.toString()
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const duel = getDuelDay()

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/signin')
          return
        }

        const { data, error } = await supabase
          .from('commander_profile')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        if (!data?.onboarding_complete) {
          router.push('/onboarding')
          return
        }

        setProfile(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-mono">Loading Intel...</p>
        </div>
      </div>
    )
  }

  // ─── ERROR ───
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-sm">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/signin')}
            className="text-zinc-400 text-xs underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // ─── DASHBOARD ───
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Top nav bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-sm flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1L2 5v6l6 4 6-4V5L8 1z" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wide text-white">
              LWSB
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Duel day badge */}
            <div className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider
              ${duel.day === 6 ? 'bg-red-900/60 text-red-300 border border-red-800' :
                duel.day === 7 ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                'bg-amber-900/40 text-amber-300 border border-amber-800/60'}
            `}>
              <div className={`w-1.5 h-1.5 rounded-full ${duel.day === 6 ? 'bg-red-400 animate-pulse' : duel.day === 7 ? 'bg-zinc-500' : 'bg-amber-400'}`} />
              DAY {duel.day} · {duel.name.toUpperCase()}
            </div>

            <button
              onClick={handleSignOut}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-24">

        {/* ══════════════════════════════════════════
            DAILY ACTION PLAN — TOP OF DASHBOARD
        ══════════════════════════════════════════ */}
        <section className="pt-6 pb-2">
          <DailyActionPlan profile={profile} />
          <TeachBuddy serverNumber={Number(profile.server_number)} />
        </section>

        {/* Divider */}
        <div className="my-6 h-px bg-zinc-800" />

        {/* ══════════════════════════════════════════
            COMMANDER PROFILE SNAPSHOT
        ══════════════════════════════════════════ */}
        <section>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-3">
            Commander Profile
          </p>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">

            {/* Name + tier */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  {profile.commander_name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Server {profile.server_number} · Day {profile.server_day}
                </p>
              </div>
              <div className="text-right">
                <span className={`
                  text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded font-mono
                  ${profile.subscription_tier === 'elite' ? 'bg-amber-900/60 text-amber-300 border border-amber-800' :
                    profile.subscription_tier === 'pro' ? 'bg-sky-900/60 text-sky-300 border border-sky-800' :
                    profile.subscription_tier === 'founding' ? 'bg-purple-900/60 text-purple-300 border border-purple-800' :
                    'bg-zinc-800 text-zinc-500 border border-zinc-700'}
                `}>
                  {profile.subscription_tier ? profile.subscription_tier.toUpperCase() : 'FREE'}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'HQ Level', value: profile.hq_level },
                { label: 'Troop Tier', value: profile.troop_tier?.replace('working_towards_', 'T').replace('unlocked', '✓') || '—' },
                { label: 'Troop Type', value: profile.troop_type || '—' },
                { label: 'Hero Power', value: formatPower(profile.hero_power) },
                { label: 'Server Rank', value: profile.server_rank ? `#${profile.server_rank}` : '—' },
                { label: 'Playstyle', value: profile.playstyle || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-zinc-950/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-zinc-200 truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Goals */}
            {profile.goals && profile.goals.length > 0 && (
              <div>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wide mb-2">
                  Goals
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.goals.map(goal => (
                    <span
                      key={goal}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Edit profile link */}
            <div className="pt-1 border-t border-zinc-800">
              <button
                onClick={() => router.push('/profile/edit')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Edit profile
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════
          FLOATING BUDDY BUTTON
      ══════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-4 z-30">
        <button
          onClick={() => router.push('/buddy')}
          className="
            flex items-center gap-2.5 bg-amber-500 hover:bg-amber-400
            text-black font-bold text-sm px-5 py-3 rounded-full
            shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50
            transition-all duration-200 active:scale-95
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M14 8c0 3.314-2.686 6-6 6a5.97 5.97 0 01-3.2-.928L2 14l.928-2.8A5.97 5.97 0 012 8c0-3.314 2.686-6 6-6s6 2.686 6 6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ask Buddy
        </button>
      </div>

    </div>
  )
}
