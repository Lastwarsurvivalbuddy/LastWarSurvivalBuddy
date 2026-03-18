// src/lib/actionPlan.ts
// Rules engine for daily action plan — zero API cost
// Updated: March 8, 2026 — profile data model redesign
// Updated: March 9, 2026 — corrected Alliance Duel day mapping + real game labels
// Updated: March 17, 2026 — beginner_mode support
// Updated: March 17, 2026 — hero upgrades locked to Day 4 only, greeting uses commander_name
// Updated: March 17, 2026 — beginner full day-by-day rewrite
// Updated: March 17, 2026 — advanced plan Day 1/7 filled in, tier actions gated to correct days
// Updated: March 18, 2026 — T11 Armament Training fires every day; Day 2 split Training+Research;
//                           Day 4 adds hero skills, exclusive weapons, ghost ops;
//                           Day 5 troop copy generalized; defense review removed;
//                           research copy fixed; Sec Sci added

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

// ─── Hero EXP Breakpoints ────────────────────────────────────────────────────────
export const HERO_EXP_BREAKPOINTS: Record<number, { expFromL1: number; label: string; hqRequired: number }> = {
  50:  { expFromL1: 2_500_000,   label: 'Early game milestone',          hqRequired: 10 },
  68:  { expFromL1: 4_500_000,   label: 'Major power spike begins',      hqRequired: 14 },
  69:  { expFromL1: 4_500_000,   label: 'Major power spike',             hqRequired: 14 },
  70:  { expFromL1: 4_900_000,   label: 'Skill unlock tier',             hqRequired: 14 },
  72:  { expFromL1: 5_900_000,   label: 'Ultimate enhancement unlock',   hqRequired: 15 },
  100: { expFromL1: 33_000_000,  label: 'Mid-game milestone',            hqRequired: 20 },
  175: { expFromL1: 999_999_999, label: 'Max level',                     hqRequired: 35 },
}

export const HQ_HERO_LEVEL_UNLOCK: Record<number, number> = {
  1: 1, 5: 30, 10: 50, 14: 70, 15: 72, 16: 75, 18: 80, 20: 100, 25: 120, 30: 150, 35: 175,
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

// ─── Alliance Duel Day Calculation ──────────────────────────────────────────────
// Reset is always 2am UTC — no DST adjustment ever
//
// 2am UTC Mon → Day 1: Radar Training (1 pt)      — drone, radar tasks, gather
// 2am UTC Tue → Day 2: Base Expansion (2 pts)     — complete builds, survivor tickets, gold tasks/trucks
// 2am UTC Wed → Day 3: Age of Science (2 pts)     — research, drone component chests, radar tasks
// 2am UTC Thu → Day 4: Train Heroes (2 pts)       — hero EXP, skills, exclusive weapons, ghost ops ONLY
// 2am UTC Fri → Day 5: Total Mobilization (2 pts) — train + promote all troops to highest tier, radar tasks
// 2am UTC Sat → Day 6: Enemy Buster (4 pts)       — alliance battle, gold tasks/trucks
// 2am UTC Sun → Day 7: Reset (0 pts)              — gather runs, save radar

interface DuelDayResult {
  day: number
  label: string
  points: number
}

export function getDuelDay(now: Date = new Date()): DuelDayResult {
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const utcDay = adjusted.getUTCDay()
  const schedule: Record<number, DuelDayResult> = {
    0: { day: 7, label: 'Reset',               points: 0 },
    1: { day: 1, label: 'Radar Training',       points: 1 },
    2: { day: 2, label: 'Base Expansion',       points: 2 },
    3: { day: 3, label: 'Age of Science',       points: 2 },
    4: { day: 4, label: 'Train Heroes',         points: 2 },
    5: { day: 5, label: 'Total Mobilization',   points: 2 },
    6: { day: 6, label: 'Enemy Buster',         points: 4 },
  }
  return schedule[utcDay]
}

// ─── Profile Types ───────────────────────────────────────────────────────────────
export interface CommanderProfile {
  hq_level: number
  commander_name?: string
  server_day?: number
  season?: number
  spend_style: string
  playstyle: string
  troop_type: string
  troop_tier: string   // under_t10 | t10 | t11
  rank_bucket?: RankBucket
  squad_power_tier?: SquadPowerTier
  power_bucket?: PowerBucket
  kill_tier?: KillTier
  tier?: string
  beginner_mode?: boolean
}

// ─── Display helpers ─────────────────────────────────────────────────────────────
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

function getGreeting(profile: CommanderProfile): string {
  const name = profile.commander_name?.trim()
  return name ? `Commander ${name}` : 'Commander'
}

// ─── Beginner Action Plan ────────────────────────────────────────────────────────
// HARD RULES:
// - Hero upgrades: Day 4 ONLY
// - Troop training: Day 5 ONLY
// - No HQ push action on any day
// - Radar tasks: open Days 1, 3, 5 only
// - Survivor cards: open Day 2 only — never mention saving
// - Gold tasks/trucks: Day 2 and Day 6 only
// - Never mention starting builds or saving survivors

function generateBeginnerActionPlan(profile: CommanderProfile): ActionPlanResult {
  const actions: DailyAction[] = []
  const { day, label, points } = getDuelDay()
  const hq = profile.hq_level || 1
  const maxHeroLevel = getMaxHeroLevelForHQ(hq)
  const nextBreakpoint = getNextExpBreakpoint(maxHeroLevel)

  switch (day) {
    case 1:
      actions.push({
        id: 'day1_drone', category: 'general', priority: 'critical',
        title: '🚁 Upgrade Drone Data & Parts',
        detail: 'Use your drone data and drone parts to upgrade your drone today. This is the primary scoring action for Radar Training day (1 pt). Check all available drone upgrade slots.',
        buddyPrompt: `Today is Alliance Duel Day 1 — Radar Training. I'm at HQ ${hq}. How do I upgrade my drone efficiently? What data and parts should I prioritize?`,
        points: 1,
      })
      actions.push({
        id: 'day1_radar', category: 'general', priority: 'high',
        title: '📡 Clear Your Radar Tasks',
        detail: 'Today is one of three days this week where radar tasks score VS points (Days 1, 3, 5). Open and complete your radar tasks now.',
        buddyPrompt: `Today is Day 1 — radar tasks score today. I'm at HQ ${hq}. Which radar tasks should I prioritize?`,
      })
      actions.push({
        id: 'day1_gather', category: 'general', priority: 'medium',
        title: '🌾 Send Out Gatherers',
        detail: 'Send your troops out to gather resources on the map. Keep your marches busy all day. Focus on whatever resource is your current bottleneck.',
        buddyPrompt: `I'm at HQ ${hq} on server day ${profile.server_day ?? '?'}. What resources should I be gathering today and what's the most efficient setup for my level?`,
      })
      break

    case 2:
      actions.push({
        id: 'day2_builds', category: 'alliance_duel', priority: 'critical',
        title: '🏗️ Complete Building Upgrades — Scores Today',
        detail: 'Today is Base Expansion — finishing building upgrades earns alliance points (2 pts). Complete anything in queue and keep your builders busy all day.',
        buddyPrompt: `Today is Alliance Duel Day 2 — Base Expansion. I'm at HQ ${hq}, server day ${profile.server_day ?? '?'}. What buildings should I prioritize upgrading today?`,
        points: 2,
      })
      actions.push({
        id: 'day2_survivors', category: 'general', priority: 'high',
        title: '🃏 Open Your Survivor Recruitment Tickets',
        detail: 'Survivor Recruitment Tickets score VS points on Day 2 only. Open all your tickets now.',
        buddyPrompt: `Today is Day 2 — survivor tickets score today. I'm at HQ ${hq}. How do I get the most out of my survivor tickets?`,
      })
      actions.push({
        id: 'day2_tasks', category: 'general', priority: 'medium',
        title: '✅ Deploy Gold Tasks & Gold Trucks Only',
        detail: 'Only use gold (high-value) tasks and gold trucks today — they score the most VS points. Skip silver and bronze. Save radar tasks — not a radar scoring day.',
        buddyPrompt: `Today is Day 2. I'm at HQ ${hq}. How do I identify gold tasks and maximize VS points from tasks today?`,
      })
      break

    case 3:
      actions.push({
        id: 'day3_research', category: 'research', priority: 'critical',
        title: '🔬 Complete Research — Scores Today',
        detail: 'Today is Age of Science — completing research earns alliance points (2 pts). Finish anything in queue and start new research. Use Secretary of Science to cut time.',
        buddyPrompt: `Today is Alliance Duel Day 3 — Age of Science. I'm at HQ ${hq}, troop type ${profile.troop_type}. What research should I complete today?`,
        points: 2,
      })
      actions.push({
        id: 'day3_drone_chests', category: 'general', priority: 'high',
        title: '📦 Open Drone Component Chests',
        detail: 'Open your drone component chests today — these score VS points on Day 3. Check your inventory and open them all.',
        buddyPrompt: `Today is Day 3 — drone component chests score today. I'm at HQ ${hq}. How do I get more drone component chests?`,
      })
      actions.push({
        id: 'day3_radar', category: 'general', priority: 'high',
        title: '📡 Open Radar Tasks — Scores Today',
        detail: 'Today is one of three radar scoring days (Days 1, 3, 5). Open and complete your radar tasks now.',
        buddyPrompt: `Today is Day 3 — radar tasks score today. I'm at HQ ${hq}. Which radar tasks give the most points?`,
      })
      break

    case 4:
      actions.push({
        id: 'day4_heroes', category: 'heroes', priority: 'critical',
        title: '🦸 Hero Day — Use Your EXP Items NOW',
        detail: `Today is Train Heroes — the ONLY day of the week to spend Hero EXP items. Every hero level scores alliance points (2 pts). Your heroes can reach level ${maxHeroLevel}. ${nextBreakpoint ? `Push toward level ${nextBreakpoint.level} for a power spike.` : 'Push your main hero as high as you can.'} Use everything you have saved.`,
        buddyPrompt: `Today is Alliance Duel Day 4 — Train Heroes, the only day hero EXP scores. I'm at HQ ${hq}, max hero level ${maxHeroLevel}. Which heroes should I prioritize?`,
        points: 2,
      })
      actions.push({
        id: 'day4_radar_save', category: 'general', priority: 'medium',
        title: '📡 Save Radar Tasks — Not a Scoring Day',
        detail: 'Today is NOT a radar scoring day. Hold your radar tasks — use them on Days 1, 3, and 5 only.',
        buddyPrompt: `Today is Day 4. I'm at HQ ${hq}. What else can I do today alongside hero leveling?`,
      })
      break

    case 5:
      actions.push({
        id: 'day5_troops', category: 'troops', priority: 'critical',
        title: '🪖 Train & Promote All Troops — Scores Today',
        detail: `Today is Total Mobilization — every troop you train scores alliance points (2 pts). Train and promote all troops to the highest tier available to you. Keep your barracks running non-stop.`,
        buddyPrompt: `Today is Alliance Duel Day 5 — Total Mobilization. I'm at HQ ${hq} with ${profile.troop_type} troops at ${profile.troop_tier}. How do I maximize troop training and promotion today?`,
        points: 2,
      })
      actions.push({
        id: 'day5_radar', category: 'general', priority: 'high',
        title: '📡 Open Radar Tasks — Scores Today',
        detail: 'Today is one of three radar scoring days (Days 1, 3, 5). Open and complete your radar tasks now.',
        buddyPrompt: `Today is Day 5 — radar tasks score today. I'm at HQ ${hq}. Which radar tasks give the best return?`,
      })
      break

    case 6:
      actions.push({
        id: 'day6_battle', category: 'alliance_duel', priority: 'critical',
        title: '⚔️ Alliance Battle Day — Coordinate with Your Leader',
        detail: 'Today is Enemy Buster — the highest-value alliance day of the week (4 pts). Your whole alliance attacks another server. Check alliance chat for instructions and participate.',
        buddyPrompt: `Today is Alliance Duel Day 6 — Enemy Buster, worth 4 alliance points. I'm at HQ ${hq}. How can I contribute today?`,
        points: 4,
      })
      actions.push({
        id: 'day6_tasks', category: 'general', priority: 'high',
        title: '✅ Deploy Gold Tasks & Gold Trucks Only',
        detail: 'Only use gold (high-value) tasks and gold trucks today — they score the most VS points. Skip silver and bronze.',
        buddyPrompt: `Today is Day 6. I'm at HQ ${hq}. How do I maximize VS points from tasks alongside the alliance battle?`,
      })
      break

    case 7:
      actions.push({
        id: 'day7_gather', category: 'general', priority: 'medium',
        title: '🌾 Start Long Gather Runs Before Reset',
        detail: 'Before the 2am UTC reset, send your troops out on long gathering runs. They\'ll complete after the reset and resources count toward Day 1 gathering points.',
        buddyPrompt: `Today is Alliance Duel reset day. I'm at HQ ${hq}. How do I set up gathering runs before reset to maximize Day 1 resources?`,
      })
      actions.push({
        id: 'day7_radar_save', category: 'general', priority: 'medium',
        title: '📡 Save Radar Tasks — Use Tomorrow on Day 1',
        detail: 'Today is NOT a radar scoring day. Hold your radar tasks and use them tomorrow on Day 1 when they score VS points.',
        buddyPrompt: `Today is the reset day. I'm at HQ ${hq}. What should I do to set myself up for the new week?`,
      })
      break
  }

  const priorityOrder: Record<ActionPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const strategicInsight = getBeginnerStrategicInsight(day, hq)

  return {
    actions: actions.slice(0, 4),
    duelDay: day,
    duelDayLabel: label,
    duelDayPoints: points,
    strategicInsight,
    greeting: getGreeting(profile),
    dutyReport: `Server Day ${profile.server_day || '—'} · Today's Alliance Event: ${label}`,
    insight: strategicInsight,
  }
}

function getBeginnerStrategicInsight(day: number, hq: number): string {
  const insights: Record<number, string> = {
    1: `Today is Radar Training — upgrade your drone, clear radar tasks, and send gatherers out. Low-key scoring day.`,
    2: `Today is Base Expansion — complete building upgrades and open your survivor tickets. Gold tasks and trucks only. Save radar tasks.`,
    3: `Today is Age of Science — complete research and open drone component chests. Open your radar tasks today, they score now.`,
    4: `Today is Train Heroes — the ONLY day to use Hero EXP items. Every level scores alliance points. Save radar tasks.`,
    5: `Today is Total Mobilization — train and promote all troops to highest tier. Open your radar tasks. Both score alliance points today.`,
    6: `Today is Enemy Buster — biggest alliance day of the week (4 pts). Coordinate with your leader. Gold tasks and trucks only.`,
    7: `Today is reset day — no scoring. Start gather runs before the 2am UTC reset and save your radar tasks for tomorrow.`,
  }
  return insights[day] ?? `HQ ${hq} — keep building and stay consistent.`
}

// ─── Advanced Action Plan ────────────────────────────────────────────────────────
// HARD RULES (same as beginner — these never change regardless of tier):
// - Hero upgrades: Day 4 ONLY
// - Troop training as duel action: Day 5 ONLY
// - Radar tasks: open Days 1, 3, 5. Save all other days.
// - Gold tasks/trucks: Day 2 and Day 6 only
// - Gather runs: Day 1 and Day 7
// - Drone/drone chests: Day 1 (drone), Day 3 (chests)
// - Survivor tickets: Day 2 only
// - T11 Armament Training: fires EVERY DAY — no gate
// - T11 Armament Research (troop upgrade): Day 2 only alongside building upgrades
// - T10 path / hot deals: ONLY on Days 1–5 — NOT on Day 6 or Day 7

export function generateActionPlan(profile: CommanderProfile): ActionPlanResult {
  if (profile.beginner_mode) {
    return generateBeginnerActionPlan(profile)
  }

  const actions: DailyAction[] = []
  const { day, label, points } = getDuelDay()
  const isDoubleDay = day >= 2 && day <= 5
  const isEnemyBusterDay = day === 6
  const isDroneDay = day === 1
  const isResetDay = day === 7

  // T10 path and hot deals only fire on Days 1–5
  // T11 Armament Training is exempt — fires every day
  const allowTierActions = day >= 1 && day <= 5

  const hq = profile.hq_level || 1
  const isT11 = profile.troop_tier === 't11'
  const isBelowT10 = profile.troop_tier === 'under_t10'
  const isSpender = ['investor', 'whale', 'mega_whale'].includes(profile.spend_style)
  const maxHeroLevel = getMaxHeroLevelForHQ(hq)
  const nextHeroMilestone = getNextHeroMilestone(hq)
  const nextBreakpoint = getNextExpBreakpoint(maxHeroLevel)

  // ── Day 1: Radar Training ─────────────────────────────────────────────────────
  if (isDroneDay) {
    actions.push({
      id: 'day1_drone_adv', category: 'general', priority: 'medium',
      title: '🚁 Radar Training — Upgrade Drone Data & Parts',
      detail: 'Lowest-value Duel day (1 pt). Upgrade drone data and drone parts today. Clear radar tasks — they score VS points on Days 1, 3, and 5.',
      buddyPrompt: `Today is Alliance Duel Day 1 — Radar Training (1 pt). I'm at HQ ${hq}, troop tier ${profile.troop_tier}. How do I efficiently upgrade my drone and clear radar tasks today?`,
      points: 1,
    })
    actions.push({
      id: 'day1_radar_adv', category: 'general', priority: 'medium',
      title: '📡 Clear Radar Tasks — Scores Today',
      detail: 'Radar tasks score VS points on Days 1, 3, and 5 only. Open and complete them now.',
      buddyPrompt: `Today is Day 1 — radar tasks score today. HQ ${hq}, troop tier ${profile.troop_tier}. Which radar tasks give the best return at my level?`,
    })
    actions.push({
      id: 'day1_gather_adv', category: 'general', priority: 'low',
      title: '🌾 Send Out Gatherers',
      detail: 'Keep marches busy gathering resources. Good day to stock up on whatever is your current bottleneck.',
      buddyPrompt: `I'm at HQ ${hq}, server day ${profile.server_day ?? '?'}, troop tier ${profile.troop_tier}. What resources should I prioritize gathering today?`,
    })
  }

  // ── Double-dip days (Days 2–5) ────────────────────────────────────────────────
  if (isDoubleDay) {
    actions.push({
      id: 'double_dip', category: 'alliance_duel', priority: 'critical',
      title: `⚡ Double-Dip Day — Duel Day ${day}: ${label} + Arms Race`,
      detail: `Today is Alliance Duel Day ${day} (${label}, ${points} pts). Every action for the Duel ALSO scores Arms Race points simultaneously. Focus: ${getDuelFocusDetail(day, profile)}.`,
      buddyPrompt: `Today is Alliance Duel Day ${day} (${label}). Help me maximize both Duel and Arms Race scoring. HQ ${hq}, troop tier ${profile.troop_tier}, playstyle ${profile.playstyle}.`,
      points,
    })
  }

  // ── Enemy Buster Day (Day 6) ──────────────────────────────────────────────────
  if (isEnemyBusterDay) {
    actions.push({
      id: 'enemy_buster', category: 'alliance_duel', priority: 'critical',
      title: '🔥 Enemy Buster Day — 4 Alliance Points (Max Value)',
      detail: 'Highest-value Duel day (4 pts). Your alliance attacks the opponent server. Coordinate with leadership, maximize kills, use march buffs.',
      buddyPrompt: `Today is Alliance Duel Day 6 — Enemy Buster (4 pts). HQ ${hq}, Squad 1 power ${squadPowerLabel(profile.squad_power_tier)}, troop type ${profile.troop_type}, rank ${rankLabel(profile.rank_bucket)}. How do I maximize my contribution?`,
      points: 4,
    })
    actions.push({
      id: 'day6_tasks_adv', category: 'general', priority: 'high',
      title: '✅ Deploy Gold Tasks & Gold Trucks Only',
      detail: 'Only use gold (high-value) tasks and gold trucks today. Skip silver and bronze. Save radar tasks — not a scoring day.',
      buddyPrompt: `Today is Day 6. HQ ${hq}. How do I maximize VS points from tasks alongside the alliance battle?`,
    })
  }

  // ── Reset Day (Day 7) ─────────────────────────────────────────────────────────
  if (isResetDay) {
    actions.push({
      id: 'day7_gather_adv', category: 'general', priority: 'medium',
      title: '🌾 Start Long Gather Runs Before Reset',
      detail: 'Before the 2am UTC reset, send troops on long gathering runs. They complete after reset and resources count toward Day 1 gathering points.',
      buddyPrompt: `Today is the Alliance Duel reset day. HQ ${hq}, troop tier ${profile.troop_tier}. How do I set up gathering before reset to maximize Day 1 resources?`,
    })
    actions.push({
      id: 'day7_radar_save_adv', category: 'general', priority: 'medium',
      title: '📡 Save Radar Tasks — Use Tomorrow on Day 1',
      detail: 'Today is NOT a radar scoring day. Hold your radar tasks and use them tomorrow on Day 1.',
      buddyPrompt: `Today is the reset day. HQ ${hq}, troop tier ${profile.troop_tier}, server day ${profile.server_day ?? '?'}. What should I do to set up for the new week?`,
    })
  }

  // ── Hero — Day 4 ONLY ─────────────────────────────────────────────────────────
  // HARD RULE: Hero EXP, skills, exclusive weapons, ghost ops — Day 4 only.
  // Never recommend hero upgrades on any other day.
  if (day === 4) {
    actions.push({
      id: 'hero_exp_duel', category: 'heroes', priority: 'critical',
      title: '🦸 Train Heroes Day — Level Up for Duel + Arms Race',
      detail: `Every hero level scores Alliance Duel AND Arms Race simultaneously. At HQ ${hq} heroes can reach level ${maxHeroLevel}. ${nextBreakpoint ? `Next power spike: level ${nextBreakpoint.level} (${nextBreakpoint.label}).` : 'Push to max level.'} Use all saved EXP items today.`,
      buddyPrompt: `Today is Duel Day 4 — Train Heroes. HQ ${hq}, max hero level ${maxHeroLevel}. ${nextBreakpoint ? `Next breakpoint: level ${nextBreakpoint.level} — ${nextBreakpoint.label}.` : ''} Which heroes should I prioritize and how much EXP do I need?`,
      points: 2,
    })
    actions.push({
      id: 'day4_hero_skills', category: 'heroes', priority: 'high',
      title: '⭐ Upgrade Hero Skills & Exclusive Weapons',
      detail: 'Today is the day to invest in your heroes fully — level up hero skills and upgrade exclusive weapons alongside EXP. Stack every hero improvement you can while the scoring window is open.',
      buddyPrompt: `Today is Day 4 — hero day. HQ ${hq}, max hero level ${maxHeroLevel}. Which hero skills and exclusive weapons should I prioritize upgrading?`,
    })
    actions.push({
      id: 'day4_ghost_ops', category: 'general', priority: 'high',
      title: '👻 Complete Ghost Ops',
      detail: 'Complete your Ghost Ops today.',
      buddyPrompt: `Today is Day 4. HQ ${hq}. What Ghost Ops should I be running at my level?`,
    })
  }

  // ── Day 3 radar + drone chests ────────────────────────────────────────────────
  if (day === 3) {
    actions.push({
      id: 'day3_drone_chests_adv', category: 'general', priority: 'high',
      title: '📦 Open Drone Component Chests',
      detail: 'Drone component chests score VS points on Day 3. Check inventory and open them all.',
      buddyPrompt: `Today is Day 3 — drone component chests score today. HQ ${hq}. How do I get more drone component chests and what components should I prioritize?`,
    })
    actions.push({
      id: 'day3_radar_adv', category: 'general', priority: 'high',
      title: '📡 Open Radar Tasks — Scores Today',
      detail: 'Today is one of three radar scoring days (Days 1, 3, 5). Open and complete radar tasks now.',
      buddyPrompt: `Today is Day 3 — radar tasks score today. HQ ${hq}, troop tier ${profile.troop_tier}. Which tasks give the best return?`,
    })
  }

  // ── Day 2: survivor tickets + T11 Armament Research (troop upgrade) ───────────
  if (day === 2) {
    actions.push({
      id: 'day2_survivors_adv', category: 'general', priority: 'high',
      title: '🃏 Open Survivor Recruitment Tickets — Scores Today',
      detail: 'Survivor Recruitment Tickets score VS points on Day 2 only. Open all tickets now.',
      buddyPrompt: `Today is Day 2 — survivor tickets score today. HQ ${hq}. How do I maximize value from survivor tickets at my level?`,
    })
    actions.push({
      id: 'day2_tasks_adv', category: 'general', priority: 'medium',
      title: '✅ Deploy Gold Tasks & Gold Trucks Only',
      detail: 'Only use gold tasks and gold trucks today. Skip silver and bronze. Save radar tasks — not a scoring day.',
      buddyPrompt: `Today is Day 2. HQ ${hq}. How do I maximize VS points from tasks today?`,
    })
    if (isT11) {
      actions.push({
        id: 'day2_t11_research', category: 'troops', priority: 'high',
        title: '⚙️ T11 Armament Training & Research — Upgrade Troops Today',
        detail: 'Today is Base Expansion — building upgrades and T11 Armament Research both score. Queue troop upgrades in the Armament Institute. Use Secretary of Science to cut research time.',
        buddyPrompt: `Today is Day 2 — Base Expansion. T11 Armament Training & Research. Troop type ${profile.troop_type}, HQ ${hq}. Which armament upgrades should I queue today?`,
      })
    }
  }

  // ── Day 5 radar ───────────────────────────────────────────────────────────────
  if (day === 5) {
    actions.push({
      id: 'day5_radar_adv', category: 'general', priority: 'high',
      title: '📡 Open Radar Tasks — Scores Today',
      detail: 'Today is one of three radar scoring days (Days 1, 3, 5). Open and complete radar tasks alongside troop training.',
      buddyPrompt: `Today is Day 5 — radar tasks score today. HQ ${hq}, troop tier ${profile.troop_tier}. Which tasks give the best return?`,
    })
  }

  // ── T11 Armament Training — fires EVERY DAY ───────────────────────────────────
  // No gate — always a valid daily action for T11 players
  if (isT11) {
    actions.push({
      id: 't11_armament_training', category: 'troops', priority: 'high',
      title: '⚙️ T11 Armament Training — Check Branch Progress',
      detail: 'T11 Armament Training has multiple branches (Ground, Air, Missile, Accessories). Review current branch completion and queue next materials. Use Secretary of Science to cut time.',
      buddyPrompt: `T11 Armament Training. Troop type ${profile.troop_type}, HQ ${hq}. Which branches should I focus on and what materials do I need next?`,
    })
  }

  // ── Tier-conditional actions — Days 1–5 ONLY ─────────────────────────────────
  // T10 unlock path — non-double days only
  if (isBelowT10 && allowTierActions && !isDoubleDay) {
    actions.push({
      id: 't10_path', category: 'troops', priority: 'high',
      title: '🎯 T10 Unlock Path — Check Prerequisites',
      detail: `${hq < 16 ? `HQ ${hq} — reach HQ 16 as your primary goal.` : 'You have the HQ level — check research prerequisites in the Military tree.'}`,
      buddyPrompt: `Working toward T10. HQ ${hq}, server day ${profile.server_day ?? '?'}, troop tier ${profile.troop_tier}. What are my exact prerequisites and what should I do today?`,
    })
  }

  // Hot Deals — spenders only, Days 1–5
  if (isSpender && allowTierActions) {
    actions.push({
      id: 'hot_deal_check', category: 'spend', priority: 'medium',
      title: "💰 Check Today's Hot Deals",
      detail: `Check today's Hot Deals for time-limited offers. Screenshot any active deal and ask Buddy if it's worth buying at your current bottleneck.`,
      buddyPrompt: `${profile.spend_style} player, HQ ${hq}, ${profile.troop_tier} troops, Squad 1 power ${squadPowerLabel(profile.squad_power_tier)}. Evaluate today's Hot Deals — what's my biggest bottleneck a pack could solve?`,
    })
  }

  const strategicInsight = getAdvancedStrategicInsight(day, label, points, profile, maxHeroLevel, isDoubleDay)
  const priorityOrder: Record<ActionPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return {
    actions: actions.slice(0, 6),
    duelDay: day,
    duelDayLabel: label,
    duelDayPoints: points,
    strategicInsight,
    greeting: getGreeting(profile),
    dutyReport: `Server Day ${profile.server_day || '—'} · Duel Day ${day}: ${label}`,
    insight: strategicInsight,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────────
function getDuelFocusDetail(day: number, profile: CommanderProfile): string {
  switch (day) {
    case 2: return 'complete building upgrades — every completion scores both Duel + Arms Race'
    case 3: return 'complete research — finish queued research for double points. Use Secretary of Science to cut time'
    case 4: return 'level up heroes — every hero level scores Duel + Arms Race simultaneously'
    case 5: return `train and promote all troops to highest tier — every troop trained scores Duel + Arms Race`
    default: return 'check alliance duel requirements'
  }
}

function getAdvancedStrategicInsight(
  day: number,
  label: string,
  points: number,
  profile: CommanderProfile,
  maxHeroLevel: number,
  isDoubleDay: boolean
): string {
  if (isDoubleDay) {
    if (day === 4) return `Train Heroes Day — the ONLY day to spend Hero EXP items. Every hero level scores Alliance Duel AND Arms Race simultaneously. Save EXP every other day.`
    return `Double-dip day — every action for Alliance Duel Day ${day} (${label}) simultaneously scores Arms Race points. Highest efficiency play in the game.`
  }
  if (day === 6) return `Enemy Buster Day — 4 Alliance Duel points, highest of the week. Coordinate with leadership. Gold tasks and trucks only.`
  if (day === 7) return `Reset day — no scoring. Start gather runs before the 2am UTC reset and save radar tasks for tomorrow.`
  if (day === 1) return `Radar Training — lowest-value Duel day (1 point). Upgrade drones, clear radar tasks, gather resources.`
  const nextMilestone = getNextHeroMilestone(profile.hq_level)
  return nextMilestone
    ? `HQ ${profile.hq_level} unlocks hero level ${maxHeroLevel}. Reach HQ ${nextMilestone.targetHQ} to unlock hero level ${nextMilestone.heroLevel}.`
    : `Heroes at max unlock level ${maxHeroLevel} for your HQ. Focus on Armament Training and troop tier progression.`
}

export const generateDailyPlan = generateActionPlan