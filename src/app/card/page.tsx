'use client'

// src/app/card/page.tsx
// Commander Card page — shareable stats card
// Last updated: March 9, 2026 — bucket fields + kill tier insignias

import { useEffect, useState, useRef, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  SQUAD_POWER_TIER_LABELS,
  RANK_BUCKET_LABELS,
  KILL_TIER_TITLES,
  type SquadPowerTier,
  type RankBucket,
  type KillTier,
} from '@/lib/profileTypes'

interface Profile {
  commander_name: string
  server_number?: number
  computed_server_day?: number
  server_day?: number
  hq_level?: number
  troop_tier?: string
  troop_type?: string
  squad_power_tier?: SquadPowerTier
  rank_bucket?: RankBucket
  kill_tier?: KillTier
  alliance_name?: string
  alliance_tag?: string
  season?: number
  subscription_tier?: string
}

function formatTroopTier(tier?: string): string {
  if (!tier) return '—'
  const map: Record<string, string> = {
    under_t10: 'Under T10',
    t10:       'T10',
    t11:       'T11',
  }
  return map[tier] ?? tier.toUpperCase()
}

function formatTroopType(t?: string): string {
  if (!t) return '—'
  const map: Record<string, string> = {
    aircraft:          '✈️ Aircraft',
    tank:              '🛡️ Tank',
    'missile vehicle': '🚀 Missile',
    mixed:             '⚖️ Mixed',
  }
  return map[t.toLowerCase()] ?? t
}

// ─── Kill Tier Insignia ───────────────────────────────────────────────────────

function KillInsignia({ tier, size = 48 }: { tier: KillTier; size?: number }): ReactElement | null {
  const gold = '#C9A84C'
  const goldLight = '#F0D080'
  const goldDark = '#8B6914'
  const silver = '#A8A8B0'

  const insignias: Record<KillTier, ReactElement> = {
    under_500k: (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <polyline points="12,38 32,22 52,38" stroke={silver} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    '500k': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <polyline points="12,42 32,26 52,42" stroke={silver} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="12,32 32,16 52,32" stroke={silver} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    '1m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="26" r="13" fill={gold} opacity="0.15" stroke={gold} strokeWidth="1.5"/>
        <ellipse cx="32" cy="24" rx="9" ry="10" fill={gold} opacity="0.9"/>
        <rect x="26" y="33" width="12" height="5" rx="1" fill={gold} opacity="0.9"/>
        <circle cx="28" cy="23" r="2.5" fill="#000" opacity="0.7"/>
        <circle cx="36" cy="23" r="2.5" fill="#000" opacity="0.7"/>
        <rect x="16" y="46" width="32" height="4" rx="2" fill={gold}/>
      </svg>
    ),
    '2m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <ellipse cx="32" cy="22" rx="9" ry="10" fill={gold} opacity="0.9"/>
        <rect x="26" y="31" width="12" height="5" rx="1" fill={gold} opacity="0.9"/>
        <circle cx="28" cy="21" r="2.5" fill="#000" opacity="0.7"/>
        <circle cx="36" cy="21" r="2.5" fill="#000" opacity="0.7"/>
        <rect x="16" y="43" width="32" height="3.5" rx="1.5" fill={gold}/>
        <rect x="16" y="49" width="32" height="3.5" rx="1.5" fill={gold}/>
      </svg>
    ),
    '3m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <line x1="14" y1="14" x2="50" y2="50" stroke={gold} strokeWidth="4" strokeLinecap="round"/>
        <line x1="50" y1="14" x2="14" y2="50" stroke={gold} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="4" fill={gold} opacity="0.3" stroke={gold} strokeWidth="1.5"/>
        <circle cx="32" cy="32" r="2" fill={gold}/>
      </svg>
    ),
    '5m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 8 L20 28 L8 24 L20 36 L16 52 L32 42 L48 52 L44 36 L56 24 L44 28 Z" fill={gold} opacity="0.85" stroke={gold} strokeWidth="1"/>
        <circle cx="32" cy="30" r="3" fill={goldLight} opacity="0.9"/>
      </svg>
    ),
    '10m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 6 L18 26 L4 22 L18 36 L14 54 L32 43 L50 54 L46 36 L60 22 L46 26 Z" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <circle cx="32" cy="28" r="6" fill={goldDark} stroke={goldLight} strokeWidth="1"/>
        <circle cx="32" cy="28" r="3" fill={goldLight}/>
      </svg>
    ),
    '15m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 5 L19 23 L5 19 L19 33 L15 50 L32 40 L49 50 L45 33 L59 19 L45 23 Z" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <circle cx="32" cy="26" r="5" fill={goldDark} stroke={goldLight} strokeWidth="1"/>
        <circle cx="32" cy="26" r="2.5" fill={goldLight}/>
        <rect x="14" y="53" width="36" height="4" rx="2" fill={goldLight}/>
      </svg>
    ),
    '20m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M32 4 L20 21 L6 17 L20 30 L16 47 L32 38 L48 47 L44 30 L58 17 L44 21 Z" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <circle cx="32" cy="24" r="5" fill={goldDark} stroke={goldLight} strokeWidth="1"/>
        <circle cx="32" cy="24" r="2.5" fill={goldLight}/>
        <rect x="14" y="50" width="36" height="3.5" rx="1.5" fill={goldLight}/>
        <rect x="14" y="56" width="36" height="3.5" rx="1.5" fill={goldLight}/>
      </svg>
    ),
    '25m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M16 20 L16 10 L22 16 L32 8 L42 16 L48 10 L48 20" stroke={goldLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <ellipse cx="32" cy="34" rx="12" ry="13" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <rect x="24" y="44" width="16" height="6" rx="1" fill={gold} stroke={goldLight} strokeWidth="1"/>
        <circle cx="27" cy="32" r="3" fill="#000" opacity="0.6"/>
        <circle cx="37" cy="32" r="3" fill="#000" opacity="0.6"/>
      </svg>
    ),
    '50m': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M4 34 C4 34 8 24 14 28 C14 28 16 20 20 24" stroke={goldLight} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M60 34 C60 34 56 24 50 28 C50 28 48 20 44 24" stroke={goldLight} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M18 16 L18 8 L23 13 L32 6 L41 13 L46 8 L46 16" stroke={goldLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <ellipse cx="32" cy="32" rx="10" ry="11" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <rect x="25" y="41" width="14" height="5" rx="1" fill={gold} stroke={goldLight} strokeWidth="1"/>
        <circle cx="28" cy="30" r="2.5" fill="#000" opacity="0.6"/>
        <circle cx="36" cy="30" r="2.5" fill="#000" opacity="0.6"/>
      </svg>
    ),
    '100m_plus': (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <polygon points="32,2 38,22 58,22 43,34 49,54 32,42 15,54 21,34 6,22 26,22" fill={gold} stroke={goldLight} strokeWidth="1.5"/>
        <path d="M10 56 L54 56" stroke={goldLight} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M14 61 L50 61" stroke={goldLight} strokeWidth="2" strokeLinecap="round"/>
        <ellipse cx="32" cy="30" rx="7" ry="8" fill={goldDark} stroke={goldLight} strokeWidth="1"/>
        <circle cx="29" cy="29" r="2" fill="#000" opacity="0.7"/>
        <circle cx="35" cy="29" r="2" fill="#000" opacity="0.7"/>
      </svg>
    ),
  }

  return insignias[tier] ?? null
}

// ─── The Card ─────────────────────────────────────────────────────────────────
function CommanderCard({
  profile,
  cardRef,
}: {
  profile: Profile
  cardRef: React.RefObject<HTMLDivElement | null>
}) {
  const serverDay = profile.computed_server_day ?? profile.server_day
  const squadPower = profile.squad_power_tier ? SQUAD_POWER_TIER_LABELS[profile.squad_power_tier] : '—'
  const rank       = profile.rank_bucket      ? RANK_BUCKET_LABELS[profile.rank_bucket]           : '—'
  const killTitle  = profile.kill_tier        ? KILL_TIER_TITLES[profile.kill_tier]                : null

  return (
    <div
      ref={cardRef}
      style={{
        width: 600,
        height: 315,
        background: '#080a0e',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Rajdhani", "Oswald", sans-serif',
        flexShrink: 0,
      }}
    >
      {/* Scanline texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none',
      }} />

      {/* Gold corners */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 120, height: 3, background: 'linear-gradient(90deg, #c9a84c, transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: 120, background: 'linear-gradient(180deg, #c9a84c, transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 120, height: 3, background: 'linear-gradient(270deg, #c9a84c, transparent)', zIndex: 2 }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 3, height: 120, background: 'linear-gradient(0deg, #c9a84c, transparent)', zIndex: 2 }} />

      {/* Diagonal slash */}
      <div style={{ position: 'absolute', top: -40, right: 80, width: 2, height: 420, background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.08), transparent)', transform: 'rotate(15deg)', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: -40, right: 130, width: 1, height: 420, background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.05), transparent)', transform: 'rotate(15deg)', zIndex: 1 }} />

      {/* Radial glow */}
      <div style={{ position: 'absolute', top: -60, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)', zIndex: 1 }} />

      {/* Kill tier insignia — top right */}
      {profile.kill_tier && (
        <div style={{
          position: 'absolute', top: 18, right: 20, zIndex: 4,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        }}>
          <KillInsignia tier={profile.kill_tier} size={44} />
          {killTitle && (
            <div style={{ fontSize: 7, fontWeight: 700, color: '#c9a84c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {killTitle}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '28px 32px', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 4, padding: '4px 10px',
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a84c' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#c9a84c', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Server {profile.server_number ?? '—'} · Day {serverDay ?? '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: profile.kill_tier ? 68 : 0 }}>
            <div style={{ width: 18, height: 18, background: '#c9a84c', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" fill="#080a0e" viewBox="0 0 16 16">
                <path d="M8 1L2 5v6l6 4 6-4V5L8 1z" />
              </svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#7a6030', letterSpacing: '0.2em' }}>
              LASTWARSURVIVALBUDDY.COM
            </span>
          </div>
        </div>

        {/* Commander name */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7a6030', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 4 }}>
            Commander
          </div>
          <div style={{
            fontSize: 52, fontWeight: 700, color: '#e8c96a',
            letterSpacing: '0.02em', lineHeight: 1,
            textShadow: '0 0 40px rgba(201,168,76,0.3)',
          }}>
            {profile.commander_name || 'COMMANDER'}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
          {[
            { label: 'HQ',        value: profile.hq_level ? `HQ ${profile.hq_level}` : '—' },
            { label: 'Troops',    value: formatTroopTier(profile.troop_tier) },
            { label: 'Squad 1 Type', value: formatTroopType(profile.troop_type) },
            { label: 'Squad 1',   value: squadPower },
            { label: 'Rank',      value: rank },
            { label: 'Kill Tier', value: killTitle ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(201,168,76,0.12)',
              borderRadius: 6, padding: '8px 10px',
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#7a6030', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e6e0', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom border */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
        zIndex: 4,
      }} />
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }

      const { data } = await supabase
        .from('commander_profile')
        .select('commander_name, server_number, server_day, computed_server_day, hq_level, troop_tier, troop_type, squad_power_tier, rank_bucket, kill_tier, alliance_name, alliance_tag, season, subscription_tier')
        .eq('id', session.user.id)
        .single()

      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function downloadCard() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canvas = await html2canvas(cardRef.current, {
        background: '#080a0e',
        useCORS: true,
        logging: false,
      } as any)
      const link = document.createElement('a')
      link.download = `commander-${profile?.commander_name || 'card'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed', err)
    } finally {
      setDownloading(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText('https://lastwarsurvivalbuddy.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Profile not found.
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');`}</style>

      <div className="min-h-screen bg-zinc-950 text-white">

        <header className="border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-20 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </button>
            <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">Commander Card</span>
            <div className="w-16" />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-8">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
              Your Commander Card
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Share it in Discord, Reddit, or anywhere you rep your server.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div style={{ transformOrigin: 'top center' }} className="max-w-full overflow-x-auto">
              <CommanderCard profile={profile} cardRef={cardRef} />
            </div>
          </div>

          <p className="text-[11px] text-zinc-600 text-center max-w-sm leading-relaxed">
            Stats are self-reported — keep your profile current for accuracy.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={downloadCard}
              disabled={downloading}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Rendering...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download Card
                </>
              )}
            </button>

            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all active:scale-[0.98]"
            >
              {copied ? (
                <><span className="text-green-400">✓</span> Link copied!</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                    <path d="M6 4H4a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-2M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copy LWSB Link
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 16 16">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 4v4M8 11v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Card reflects your current profile.{' '}
            <button onClick={() => router.push('/profile/edit')} className="text-amber-600 hover:text-amber-400 underline transition-colors">
              Update stats
            </button>
          </div>

        </main>
      </div>
    </>
  )
}
