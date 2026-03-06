// src/lib/actionPlan.ts
// Rules engine for daily action plan — zero API cost
// Updated: March 6, 2026 — added hero EXP breakpoints + HQ unlock table

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
  buddyPrompt: string
}

export interface ActionPlanResult {
  actions: DailyAction[]
  duelDay: number
  duelDayLabel: string
  duelDayPoints: number
  strategicInsight: string
}

// ─── Hero EXP Breakpoints ───────────────────────────────────────────────────
// Source: lastwarhandbook.com/calculators/hero-exp
// These are the key levels where skill unlocks and power spikes occur

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

// Get max hero level for a given HQ level
export function getMaxHeroLevelForHQ(hqLevel: number): number {
  const keys = Object.keys(HQ_HERO_LEVEL_UNLOCK)
    .map(Number)
    .filter(k => k <= hqLevel)
    .sort((a, b) => b - a)
  return keys.length > 0 ? HQ_HERO_LEVEL_UNLOCK[keys[0]] : 1
}

// Get next hero level unlock milestone for a given HQ level
export function getNextHeroMilestone(hqLevel: number): { targetHQ: number; heroLevel: number } | null {
  const entries = Object.entries(HQ_HERO_LEVEL_UNLOCK)
    .map(([hq, lvl]) => ({ hq: Number(hq), heroLevel: lvl }))
    .filter(e => e.hq > hqLevel)
    .sort((a, b) => a.hq - b.hq)
  return entries.length > 0 ? entries[0] : null
}

// Get the next EXP breakpoint above a given hero level
export function getNextExpBreakpoint(currentHeroLevel: number): { level: number; label: string; expNeeded: number } | null {
  const entry = Object.entries(HERO_EXP_BREAKPOINTS)
    .map(([lvl, data]) => ({ level: Number(lvl), ...data }))
    .filter(e => e.level > currentHeroLevel)
    .sort((a, b) => a.level - b.level)[0]
  return entry ? { level: entry.level, label: entry.label, expNeeded: entry.expFromL1 } : null
}

// ─── Alliance Duel Day Calculation ─────────────────────────────────────────
// Resets at 8pm CT (1am UTC during DST / 2am UTC during standard time)
// DST in 2026: March 8 – November 1
// Day mapping: Sun→1, Mon→2, Tue→3, Wed→4, Thu→5, Fri→6, Sat→7

const DUEL_DAY_LABELS: Record<number, string> = {
  1: 'Drones',
  2: 'Building',
  3: 'Research',
  4: 'Heroes',
  5: 'Training',
  6: 'Enemy Buster',
  7: 'Reset',
}

const DUEL_DAY_POINTS: Record<number, number> = {
  1: 1,
  2: 2,
  3: 2,
  4: 2,
  5: 2,
  6: 4,
  7: 0,
}

export function getDuelDay(): { day: number; label: string; points: number } {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const utcMinute = now.getUTCMinutes()

  // Determine if DST is active (approximate: March 8 → November 1)
  const year = now.getUTCFullYear()
  const dstStart = new Date(Date.UTC(year, 2, 8))  // March 8
  const dstEnd   = new Date(Date.UTC(year, 10, 1)) // November 1
  const isDST = now >= dstStart && now < dstEnd

  // Reset hour in UTC: 1am during DST, 2am during standard
  const resetHourUTC = isDST ? 1 : 2

  // If before reset, we're still on the previous day's duel
  const isBeforeReset =
    utcHour < resetHourUTC ||
    (utcHour === resetHourUTC && utcMinute === 0)

  let utcDayOfWeek = now.getUTCDay() // 0=Sun ... 6=Sat
  if (isBeforeReset) {
    utcDayOfWeek = (utcDayOfWeek + 6) % 7
  }

  // Map Sun(0)→Day1, Mon(1)→Day2 ... Sat(6)→Day7
  const duelDay = utcDayOfWeek + 1

  return {
    day: duelDay,
    label: DUEL_DAY_LABELS[duelDay] || 'Unknown',
    points: DUEL_DAY_POINTS[duelDay] || 0,
  }
}

// ─── Profile Types ──────────────────────────────────────────────────────────

export interface CommanderProfile {
  hq_level: number
  server_day: number
  spend_style: string   // f2p | budget | moderate | investor | whale | mega_whale
  playstyle: string     // pvp | pve | balanced | scout
  troop_type: string    // aircraft | tank | missile | mixed
  troop_tier: string    // below_t8 | t8 | t9 | t10_working | t10 | t11 | t12
  server_rank?: number
  hero_power?: number
  goals?: string[]
  tier?: string         // subscription tier
}

// ─── Main Action Plan Generator ─────────────────────────────────────────────

export function generateActionPlan(profile: CommanderProfile): ActionPlanResult {
  const actions: DailyAction[] = []
  const { day, label, points } = getDuelDay()
  const isDoubleDay    = day >= 2 && day <= 5
  const isEnemyBusterDay = day === 6
  const isDroneDay     = day === 1
  const isResetDay     = day === 7

  const hq = profile.hq_level || 1
  const isEarlyGame = hq < 16
  const isMidGame   = hq >= 16 && hq < 30
  const isEndGame   = hq >= 30
  const isT11       = profile.troop_tier === 't11' || profile.troop_tier === 't12'
  const isT10       = profile.troop_tier === 't10' || profile.troop_tier === 't10_working'
  const isBelowT10  = ['below_t8', 't8', 't9'].includes(profile.troop_tier)
  const isSpender   = ['investor', 'whale', 'mega_whale'].includes(profile.spend_style)

  const maxHeroLevel    = getMaxHeroLevelForHQ(hq)
  const nextHeroMilestone = getNextHeroMilestone(hq)
  const nextBreakpoint  = getNextExpBreakpoint(maxHeroLevel)

  // ── 1. Alliance Duel + Arms Race Double-Dip (Days 2–5) ──────────────────
  if (isDoubleDay) {
    actions.push({
      id: 'double_dip',
      category: 'alliance_duel',
      priority: 'critical',
      title: `⚡ Double-Dip Day — Duel Day ${day}: ${label} + Arms Race`,
      detail: `Today is Alliance Duel Day ${day} (${label}, ${points} pts). Every action you take for the Duel ALSO scores Arms Race points. This is the highest efficiency play in the game. Focus: ${getDuelFocusDetail(day, profile)}.`,
      buddyPrompt: `Today is Alliance Duel Day ${day} (${label}). Help me maximize both my Duel score AND Arms Race points at the same time. My HQ is ${hq}, troop tier is ${profile.troop_tier}, playstyle is ${profile.playstyle}.`,
    })
  }

  // ── 2. Enemy Buster Day ──────────────────────────────────────────────────
  if (isEnemyBusterDay) {
    actions.push({
      id: 'enemy_buster',
      category: 'alliance_duel',
      priority: 'critical',
      title: '🔥 Enemy Buster Day — 4 Alliance Points (Max Value)',
      detail: 'Day 6 of Alliance Duel is the highest-value day of the week (4 pts). Your alliance is attacking the opponent server. Coordinate with alliance, maximize kills, use march buffs.',
      buddyPrompt: `Today is Alliance Duel Day 6 — Enemy Buster, worth 4 alliance points. Help me maximize my contribution. My HQ is ${hq}, hero power is ${profile.hero_power ? (profile.hero_power / 1_000_000).toFixed(1) + 'M' : 'unknown'}, troop type is ${profile.troop_type}.`,
    })
  }

  // ── 3. Drone Day ─────────────────────────────────────────────────────────
  if (isDroneDay) {
    actions.push({
      id: 'drone_day',
      category: 'alliance_duel',
      priority: 'medium',
      title: '🚁 Drone Day — Alliance Duel Day 1 (1 Point)',
      detail: 'Lowest-value Duel day. Good day to focus on development tasks without sacrificing high-value scoring. Complete drone upgrades if available.',
      buddyPrompt: `Today is Alliance Duel Day 1 (Drones, 1 point — lowest value day). What should I focus on to set up for the rest of the week? HQ ${hq}, ${profile.troop_tier} troops.`,
    })
  }

  // ── 4. Hero Level Push ───────────────────────────────────────────────────
  if (!isResetDay) {
    const heroAction = getHeroAction(hq, maxHeroLevel, nextBreakpoint, nextHeroMilestone, profile, day)
    if (heroAction) actions.push(heroAction)
  }

  // ── 5. Troop Training (Day 5 — Training Duel Day) ────────────────────────
  if (day === 5) {
    actions.push({
      id: 'troop_training_duel',
      category: 'troops',
      priority: 'high',
      title: '🪖 Training Day — Max Troop Training for Duel + Arms Race',
      detail: `Duel Day 5 is Training day. Every troop you train scores Alliance Duel AND Arms Race points simultaneously. Queue up as much ${profile.troop_type} training as possible. ${isBelowT10 ? 'Focus on highest tier available.' : isT10 ? 'Push T10 training.' : 'T11 training maximizes point value.'}`,
      buddyPrompt: `Today is Duel Day 5 — Training Day. I want to maximize troop training for both Alliance Duel and Arms Race scoring. My troop type is ${profile.troop_type}, tier is ${profile.troop_tier}, HQ ${hq}. What's the optimal training strategy?`,
    })
  }

  // ── 6. Research (Day 3 — Research Duel Day) ──────────────────────────────
  if (day === 3) {
    actions.push({
      id: 'research_duel',
      category: 'research',
      priority: 'high',
      title: '🔬 Research Day — Complete Research for Duel + Arms Race',
      detail: `Duel Day 3 is Research day. Completing research scores both Duel and Arms Race points. ${isT11 ? 'Focus on T11 Armament Research branches.' : isT10 ? 'Push military research toward T10 unlock.' : 'Complete highest available military research.'}`,
      buddyPrompt: `Today is Duel Day 3 — Research Day. What research should I prioritize to maximize both Alliance Duel and Arms Race scoring? HQ ${hq}, troop tier ${profile.troop_tier}, troop type ${profile.troop_type}.`,
    })
  }

  // ── 7. Building (Day 2 — Building Duel Day) ──────────────────────────────
  if (day === 2) {
    actions.push({
      id: 'building_duel',
      category: 'alliance_duel',
      priority: 'high',
      title: '🏗️ Building Day — Upgrade Buildings for Duel + Arms Race',
      detail: `Duel Day 2 is Building day. Complete building upgrades today to score Duel and Arms Race points. ${isEarlyGame ? 'Prioritize Barracks and Military Academy.' : isMidGame ? 'Focus on production and military buildings.' : 'Push high-level military buildings and Overlord.'}`,
      buddyPrompt: `Today is Duel Day 2 — Building Day. What buildings should I upgrade to maximize both Alliance Duel and Arms Race scoring? HQ ${hq}, server day ${profile.server_day}.`,
    })
  }

  // ── 8. T10 Path (early/mid game) ─────────────────────────────────────────
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

  // ── 9. T11 Armament Research ─────────────────────────────────────────────
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

  // ── 10. Spender: Hot Deal check ──────────────────────────────────────────
  if (isSpender) {
    actions.push({
      id: 'hot_deal_check',
      category: 'spend',
      priority: 'medium',
      title: '💰 Check Today\'s Hot Deals',
      detail: `As an ${profile.spend_style} tier player, check today's Hot Deals for time-limited offers. Best value deals align with your current bottleneck. Screenshot any active deal and ask Buddy if it's worth buying.`,
      buddyPrompt: `I'm an ${profile.spend_style} player at HQ ${hq} with ${profile.troop_tier} troops. I want to evaluate today's Hot Deals. What should I be looking for and what's my current biggest bottleneck that a pack could solve?`,
    })
  }

  // ── 11. Defense check (endgame) ──────────────────────────────────────────
  if (isEndGame && !isDoubleDay) {
    actions.push({
      id: 'defense_review',
      category: 'defense',
      priority: 'low',
      title: '🛡️ Defense Review — Check Squad Position Balance',
      detail: 'Squads engage in position order (1→2→3→4), not by squad label. Ensure your strongest squad is in position 1. Consider troop type counter advantages when arranging.',
      buddyPrompt: `Help me review my defense setup. Squads engage by position order 1→2→3→4. My troop type is ${profile.troop_type}, HQ ${hq}, hero power ${profile.hero_power ? (profile.hero_power / 1_000_000).toFixed(1) + 'M' : 'unknown'}. Is my defense optimal?`,
    })
  }

  // ── Strategic Insight ─────────────────────────────────────────────────────
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
  }
}

// ─── Helper: Hero Action ─────────────────────────────────────────────────────

function getHeroAction(
  hq: number,
  maxHeroLevel: number,
  nextBreakpoint: ReturnType<typeof getNextExpBreakpoint>,
  nextHeroMilestone: ReturnType<typeof getNextHeroMilestone>,
  profile: CommanderProfile,
  duelDay: number
): DailyAction | null {
  const isDuelHeroDay = duelDay === 4

  if (isDuelHeroDay) {
    return {
      id: 'hero_exp_duel',
      category: 'heroes',
      priority: 'critical',
      title: '🦸 Heroes Day — Level Up Heroes for Duel + Arms Race',
      detail: `Duel Day 4 is Heroes day. Every hero level you gain scores Alliance Duel AND Arms Race points simultaneously. At HQ ${hq} your heroes can reach level ${maxHeroLevel}. ${nextBreakpoint ? `Next power spike: level ${nextBreakpoint.level} (${nextBreakpoint.label}).` : 'Push to max level.'}`,
      buddyPrompt: `Today is Duel Day 4 — Heroes Day. I want to level up heroes for maximum Duel and Arms Race scoring. My HQ is ${hq}, max hero level I can reach is ${maxHeroLevel}. ${nextBreakpoint ? `Next key breakpoint is level ${nextBreakpoint.level}: ${nextBreakpoint.label}.` : ''} What heroes should I prioritize and how much EXP do I need?`,
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

// ─── Helper: Duel Focus Detail ───────────────────────────────────────────────

function getDuelFocusDetail(day: number, profile: CommanderProfile): string {
  switch (day) {
    case 2: return 'complete building upgrades — every completion scores both Duel + Arms Race'
    case 3: return 'complete research — queue and finish military research for double points'
    case 4: return 'level up heroes — every hero level scores Duel + Arms Race simultaneously'
    case 5: return `train ${profile.troop_type} troops — every troop trained scores Duel + Arms Race`
    default: return 'check alliance duel requirements'
  }
}

// ─── Helper: Strategic Insight ───────────────────────────────────────────────

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
    return `Reset day — no Alliance Duel scoring today. Good time to plan the week, check upcoming events, and queue resources for the new duel cycle starting tomorrow (Drone Day).`
  }
  if (day === 1) {
    return `Drone Day is the lowest-value Duel day (1 point). Use today to stockpile resources and set up for the high-value double-dip days starting tomorrow (Building Day, 2 pts).`
  }
  const nextMilestone = getNextHeroMilestone(profile.hq_level)
  return nextMilestone
    ? `HQ ${profile.hq_level} unlocks hero level ${maxHeroLevel}. Reach HQ ${nextMilestone.targetHQ} to unlock hero level ${nextMilestone.heroLevel} — the next major capability jump.`
    : `Your heroes are at max unlock level ${maxHeroLevel} for your HQ. Focus on Armament Research and troop tier progression.`
}