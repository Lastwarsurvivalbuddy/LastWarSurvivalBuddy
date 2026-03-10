// src/lib/actionPlan.ts
// Rules engine for daily action plan — zero API cost
// Updated: March 8, 2026 — profile data model redesign (buckets replace raw stats)
// Updated: March 9, 2026 — corrected Alliance Duel day mapping + real game labels

import type { SquadPowerTier, RankBucket, PowerBucket, KillTier } from '@/lib/profileTypes'
import { SQUAD_POWER_TIER_LABELS, RANK_BUCKET_LABELS, KILL_TIER_TITLES } from '@/lib/profileTypes'

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low'
export type ActionCategory =
  | 'arms_race'
  | 'alliance_duel'
  | 'troops'
  | 'heroes'
  | 'research'
  | 'spend'
  | 'defense'
  | 'general'

export interface DailyAction {
  id: string
  category: ActionCategory
  priority: ActionPriority
  title: string
  detail: string
  description?: string
  buddyPrompt: string
  points?: number
  timeRequired?: string
}

export interface ActionPlanResult {
  actions: DailyAction[]
  duelDay: number
  duelDayLabel: string
  duelDayPoints: number
  strategicInsight: string
  greeting: string
  dutyReport: string
  insight: string
}

// ─── Hero EXP Breakpoints ────────────────────────────────────────────────────
// Source: lastwarhandbook.com/calculators/hero-exp

export const HERO_EXP_BREAKPOINTS: Record<number, { expFromL1: number; label: string; hqRequired: number }> = {
  50:  { expFromL1: 2_500_000,   label: 'Early game milestone',         hqRequired: 10 },
  68:  { expFromL1: 4_500_000,   label: 'Major power spike begins',     hqRequired: 14 },
  69:  { expFromL1: 4_500_000,   label: 'Major power spike',            hqRequired: 14 },
  70:  { expFromL1: 4_900_000,   label: 'Skill unlock tier',            hqRequired: 14 },
  72:  { expFromL1: 5_900_000,   label: 'Ultimate enhancement unlock',  hqRequired: 15 },
  100: { expFromL1: 33_000_000,  label: 'Mid-game milestone',           hqRequired: 20 },
  175: { expFromL1: 999_999_999, label: 'Max level',                    hqRequired: 35 },
}

// HQ level → max hero level unlock table
export const HQ_HERO_LEVEL_UNLOCK: Record<number, number> = {
  1:  1,
  5:  30,
  10: 50,
  14: 70,
  15: 72,
  16: 75,
  18: 80,
  20: 100,
  25: 120,
  30: 150,
  35: 175,
}

export function getMaxHeroLevelForHQ(hqLevel: number): number {
  const keys = Object.keys(HQ_HERO_LEVEL_UNLOCK)
    .map(Number)
    .filter(k => k <= hqLevel)
    .sort((a, b) => b - a)
  return keys.length > 0 ? HQ_HERO_LEVEL_UNLOCK[keys[0]] : 1
}

export function getNextHeroMilestone(hqLevel: number): { targetHQ: number; heroLevel: number } | null {
  const entries = Object.entries(HQ_HERO_LEVEL_UNLOCK)
    .map(([hq, lvl]) => ({ targetHQ: Number(hq), heroLevel: lvl }))
    .filter(e => e.targetHQ > hqLevel)
    .sort((a, b) => a.targetHQ - b.targetHQ)
  return entries.length > 0 ? entries[0] : null
}

export function getNextExpBreakpoint(currentHeroLevel: number): { level: number; label: string; expNeeded: number } | null {
  const entry = Object.entries(HERO_EXP_BREAKPOINTS)
    .map(([lvl, data]) => ({ level: Number(lvl), ...data }))
    .filter(e => e.level > currentHeroLevel)
    .sort((a, b) => a.level - b.level)[0]
  return entry ? { level: entry.level, label: entry.label, expNeeded: entry.expFromL1 } : null
}

// ─── Alliance Duel Day Calculation ───────────────────────────────────────────
// Reset is always 2am UTC 
// Subtract 2 hours so the boundary aligns with the 2am UTC reset.
//
// Confirmed schedule (Server 1032, DST active March 2026):
//   2am UTC Mon → Day 1: Radar Training      (1 pt)
//   2am UTC Tue → Day 2: Base Expansion       (2 pts)
//   2am UTC Wed → Day 3: Age of Science       (2 pts)
//   2am UTC Thu → Day 4: Train Heroes         (2 pts)
//   2am UTC Fri → Day 5: Total Mobilization   (2 pts)
//   2am UTC Sat → Day 6: Enemy Buster         (4 pts)
//   2am UTC Sun → Day 7: Reset                (0 pts)

interface DuelDayResult {
  day: number
  label: string
  points: number
}

export function getDuelDay(now: Date = new Date()): DuelDayResult {
  // Shift back 2 hours so the day boundary aligns with the 2am UTC reset
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const utcDay = adjusted.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat

  const schedule: Record<number, DuelDayResult> = {
    0: { day: 7, label: 'Reset',              points: 0 },
    1: { day: 1, label: 'Radar Training',     points: 1 },
    2: { day: 2, label: 'Base Expansion',     points: 2 },
    3: { day: 3, label: 'Age of Science',     points: 2 },
    4: { day: 4, label: 'Train Heroes',       points: 2 },
    5: { day: 5, label: 'Total Mobilization', points: 2 },
    6: { day: 6, label: 'Enemy Buster',       points: 4 },
  }

  return schedule[utcDay]
}

// ─── Profile Types ───────────────────────────────────────────────────────────

export interface CommanderProfile {
  hq_level: number
  server_day?: number
  season?: number
  spend_style: string
  playstyle: string
  troop_type: string
  troop_tier: string            // under_t10 | t10 | t11
  rank_bucket?: RankBucket
  squad_power_tier?: SquadPowerTier
  power_bucket?: PowerBucket
  kill_tier?: KillTier
  tier?: string                 // subscription tier
}

// ─── Friendly display helpers ────────────────────────────────────────────────

function squadPowerLabel(tier?: SquadPowerTier): string {
  if (!tier) return 'unknown'
  return SQUAD_POWER_TIER_LABELS[tier] ?? tier
}

function rankLabel(bucket?: RankBucket): string {
  if (!bucket) return 'unknown rank'
  return RANK_BUCKET_LABELS[bucket] ?? bucket
}

function killTitle(tier?: KillTier): string {
  if (!tier) return ''
  return KILL_TIER_TITLES[tier] ?? tier
}

// ─── Main Action Plan Generator ──────────────────────────────────────────────

export function generateActionPlan(profile: CommanderProfile): ActionPlanResult {
  const actions: DailyAction[] = []
  const { day, label, points } = getDuelDay()
  const isDoubleDay      = day >= 2 && day <= 5
  const isEnemyBusterDay = day === 6
  const isDroneDay       = day === 1
  const isResetDay       = day === 7

  const hq          = profile.hq_level || 1
  const isEarlyGame = hq < 16
  const isMidGame   = hq >= 16 && hq < 30
  const isEndGame   = hq >= 30

  // Simplified troop tier checks
  const isT11      = profile.troop_tier === 't11'
  const isT10      = profile.troop_tier === 't10'
  const isBelowT10 = profile.troop_tier === 'under_t10'

  const isSpender = ['investor', 'whale', 'mega_whale'].includes(profile.spend_style)

  const maxHeroLevel      = getMaxHeroLevelForHQ(hq)
  const nextHeroMilestone = getNextHeroMilestone(hq)
  const nextBreakpoint    = getNextExpBreakpoint(maxHeroLevel)

  // ── Double-dip days (Days 2–5) ──
  if (isDoubleDay) {
    actions.push({
      id: 'double_dip',
      category: 'alliance_duel',
      priority: 'critical',
      title: `⚡ Double-Dip Day — Duel Day ${day}: ${label} + Arms Race`,
      detail: `Today is Alliance Duel Day ${day} (${label}, ${points} pts). Every action you take for the Duel ALSO scores Arms Race points. This is the highest efficiency play in the game. Focus: ${getDuelFocusDetail(day, profile)}.`,
      buddyPrompt: `Today is Alliance Duel Day ${day} (${label}). Help me maximize both my Duel score AND Arms Race points at the same time. My HQ is ${hq}, troop tier is ${profile.troop_tier}, playstyle is ${profile.playstyle}.`,
      points,
    })
  }

  // ── Enemy Buster Day (Day 6) ──
  if (isEnemyBusterDay) {
    actions.push({
      id: 'enemy_buster',
      category: 'alliance_duel',
      priority: 'critical',
      title: '🔥 Enemy Buster Day — 4 Alliance Points (Max Value)',
      detail: 'Day 6 of Alliance Duel is the highest-value day of the week (4 pts). Your alliance is attacking the opponent server. Coordinate with alliance, maximize kills, use march buffs.',
      buddyPrompt: `Today is Alliance Duel Day 6 — Enemy Buster, worth 4 alliance points. Help me maximize my contribution. My HQ is ${hq}, Squad 1 power is ${squadPowerLabel(profile.squad_power_tier)}, troop type is ${profile.troop_type}, rank is ${rankLabel(profile.rank_bucket)}.`,
      points: 4,
    })
  }

  // ── Radar Training Day (Day 1) ──
  if (isDroneDay) {
    actions.push({
      id: 'radar_training_day',
      category: 'alliance_duel',
      priority: 'medium',
      title: '🚁 Radar Training Day — Alliance Duel Day 1 (1 Point)',
      detail: 'Lowest-value Duel day. Good day to focus on development tasks without sacrificing high-value scoring. Complete drone upgrades if available.',
      buddyPrompt: `Today is Alliance Duel Day 1 (Radar Training, 1 point — lowest value day). What should I focus on to set up for the rest of the week? HQ ${hq}, troop tier ${profile.troop_tier}.`,
      points: 1,
    })
  }

  // ── Hero action ──
  if (!isResetDay) {
    const heroAction = getHeroAction(hq, maxHeroLevel, nextBreakpoint, nextHeroMilestone, profile, day)
    if (heroAction) actions.push(heroAction)
  }

  // ── Total Mobilization Day (Day 5) ──
  if (day === 5) {
    actions.push({
      id: 'troop_training_duel',
      category: 'troops',
      priority: 'high',
      title: '🪖 Total Mobilization — Max Troop Training for Duel + Arms Race',
      detail: `Duel Day 5 is Total Mobilization. Every troop you train scores Alliance Duel AND Arms Race points simultaneously. Queue up as much ${profile.troop_type} training as possible. ${isBelowT10 ? 'Focus on highest tier available.' : isT10 ? 'Push T10 training.' : 'T11 training maximizes point value.'}`,
      buddyPrompt: `Today is Duel Day 5 — Total Mobilization. I want to maximize troop training for both Alliance Duel and Arms Race scoring. My troop type is ${profile.troop_type}, tier is ${profile.troop_tier}, HQ ${hq}. What's the optimal training strategy?`,
    })
  }

  // ── Age of Science Day (Day 3) ──
  if (day === 3) {
    actions.push({
      id: 'research_duel',
      category: 'research',
      priority: 'high',
      title: '🔬 Age of Science — Complete Research for Duel + Arms Race',
      detail: `Duel Day 3 is Age of Science. Completing research scores both Duel and Arms Race points. ${isT11 ? 'Focus on T11 Armament Research branches.' : isT10 ? 'Push military research toward T11 unlock.' : 'Complete highest available military research.'}`,
      buddyPrompt: `Today is Duel Day 3 — Age of Science. What research should I prioritize to maximize both Alliance Duel and Arms Race scoring? HQ ${hq}, troop tier ${profile.troop_tier}, troop type ${profile.troop_type}.`,
    })
  }

  // ── Base Expansion Day (Day 2) ──
  if (day === 2) {
    actions.push({
      id: 'building_duel',
      category: 'alliance_duel',
      priority: 'high',
      title: '🏗️ Base Expansion — Upgrade Buildings for Duel + Arms Race',
      detail: `Duel Day 2 is Base Expansion. Complete building upgrades today to score Duel and Arms Race points. ${isEarlyGame ? 'Prioritize Barracks and Military Academy.' : isMidGame ? 'Focus on production and military buildings.' : 'Push high-level military buildings and Overlord.'}`,
      buddyPrompt: `Today is Duel Day 2 — Base Expansion. What buildings should I upgrade to maximize both Alliance Duel and Arms Race scoring? HQ ${hq}, server day ${profile.server_day}.`,
    })
  }

  // ── T10 unlock path ──
  if (isBelowT10 && !isDoubleDay) {
    actions.push({
      id: 't10_path',
      category: 'troops',
      priority: 'high',
      title: '🎯 T10 Unlock Path — Check Your Prerequisites',
      detail: `You're working toward T10. T10 unlocks at HQ 16 with specific Barracks and research requirements. ${hq < 16 ? `You're HQ ${hq} — focus on reaching HQ 16 as your primary goal.` : 'You have the HQ level — check research prerequisites in the Military tree.'}`,
      buddyPrompt: `I'm working toward T10 troops. I'm at HQ ${hq}, server day ${profile.server_day}, troop tier ${profile.troop_tier}. What are my exact T10 unlock prerequisites and what should I do today to get there faster?`,
    })
  }

  // ── T11 Armament Research ──
  if (isT11 && !isDoubleDay) {
    actions.push({
      id: 't11_armament',
      category: 'troops',
      priority: 'high',
      title: '⚙️ T11 Armament Research — Check Branch Progress',
      detail: 'T11 Armament Research has multiple branches (Ground, Air, Missile, Accessories). Each branch unlocks different T11 unit advantages. Review current branch completion and queue next materials.',
      buddyPrompt: `I'm working on T11 Armament Research. My troop type is ${profile.troop_type} and I'm HQ ${hq}. Help me prioritize which T11 branches to focus on and what materials I need to queue next.`,
    })
  }

  // ── Hot Deals (spenders) ──
  if (isSpender) {
    actions.push({
      id: 'hot_deal_check',
      category: 'spend',
      priority: 'medium',
      title: "💰 Check Today's Hot Deals",
      detail: `As an ${profile.spend_style} tier player, check today's Hot Deals for time-limited offers. Best value deals align with your current bottleneck. Screenshot any active deal and ask Buddy if it's worth buying.`,
      buddyPrompt: `I'm an ${profile.spend_style} player at HQ ${hq} with ${profile.troop_tier} troops, Squad 1 power ${squadPowerLabel(profile.squad_power_tier)}. I want to evaluate today's Hot Deals. What should I be looking for and what's my current biggest bottleneck that a pack could solve?`,
    })
  }

  // ── Defense review (end game) ──
  if (isEndGame && !isDoubleDay) {
    actions.push({
      id: 'defense_review',
      category: 'defense',
      priority: 'low',
      title: '🛡️ Defense Review — Check Squad Position Balance',
      detail: 'Squads engage in position order (1→2→3→4), not by squad label. Ensure your strongest squad is in position 1. Consider troop type counter advantages when arranging.',
      buddyPrompt: `Help me review my defense setup. Squads engage by position order 1→2→3→4. My troop type is ${profile.troop_type}, HQ ${hq}, Squad 1 power ${squadPowerLabel(profile.squad_power_tier)}, rank ${rankLabel(profile.rank_bucket)}${profile.kill_tier ? `, kill tier: ${killTitle(profile.kill_tier)}` : ''}. Is my defense optimal?`,
    })
  }

  const strategicInsight = getStrategicInsight(day, label, points, profile, maxHeroLevel, isDoubleDay)

  // Sort by priority
  const priorityOrder: Record<ActionPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return {
    actions: actions.slice(0, 6),
    duelDay: day,
    duelDayLabel: label,
    duelDayPoints: points,
    strategicInsight,
    greeting: `Commander HQ ${hq}`,
    dutyReport: `Server Day ${profile.server_day || '—'} · Duel Day ${day}: ${label}`,
    insight: strategicInsight,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getHeroAction(
  hq: number,
  maxHeroLevel: number,
  nextBreakpoint: ReturnType<typeof getNextExpBreakpoint>,
  nextHeroMilestone: ReturnType<typeof getNextHeroMilestone>,
  profile: CommanderProfile,
  duelDay: number
): DailyAction | null {
  if (duelDay === 4) {
    return {
      id: 'hero_exp_duel',
      category: 'heroes',
      priority: 'critical',
      title: '🦸 Train Heroes Day — Level Up Heroes for Duel + Arms Race',
      detail: `Duel Day 4 is Train Heroes. Every hero level you gain scores Alliance Duel AND Arms Race points simultaneously. At HQ ${hq} your heroes can reach level ${maxHeroLevel}. ${nextBreakpoint ? `Next power spike: level ${nextBreakpoint.level} (${nextBreakpoint.label}).` : 'Push to max level.'}`,
      buddyPrompt: `Today is Duel Day 4 — Train Heroes. I want to level up heroes for maximum Duel and Arms Race scoring. My HQ is ${hq}, max hero level I can reach is ${maxHeroLevel}. ${nextBreakpoint ? `Next key breakpoint is level ${nextBreakpoint.level}: ${nextBreakpoint.label}.` : ''} What heroes should I prioritize and how much EXP do I need?`,
      points: 2,
    }
  }

  if (nextBreakpoint && maxHeroLevel < 175) {
    return {
      id: 'hero_exp_push',
      category: 'heroes',
      priority: 'medium',
      title: `🦸 Hero EXP — Push Toward Level ${nextBreakpoint.level} (${nextBreakpoint.label})`,
      detail: `At HQ ${hq} your heroes can reach level ${maxHeroLevel}. Next key breakpoint is level ${nextBreakpoint.level}: "${nextBreakpoint.label}". ${nextHeroMilestone ? `Tip: Reach HQ ${nextHeroMilestone.targetHQ} to unlock hero level ${nextHeroMilestone.heroLevel}.` : ''} Push one carry hero past the breakpoint before spreading EXP across your squad.`,
      buddyPrompt: `Help me plan my Hero EXP. My HQ is ${hq}, heroes can reach level ${maxHeroLevel}. Next key breakpoint is level ${nextBreakpoint.level} (${nextBreakpoint.label}). How should I allocate EXP across my squad?`,
    }
  }

  return null
}

function getDuelFocusDetail(day: number, profile: CommanderProfile): string {
  switch (day) {
    case 2: return 'complete building upgrades — every completion scores both Duel + Arms Race'
    case 3: return 'complete research — queue and finish military research for double points'
    case 4: return 'level up heroes — every hero level scores Duel + Arms Race simultaneously'
    case 5: return `train ${profile.troop_type} troops — every troop trained scores Duel + Arms Race`
    default: return 'check alliance duel requirements'
  }
}

function getStrategicInsight(
  day: number,
  label: string,
  points: number,
  profile: CommanderProfile,
  maxHeroLevel: number,
  isDoubleDay: boolean
): string {
  if (isDoubleDay) {
    return `Today is one of 4 double-dip days this week. Every action for Alliance Duel Day ${day} (${label}) simultaneously scores Arms Race points. This is the highest efficiency play in the game — most players miss this entirely.`
  }
  if (day === 6) {
    return `Enemy Buster Day is worth 4 Alliance Duel points — the highest of any day. Coordinate with alliance leadership for maximum kill count and impact.`
  }
  if (day === 7) {
    return `Reset day — no Alliance Duel scoring today. Good time to plan the week, check upcoming events, and queue resources for the new duel cycle starting tomorrow (Radar Training Day).`
  }
  if (day === 1) {
    return `Radar Training Day is the lowest-value Duel day (1 point). Use today to stockpile resources and set up for the high-value double-dip days starting tomorrow (Base Expansion, 2 pts).`
  }
  const nextMilestone = getNextHeroMilestone(profile.hq_level)
  return nextMilestone
    ? `HQ ${profile.hq_level} unlocks hero level ${maxHeroLevel}. Reach HQ ${nextMilestone.targetHQ} to unlock hero level ${nextMilestone.heroLevel} — the next major capability jump.`
    : `Your heroes are at max unlock level ${maxHeroLevel} for your HQ. Focus on Armament Research and troop tier progression.`
}

export const generateDailyPlan = generateActionPlan