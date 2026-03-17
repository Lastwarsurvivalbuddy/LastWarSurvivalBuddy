'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  SQUAD_POWER_TIER_LABELS,
  RANK_BUCKET_LABELS,
  POWER_BUCKET_LABELS,
  KILL_TIER_LABELS,
  SEASON_LABELS,
  BEGINNER_MODE_DESCRIPTION,
  type SquadPowerTier,
  type RankBucket,
  type PowerBucket,
  type KillTier,
} from '@/lib/profileTypes'

interface ProfileForm {
  commander_name: string
  server_number: string
  server_day: string
  season: number
  hq_level: string
  spend_style: string
  playstyle: string
  troop_type: string
  troop_tier: string
  rank_bucket: RankBucket | ''
  squad_power_tier: SquadPowerTier | ''
  power_bucket: PowerBucket | ''
  kill_tier: KillTier | ''
  update_reminder_frequency: string
  alliance_name: string
  alliance_tag: string
  beginner_mode: boolean
}

const SPEND_OPTIONS = ['f2p', 'budget', 'moderate', 'investor', 'whale', 'mega_whale']
const SPEND_LABELS: Record<string, string> = {
  f2p: 'F2P', budget: 'Budget', moderate: 'Moderate',
  investor: 'Investor', whale: 'Whale', mega_whale: 'Mega Whale',
}

const PLAYSTYLE_OPTIONS = [
  { value: 'fighter',   label: '⚔️ Fighter',   sub: 'Player vs. Player'     },
  { value: 'developer', label: '🎯 Developer', sub: 'Player vs. Event'      },
  { value: 'commander', label: '⚖️ Commander', sub: '50/50 Balanced'        },
  { value: 'scout',     label: '🗺️ Scout',     sub: 'Still Figuring It Out' },
]

const TROOP_TYPES = [
  { value: 'aircraft',        label: '✈️ Aircraft' },
  { value: 'tank',            label: '🛡️ Tank' },
  { value: 'missile vehicle', label: '🚀 Missile Vehicle' },
  { value: 'mixed',           label: '⚖️ Mixed' },
]

const TROOP_TIERS = [
  { value: 'under_t10', label: 'Under T10' },
  { value: 't10',       label: 'T10' },
  { value: 't11',       label: 'T11' },
]

const SEASONS = [0, 1, 2, 3, 4, 5]

const HQ_SHORTCUTS = [5, 10, 15, 20, 25, 30, 35]

const REMINDER_OPTIONS = [
  { value: 'daily',  label: 'Daily',  sub: 'Every day'    },
  { value: 'weekly', label: 'Weekly', sub: 'Every 7 days' },
  { value: 'off',    label: 'Off',    sub: 'No reminders' },
]

function calcServerStartDate(serverDay: number): string {
  const d = new Date()
  d.setDate(d.getDate() - (serverDay - 1))
  return d.toISOString().split('T')[0]
}

const NAME_REGEX = /^[a-zA-Z0-9_ ]{3,20}$/

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function ProfileEditPage() {
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>({
    commander_name: '',
    server_number: '',
    server_day: '',
    season: 0,
    hq_level: '',
    spend_style: '',
    playstyle: '',
    troop_type: '',
    troop_tier: '',
    rank_bucket: '',
    squad_power_tier: '',
    power_bucket: '',
    kill_tier: '',
    update_reminder_frequency: 'weekly',
    alliance_name: '',
    alliance_tag: '',
    beginner_mode: false,
  })
  const [originalName, setOriginalName] = useState('')
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null)
  const [nameChecking, setNameChecking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Snapshot of last-saved form — used to compute isDirty
  const savedSnapshot = useRef<ProfileForm | null>(null)
  const isDirty = savedSnapshot.current !== null &&
    JSON.stringify(form) !== JSON.stringify(savedSnapshot.current)

  // Warn on browser refresh / tab close when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => { loadProfile() }, [])

  useEffect(() => {
    if (!form.commander_name || form.commander_name === originalName) {
      setNameAvailable(null)
      return
    }
    if (!NAME_REGEX.test(form.commander_name)) {
      setNameAvailable(null)
      return
    }
    const timer = setTimeout(async () => {
      setNameChecking(true)
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('commander_name', form.commander_name)
        .maybeSingle()
      setNameAvailable(!data)
      setNameChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [form.commander_name, originalName])

  async function loadProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      const loaded: ProfileForm = {
        commander_name:            data.commander_name || '',
        server_number:             data.server_number?.toString() || '',
        server_day:                data.server_day?.toString() || '',
        season:                    data.season ?? 0,
        hq_level:                  data.hq_level?.toString() || '',
        spend_style:               data.spend_style || '',
        playstyle:                 data.playstyle || '',
        troop_type:                data.troop_type || '',
        troop_tier:                data.troop_tier || '',
        rank_bucket:               data.rank_bucket || '',
        squad_power_tier:          data.squad_power_tier || '',
        power_bucket:              data.power_bucket || '',
        kill_tier:                 data.kill_tier || '',
        update_reminder_frequency: data.update_reminder_frequency || 'weekly',
        alliance_name:             data.alliance_name || '',
        alliance_tag:              data.alliance_tag || '',
        beginner_mode:             data.beginner_mode ?? false,
      }

      setForm(loaded)
      savedSnapshot.current = loaded
      setOriginalName(data.commander_name || '')
    } catch {
      setErrorMsg('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  function set<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaveStatus('idle')
  }

  // Navigate back — warn if dirty
  const handleBack = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Leave without saving?')
      if (!confirmed) return
    }
    router.push('/dashboard')
  }, [isDirty, router])

  async function handleSave() {
    setErrorMsg('')

    if (!NAME_REGEX.test(form.commander_name)) {
      setErrorMsg('Commander tag must be 3–20 characters: letters, numbers, underscores, spaces only.')
      return
    }
    if (form.commander_name !== originalName && nameAvailable === false) {
      setErrorMsg('That Commander tag is already taken.')
      return
    }

    setSaveStatus('saving')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/signin'); return }

      const serverDay = form.server_day ? parseInt(form.server_day) : null

      const updates: Record<string, unknown> = {
        commander_name:            form.commander_name,
        server_number:             form.server_number ? parseInt(form.server_number) : null,
        server_day:                serverDay,
        season:                    form.season ?? 0,
        hq_level:                  form.hq_level ? parseInt(form.hq_level) : null,
        spend_style:               form.spend_style || null,
        playstyle:                 form.playstyle || null,
        troop_type:                form.troop_type || null,
        troop_tier:                form.troop_tier || null,
        rank_bucket:               form.rank_bucket || null,
        squad_power_tier:          form.squad_power_tier || null,
        power_bucket:              form.power_bucket || null,
        kill_tier:                 form.kill_tier || null,
        update_reminder_frequency: form.update_reminder_frequency,
        server_start_date:         serverDay ? calcServerStartDate(serverDay) : null,
        alliance_name:             form.alliance_name || null,
        alliance_tag:              form.alliance_tag || null,
        beginner_mode:             form.beginner_mode,
        last_profile_update:       new Date().toISOString(),
        updated_at:                new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)

      if (error) throw error

      // Update snapshot so isDirty resets to false
      savedSnapshot.current = { ...form }
      setOriginalName(form.commander_name)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save. Try again.')
      setSaveStatus('error')
    }
  }

  const nameChanged = form.commander_name !== originalName
  const nameValid   = NAME_REGEX.test(form.commander_name)

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-mono">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/95 sticky top-0 z-20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isDirty ? <span className="text-amber-400">Dashboard</span> : 'Dashboard'}
          </button>
          <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            Edit Profile{isDirty ? <span className="text-amber-500 ml-1">·</span> : ''}
          </span>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`
              text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-150
              ${saveStatus === 'saved'
                ? 'bg-green-700 text-green-100'
                : saveStatus === 'saving'
                ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                : isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
                : 'bg-zinc-700 text-zinc-500 cursor-default'}
            `}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 pb-20">

        {errorMsg && (
          <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* ── Identity ── */}
        <section className="space-y-4">
          <SectionHeader label="Identity" />

          <Field label="Commander Tag" hint="3–20 chars · letters, numbers, underscores, spaces">
            <div className="relative">
              <input
                type="text"
                value={form.commander_name}
                onChange={e => set('commander_name', e.target.value)}
                maxLength={20}
                placeholder="Your Tag"
                className="input-base pr-8"
              />
              {nameChanged && nameValid && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono">
                  {nameChecking
                    ? <span className="text-zinc-500">...</span>
                    : nameAvailable === true
                    ? <span className="text-green-400">✓</span>
                    : nameAvailable === false
                    ? <span className="text-red-400">✗</span>
                    : null}
                </div>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Server Number">
              <input
                type="number"
                value={form.server_number}
                onChange={e => set('server_number', e.target.value)}
                placeholder="e.g. 1032"
                className="input-base"
              />
            </Field>
            <Field label="Server Day" hint="Tap VIP emblem to find">
              <input
                type="number"
                value={form.server_day}
                onChange={e => set('server_day', e.target.value)}
                placeholder="e.g. 502"
                className="input-base"
              />
            </Field>
          </div>

          <Field label="Profile update reminders" hint="Keeps Buddy accurate as you level up">
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('update_reminder_frequency', opt.value)}
                  className={`
                    text-left px-3 py-2.5 rounded-lg border transition-all
                    ${form.update_reminder_frequency === opt.value
                      ? 'border-amber-500 bg-amber-950/40'
                      : 'border-zinc-700 hover:border-zinc-500'}
                  `}
                >
                  <div className="text-sm font-semibold text-zinc-100">{opt.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </Field>
        </section>

        {/* ── Alliance ── */}
        <section className="space-y-4">
          <SectionHeader label="Alliance" />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Alliance Name">
                <input
                  type="text"
                  value={form.alliance_name}
                  onChange={e => set('alliance_name', e.target.value)}
                  maxLength={32}
                  placeholder="e.g. Iron Wolves"
                  className="input-base"
                />
              </Field>
            </div>
            <div>
              <Field label="Tag">
                <input
                  type="text"
                  value={form.alliance_tag}
                  onChange={e => set('alliance_tag', e.target.value)}
                  maxLength={8}
                  placeholder="[IW]"
                  className="input-base"
                />
              </Field>
            </div>
          </div>
        </section>

        {/* ── Base ── */}
        <section className="space-y-4">
          <SectionHeader label="Base" />

          <Field label="Season">
            <div className="flex flex-wrap gap-2">
              {SEASONS.map(s => (
                <Chip
                  key={s}
                  label={SEASON_LABELS[s]}
                  selected={form.season === s}
                  onClick={() => set('season', s)}
                />
              ))}
            </div>
          </Field>

          <Field label="HQ Level">
            <input
              type="number"
              value={form.hq_level}
              onChange={e => set('hq_level', e.target.value)}
              placeholder="e.g. 35"
              min={1} max={40}
              className="input-base mb-2"
            />
            <div className="flex flex-wrap gap-2">
              {HQ_SHORTCUTS.map(n => (
                <button
                  key={n}
                  onClick={() => set('hq_level', n.toString())}
                  className={`
                    text-xs px-2.5 py-1 rounded-md border font-mono transition-all
                    ${form.hq_level === n.toString()
                      ? 'bg-amber-500 border-amber-500 text-black font-bold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </section>

        {/* ── Playstyle ── */}
        <section className="space-y-4">
          <SectionHeader label="Playstyle" />

          <Field label="Spend Style">
            <div className="flex flex-wrap gap-2">
              {SPEND_OPTIONS.map(opt => (
                <Chip
                  key={opt}
                  label={SPEND_LABELS[opt]}
                  selected={form.spend_style === opt}
                  onClick={() => set('spend_style', opt)}
                />
              ))}
            </div>
          </Field>

          <Field label="Playstyle">
            <div className="grid grid-cols-2 gap-2">
              {PLAYSTYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('playstyle', opt.value)}
                  className={`
                    text-left px-3 py-2.5 rounded-lg border transition-all
                    ${form.playstyle === opt.value
                      ? 'border-amber-500 bg-amber-950/40'
                      : 'border-zinc-700 hover:border-zinc-500'}
                  `}
                >
                  <div className="text-sm font-semibold text-zinc-100">{opt.label}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </Field>

          {/* ── Beginner Mode ── */}
          <div
            onClick={() => set('beginner_mode', !form.beginner_mode)}
            className={`
              flex items-start gap-4 px-4 py-4 rounded-xl border cursor-pointer transition-all
              ${form.beginner_mode
                ? 'border-amber-500 bg-amber-950/30'
                : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/40'}
            `}
          >
            <div className={`
              relative mt-0.5 flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200
              ${form.beginner_mode ? 'bg-amber-500' : 'bg-zinc-600'}
            `}>
              <div className={`
                absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                ${form.beginner_mode ? 'translate-x-5' : 'translate-x-0.5'}
              `} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-zinc-100">Beginner Mode</div>
              <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{BEGINNER_MODE_DESCRIPTION}</div>
            </div>
          </div>
        </section>

        {/* ── Troops ── */}
        <section className="space-y-4">
          <SectionHeader label="Troops" />

          <Field label="Squad 1 Troop Type" hint="Your highest-power squad">
            <div className="flex flex-wrap gap-2">
              {TROOP_TYPES.map(opt => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={form.troop_type === opt.value}
                  onClick={() => set('troop_type', opt.value)}
                />
              ))}
            </div>
          </Field>

          <Field label="Troop Tier">
            <div className="flex flex-wrap gap-2">
              {TROOP_TIERS.map(opt => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={form.troop_tier === opt.value}
                  onClick={() => set('troop_tier', opt.value)}
                />
              ))}
            </div>
          </Field>
        </section>

        {/* ── Rank & Power ── */}
        <section className="space-y-4">
          <SectionHeader label="Rank & Power" />

          <Field label="Server Rank" hint="Rankings → Total Hero Power">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(RANK_BUCKET_LABELS) as [RankBucket, string][]).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={form.rank_bucket === key}
                  onClick={() => set('rank_bucket', key)}
                />
              ))}
            </div>
          </Field>

          <Field label="Squad 1 Power" hint="Tap Squad 1 in Battle screen">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(SQUAD_POWER_TIER_LABELS) as [SquadPowerTier, string][]).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={form.squad_power_tier === key}
                  onClick={() => set('squad_power_tier', key)}
                />
              ))}
            </div>
          </Field>

          <Field label="Total Individual Power" hint="Your profile page">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(POWER_BUCKET_LABELS) as [PowerBucket, string][]).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={form.power_bucket === key}
                  onClick={() => set('power_bucket', key)}
                />
              ))}
            </div>
          </Field>

          <Field label="Kill Tier" hint="Profile → Combat Stats">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(KILL_TIER_LABELS) as [KillTier, string][]).map(([key, label]) => (
                <Chip
                  key={key}
                  label={label}
                  selected={form.kill_tier === key}
                  onClick={() => set('kill_tier', key)}
                />
              ))}
            </div>
          </Field>
        </section>

        {/* Save button (bottom) */}
        <div className="pt-2">
          {errorMsg && (
            <p className="text-red-400 text-sm mb-3">{errorMsg}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`
              w-full py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-[0.98]
              ${saveStatus === 'saved'
                ? 'bg-green-700 text-green-100'
                : saveStatus === 'saving'
                ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                : isDirty
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-zinc-700 text-zinc-500'}
            `}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Profile Saved' : isDirty ? 'Save Changes' : 'No Changes'}
          </button>
        </div>

      </main>

      <style jsx global>{`
        .input-base {
          width: 100%;
          background: #18181b;
          border: 1px solid #3f3f46;
          border-radius: 8px;
          color: #f4f4f5;
          font-size: 14px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .input-base:focus { border-color: #f59e0b; }
        .input-base::placeholder { color: #52525b; }
        .input-base[type=number]::-webkit-inner-spin-button,
        .input-base[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="text-xs font-semibold text-zinc-300">{label}</label>
        {hint && <span className="text-[10px] text-zinc-600 font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        text-xs px-3 py-1.5 rounded-full border transition-all duration-150 font-medium
        ${selected
          ? 'bg-amber-500 border-amber-500 text-black'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'}
      `}
    >
      {label}
    </button>
  )
}
