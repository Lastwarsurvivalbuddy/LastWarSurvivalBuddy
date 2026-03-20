// src/lib/briefingPrompt.ts
// Builds the system + user prompt for the Daily Briefing Card
// Rewritten: March 11, 2026 (session 11) — tight constraints, correct duel day, no hallucination
// Updated: March 15, 2026 (session 17) — beginner_mode support
// Updated: March 17, 2026 (session 28) — radar task day guidance added
// Updated: March 17, 2026 (session 30) — supplemental Alliance Duel scoring tips added per day
// Updated: March 17, 2026 (session 38) — use server_day only, not computed_server_day (runs ahead of reset)
// Updated: March 18, 2026 (session 39) — server_day removed entirely (not auto-incremented, irrelevant to advice)
// Updated: March 18, 2026 (session 39) — Sec Sci queue timing tip moved from Day 3 to Day 2 (reset hasn't hit yet)
// Updated: March 20, 2026 (session 48) — troop type stripped from training advice; hard rule added to never name troop type in training recs

// ─── Duel day — aligned to duel reset ────────────────────────────────────────
function getDuelDay(): { day: number; name: string } {
  const duelDays: Record<number, string> = {
    1: 'Radar Training',
    2: 'Base Expansion',
    3: 'Age of Science',
    4: 'Train Heroes',
    5: 'Total Mobilization',
    6: 'Enemy Buster',
    7: 'Reset',
  }
  const now = new Date()
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const utcDay = adjusted.getUTCDay()
  const dayMap: Record<number, number> = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }
  const day = dayMap[utcDay] ?? 1
  return { day, name: duelDays[day] ?? 'Unknown' }
}

// ─── Duel day advice ──────────────────────────────────────────────────────────
function getDuelAdvice(day: number): string {
  const advice: Record<number, string> = {
    1: 'Duel Day 1 (Radar Training) — radar tasks score VS points today: run them. Save drone chip chests. Align stamina use with Drone Boost Arms Race phase if active. Don\'t let radar tasks hit cap or you stop accruing. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Open drone chip chests today — they score. If you sent gathering squads out before reset, call them back now for Day 1 gathering points. Don\'t let your radar task queue fill up or accrual stops.',
    2: 'Duel Day 2 (Base Expansion) — open pre-wrapped buildings, use Legendary Trade Truck if available (200K pts), align construction with City Building Arms Race phase. Save radar tasks — they score on Day 3, not today. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Save Survivor cards all week and open them today — they score on Day 2. Use the Secretary of Development queue whenever you kick off a build — it fills up fast on Day 2, so get in early after reset. Get into the Secretary of Science queue before reset tonight — missing the timing means losing your prime research chain position for tomorrow\'s Day 3 scoring window.',
    3: 'Duel Day 3 (Age of Science) — radar tasks score VS points today: run them. Use research speedups, click to collect pre-staged research, use Valor Badges. Align with Tech Research Arms Race phase if active. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Open drone component chests today — they score. Use Valor points today — they score big. Research speedups and research completions also score. Clear completions, then chain new research using Valor points.',
    4: 'Duel Day 4 (Train Heroes) — use hero recruit tickets, spend UR/SSR shards if available, use Hero EXP, align with Hero Advancement Arms Race phase. Save radar tasks — they score on Day 5, not today. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Use skill medals today — everyone has them, use them. Exclusive weapons and hero gear upgrades also score today. Don\'t sit on these resources.',
    5: 'Duel Day 5 (Total Mobilization) — train troops: fill your drill grounds, this is the primary scoring action today. Best triple-dip day: construction + research + training all overlap Arms Race. Stack everything. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. All speedups score today. Overlord skill upgrades score — use them. Complete all radar tasks — easy points today.',
    6: 'Duel Day 6 (Enemy Buster) — war day, 4 alliance pts. Use healing speedups today (only day they score). Coordinate kills on opponent server. Remove wall defense or shield. Radar tasks don\'t score VS today — no need to save them either. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Speedups score independently today. Kill as many enemy troops as possible — that is the primary scoring action.',
    7: 'Duel Day 7 (Reset) — no duel today. Claim rewards, queue upgrades, prep for Monday. Save radar tasks — they score VS points on Day 1 tomorrow. Advanced Scoring Tips to maximize Alliance Duel: review your alliance duel scoring theme. Send gathering squads out before reset on long tasks and call them back after reset — you\'ll get Day 1 gathering points.',
  }
  return advice[day] ?? "Check in-game calendar for today's duel day."
}

// ─── Beginner duel advice ─────────────────────────────────────────────────────
function getDuelAdviceBeginner(day: number): string {
  const advice: Record<number, string> = {
    1: 'Today is Radar Training day — radar missions score alliance points today, so run them. The radar tower is in your base. Don\'t let your radar tasks fill up or you\'ll stop getting new ones. Tip: open any drone chests you have saved — they score today too. If you sent troops out gathering before reset, call them back now to get gathering points for today.',
    2: 'Today is Base Expansion day — you earn points by upgrading buildings. If you have buildings ready to upgrade, today is the day to do it. Save your radar missions for tomorrow (Day 3) — they score points then, not today. Tip: open any Survivor cards you\'ve been saving all week — they score today. Use the Secretary of Development feature when you start a build — it speeds things up, but the queue fills fast today so get in early. Before reset tonight, get into the Secretary of Science queue — that way you\'re first in line to chain research tomorrow on Day 3 when research scores points.',
    3: 'Today is Age of Science day — you earn points by doing research (the research lab in your base). Queue up research and use speedups today. Radar missions also score today, so run those too. Tip: open any drone component chests you have — they score today. Use your Valor points today if you have them — they score big points.',
    4: 'Today is Train Heroes day — you earn points by leveling up your heroes. Use any hero XP items or recruit tickets you\'ve been saving. Save your radar missions for tomorrow (Day 5) — they score points then, not today. Tip: use your skill medals today — everyone has them and they score points. Don\'t leave them sitting there.',
    5: 'Today is Total Mobilization day — the best day of the week. Train troops first: fill your drill grounds, that\'s the main event today. Building upgrades and research also earn points, so stack everything. Complete all radar tasks too — easy points today. All speedups score today so use them.',
    6: 'Today is Enemy Buster day — you earn points by fighting enemies. Attack infected zones and enemy bases. Radar missions don\'t score today, but you don\'t need to save them either. Tip: review your alliance duel scoring theme so you know exactly what counts today. Speedups also score today independently.',
    7: 'Today is the weekly reset — no alliance duel today. Collect your weekly rewards and get ready for next week. Save your radar missions for tomorrow (Day 1) — they\'ll score points then. Tip: send your troops out gathering before reset on long tasks and call them back after reset — you\'ll get Day 1 gathering points.',
  }
  return advice[day] ?? "Check your in-game calendar for today's event."
}

// ─── Troop tier label ─────────────────────────────────────────────────────────
function getTroopTierLabel(troopTier: string): string {
  const map: Record<string, string> = {
    under_t10: 'under T10',
    t10: 'T10',
    t11: 'T11',
  }
  return map[troopTier] ?? troopTier
}

// ─── Spend tier label ─────────────────────────────────────────────────────────
function getSpendLabel(spendTier: string): string {
  const map: Record<string, string> = {
    f2p: 'F2P',
    budget: 'Budget ($1–$20/mo)',
    mid: 'Mid spender ($20–$100/mo)',
    high: 'High spender ($100–$200/mo)',
    investor: 'Investor ($200+/mo)',
    whale: 'Whale/Investor ($200+/mo)',
  }
  return map[spendTier] ?? spendTier
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function buildBriefingPrompt(profile: Record<string, unknown>): Promise<{
  systemPrompt: string
  userPrompt: string
}> {
  const hqLevel = Number(profile.hq_level ?? 1)
  const season = Number(profile.season ?? 0)
  const spendTier = String(profile.spend_style ?? profile.spend_tier ?? 'f2p')
  const troopType = String(profile.troop_type ?? 'unknown')
  const troopTier = String(profile.troop_tier ?? 'under_t10')
  const troopTierLabel = getTroopTierLabel(troopTier)
  const playstyle = String(profile.playstyle ?? 'balanced')
  const rankBucket = String(profile.rank_bucket ?? 'not_top_200')
  const squadPowerTier = String(profile.squad_power_tier ?? 'under_10m')
  const commanderTag = String(profile.commander_tag ?? 'Commander')
  const serverNumber = String(profile.server_number ?? '???')
  const allianceName = profile.alliance_name ? `[${profile.alliance_name}]` : ''
  const killTier = String(profile.kill_tier ?? 'under_500k')
  const beginnerMode = profile.beginner_mode === true

  const duel = getDuelDay()
  const duelAdvice = beginnerMode ? getDuelAdviceBeginner(duel.day) : getDuelAdvice(duel.day)
  const spendLabel = getSpendLabel(spendTier)

  // ── Standard mode prompt ──────────────────────────────────────────────────
  const standardSystemPrompt = `You are Last War: Survival Buddy — a tactical AI coach for Last War: Survival. You are generating a Daily Briefing Card for one specific player.

STRICT RULES — violations destroy the product:
- Only give advice directly supported by the profile data and duel day context provided. Nothing else.
- Do NOT reference any game mechanic, event, or feature not explicitly mentioned in the player profile or context below.
- Do NOT invent scenarios, guess at what events are happening, or infer things not in the data.
- Do NOT mention Capitol War, season-specific events, night mechanics, VP gaps, or any mechanic unless it appears in the context provided.
- Do NOT fabricate timers, countdowns, or phase names.
- Arms Race: tell the player to check their in-game calendar for today's phase and align Duel actions accordingly. That is all.
- Keep advice grounded: HQ level, troop tier, troop type, duel day, spend tier, rank, kill tier. These are your only inputs.
- Be direct, specific, and honest. If you don't have data for something, don't say it.
- TROOP TRAINING RULE: When recommending troop training, NEVER name the troop type (aircraft, tank, missile). Always say "T[tier] troops" — e.g. "train T10 troops" or "fill your drill grounds with T11 troops". The player knows their type. Naming it reads as AI slop.

OUTPUT FORMAT — use exactly this structure, no deviations:

SITUATION
[One sentence: today's duel day and name, one honest observation about this player's current situation]

TOP 3 MOVES
• [Action grounded in duel day context — include radar task guidance if relevant today]
• [Action grounded in player's troop tier / HQ level]
• [Action grounded in spend tier or rank]

WATCH OUT
[One genuine risk or timing note for today — only if you can support it from the data provided]

Tone: direct, no fluff, no hype. Coach voice.`

  // ── Beginner mode prompt ──────────────────────────────────────────────────
  const beginnerSystemPrompt = `You are Last War: Survival Buddy — a friendly guide for players who are new to Last War: Survival. You are generating a Daily Briefing Card for a beginner player.

STRICT RULES — violations destroy the product:
- Only give advice directly supported by the profile data and duel day context provided. Nothing else.
- Do NOT reference any game mechanic, event, or feature not explicitly mentioned in the player profile or context below.
- Do NOT invent scenarios, guess at what events are happening, or infer things not in the data.
- Do NOT fabricate timers, countdowns, or phase names.
- Keep advice grounded: HQ level, troop tier, troop type, duel day, spend tier. These are your only inputs.
- Be honest. If you don't have data for something, don't say it.
- TROOP TRAINING RULE: When recommending troop training, NEVER name the troop type (aircraft, tank, missile). Always say "T[tier] troops" — e.g. "train T10 troops" or "fill your drill grounds". The player knows their type. Naming it reads as AI slop.

BEGINNER TONE RULES:
- Write like you're texting a friend who just started the game, not briefing a general.
- Use plain English. No jargon without explanation.
- When you use a game term, immediately explain it in parentheses. Example: "do some research (upgrade your tech tree in the lab)".
- Always explain WHY each action matters, not just what to do.
- Be encouraging. This player is learning. Make them feel capable, not overwhelmed.
- One clear priority first, then 2 supporting actions. Don't overwhelm.

OUTPUT FORMAT — use exactly this structure, no deviations:

SITUATION
[One friendly sentence: what day it is, what's happening today in the game, and one encouraging observation about where this player is]

TOP 3 MOVES
• [Most important action today — explain what it is AND why it matters, in plain English. Include radar task guidance if relevant today.]
• [Second action grounded in their HQ level or troop tier — explain the why]
• [Third action grounded in their spend tier or rank — keep it simple]

WATCH OUT
[One simple heads-up for today — written as friendly advice, not a warning. Explain any terms used.]

Tone: friendly, clear, encouraging. Like a helpful teammate, not a drill sergeant.`

  const systemPrompt = beginnerMode ? beginnerSystemPrompt : standardSystemPrompt

  const userPrompt = `Generate today's Daily Briefing Card.

PLAYER PROFILE:
- Commander: ${commanderTag} ${allianceName}
- Server: ${serverNumber} | Season: ${season}
- HQ: ${hqLevel} | Troop Type: ${troopType} | Troop Tier: ${troopTierLabel}
- Squad Power: ${squadPowerTier} | Rank: ${rankBucket} | Kill Tier: ${killTier}
- Playstyle: ${playstyle} | Spend: ${spendLabel}
- Beginner Mode: ${beginnerMode ? 'ON — use plain English, explain terms, be encouraging' : 'OFF — use tactical expert tone'}

TODAY'S DUEL CONTEXT:
- Today is Duel Day ${duel.day} — ${duel.name}
- ${duelAdvice}
- Arms Race: 6 phases, random daily order. ${
    beginnerMode
      ? 'Tell the player to open their in-game calendar to see which Arms Race phase is active today, and try to match their duel actions to it.'
      : 'Player checks in-game calendar. 1 swap per day. Double-dip Duel actions with matching Arms Race phase.'
  }

Generate the briefing card now. Stay strictly within the data provided above.`

  return { systemPrompt, userPrompt }
}