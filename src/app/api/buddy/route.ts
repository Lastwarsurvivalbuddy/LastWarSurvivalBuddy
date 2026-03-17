import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSkillMedalSummary } from '@/lib/skillMedals';
import { getVIPSummary } from '@/lib/vipData';
import { getGearSummary } from '@/lib/gearData';
import { getBuildingSummary } from '@/lib/buildingData';
import { getBuildingCostSummary } from '@/lib/buildingCostData';
import { getResourceNotesSummary } from '@/lib/resourceNotes';
import { getDroneSummary } from '@/lib/droneData';
import { getDecorationSummary } from '@/lib/decorationData';
import { getArmamentSummary } from '@/lib/armamentData';
import { getT10Summary } from '@/lib/t10Data';
import { getHQSummary } from '@/lib/hqRequirementsData';
import { getHealingSummary } from '@/lib/healingData';
import { getApprovedSubmissions } from '@/lib/submissionData';
import { incrementStreak } from '@/lib/streak';
import { getEventDataSummary } from '@/lib/lwtEventData';
import { getHotDealsSummary } from '@/lib/lwtHotDealsData';
import { getSeasonDataSummary } from '@/lib/lwtSeasonData';
import { getSeasonDataSummary45 } from '@/lib/lwtSeason45Data';
import { getHeroDataSummary } from '@/lib/lwtHeroData';
import { getBuildingPrioritySummary } from '@/lib/lwtBuildingData';
import { getTroopDataSummary } from '@/lib/lwtTroopData';
import { getGearDataSummary } from '@/lib/lwtGearData';
import { getAllianceDuelDetailSummary } from '@/lib/lwtAllianceDuelData';
import { getSquadDataSummary } from '@/lib/lwtSquadData';
import { getOverlordDataSummary } from '@/lib/lwtOverlordData';
import { getTricksDataSummary } from '@/lib/lwtTricksData';
import { getRadarMissionDataSummary } from '@/lib/lwtRadarMissionData';
import { getStoresDataSummary } from '@/lib/lwtStoresData';
import { getAllianceDataSummary } from '@/lib/lwtAllianceData';
import { getDesertStormDataSummary } from '@/lib/lwtDesertStormData';
import { getZombieSiegeDataSummary } from '@/lib/lwtZombieSiegeData';
import { getCapitolDataSummary } from '@/lib/lwtCapitolData';
import { getWarzoneDuelDataSummary } from '@/lib/lwtWarzoneDuelData';
import { getGeneralsTrialSummary } from '@/lib/lwtGeneralsTrialData';
import { getSkyBattlefrontSummary } from '@/lib/lwtSkyBattlefrontData';
import { getMeteoriteSummary } from '@/lib/lwtMeteoriteData';
import { getLWTVIPSummary } from '@/lib/lwtVIPData';
import { getT11DataSummary } from '@/lib/lwtT11Data';
import { getDecorationTierSummary } from '@/lib/lwtDecorationTierData';
import { getHeroTierSummary } from '@/lib/lwtHeroTierData';
import { getProfessionDataSummary } from '@/lib/lwtProfessionData';
import { lwtTacticCardData } from '@/lib/lwtTacticCardData';
import lwtSurvivorCardData from '@/lib/lwtSurvivorCardData';
import {
  SQUAD_POWER_TIER_LABELS,
  RANK_BUCKET_LABELS,
  POWER_BUCKET_LABELS,
  KILL_TIER_LABELS,
  SEASON_LABELS,
  type SquadPowerTier,
  type RankBucket,
  type PowerBucket,
  type KillTier,
} from '@/lib/profileTypes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Daily limits per tier ───────────────────────────────────────────────────

const TIER_LIMITS: Record<string, { questions: number; screenshots: number }> = {
  free:     { questions: 5,   screenshots: 0  },
  pro:      { questions: 30,  screenshots: 10 },
  elite:    { questions: 100, screenshots: 20 },
  founding: { questions: 20,  screenshots: 5  },
  alliance: { questions: 100, screenshots: 20 },
};

// ─── Duel day calculation ────────────────────────────────────────────────────

function getCurrentDuelDay(): { day: number; label: string } {
  const now = new Date();
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const utcDay = adjusted.getUTCDay();

  const schedule: Record<number, { day: number; label: string }> = {
    1: { day: 1, label: 'Radar Training (1pt)'     },
    2: { day: 2, label: 'Base Expansion (2pts)'     },
    3: { day: 3, label: 'Age of Science (2pts)'     },
    4: { day: 4, label: 'Train Heroes (2pts)'       },
    5: { day: 5, label: 'Total Mobilization (2pts)' },
    6: { day: 6, label: 'Enemy Buster (4pts)'       },
    0: { day: 7, label: 'Reset'                     },
  };

  return schedule[utcDay] ?? { day: 1, label: 'Radar Training (1pt)' };
}

// ─── Tactic Card summary helper ──────────────────────────────────────────────

function getTacticCardSummary(): string {
  const d = lwtTacticCardData;
  const setups = Object.values(d.recommendedSetups)
    .map(s => `**${s.name}**\nUse: ${s.use}\nRegular Cards: ${s.regularCards.join(', ')}\nCore Cards: ${s.coreCards.join(', ')}\nTip: ${s.tip}`)
    .join('\n\n');

  const highlighted = Object.values(d.highlightedCards)
    .map(c => `- ${c.name}: ${c.effect}${c.priority ? ` | Priority: ${c.priority}` : ''}`)
    .join('\n');

  const types = Object.values(d.cardTypes)
    .map(t => `- ${t.icon} (${t.nickname}): ${t.focus}`)
    .join('\n');

  return `
## Tactic Cards System (Season 4 & 5)
${d.overview}

**Card Categories:**
- Core Cards: ${d.cardCategories.coreCards.slots} slots, max level ${d.cardCategories.coreCards.maxLevel}, permanent (active off-season too), upgraded with Profession XP
- Regular Cards: ${d.cardCategories.regularCards.battleSlots} Battle slots + ${d.cardCategories.regularCards.resourceSlots} Resource slots, max level ${d.cardCategories.regularCards.maxLevel} (${d.cardCategories.regularCards.maxLevelWithUR} with UR trait), season-only, upgraded by dismantling

**Rarity Traits:**
- UR (Gold): +1/+2/+3 card levels — always keep these, main effect scales better than secondary stats
- SSR (Purple): Higher PvP buffs, damage reduction when countered, Profession XP from zombie kills (Resource Cards)
- Gray: Standard lower buffs

**Card Types:**
${types}

**Highlighted Cards:**
${highlighted}

**Recommended Setups:**
${setups}

**Resource Cards:** Fill all 4 slots with the 4 SSR options. Watch for Profession XP from zombie kill trait (up to 3.90% each) — switch to those when grinding.

**General Tips:**
${d.generalTips.map(t => `- ${t}`).join('\n')}
`.trim();
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse body ──
    const body = await req.json();
    const userMessage: string = body.message || '';
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = body.history || [];
    const imageData: { base64: string; mimeType: string } | undefined = body.image;

    const isScreenshot = !!imageData;

    if (!userMessage && !isScreenshot) {
      return NextResponse.json({ error: 'Message or image required' }, { status: 400 });
    }

    // ── Subscription & limits ──
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    const tier = sub?.tier || 'free';
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

    if (isScreenshot && limits.screenshots === 0) {
      return NextResponse.json({
        error: 'Screenshot analysis requires Pro or above.',
        upgradeMessage: 'Screenshot analysis is a Pro feature. Upgrade to Buddy Pro ($9.99/mo) or go Founding Member for $99 lifetime.',
      }, { status: 403 });
    }

    // ── Daily usage check ──
    const today = new Date().toISOString().split('T')[0];

    const { data: usage } = await supabase
      .from('daily_usage')
      .select('question_count, screenshot_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const questionCount   = usage?.question_count   || 0;
    const screenshotCount = usage?.screenshot_count || 0;

    if (questionCount >= limits.questions) {
      return NextResponse.json({
        error: 'Daily question limit reached.',
        upgradeMessage: tier === 'free'
          ? "You've hit your daily limit (5 questions). Upgrade to keep going: Pro — $9.99/mo · Elite — $19.99/mo · Founding Member — $99 lifetime"
          : `You've used all ${limits.questions} questions for today. Resets at midnight.`,
      }, { status: 429 });
    }

    if (isScreenshot && screenshotCount >= limits.screenshots) {
      return NextResponse.json({
        error: 'Daily screenshot limit reached.',
        upgradeMessage: `You've used all ${limits.screenshots} screenshot analyses for today. Resets at midnight.`,
      }, { status: 429 });
    }

    // ── Load commander profile ──
    const { data: profile } = await supabase
      .from('commander_profile')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const duel = getCurrentDuelDay();
    const systemPrompt = await buildSystemPrompt(profile, duel, tier);

    // ── Build message array for Claude ──
    const recentHistory = history.slice(-20);

    const claudeMessages: Array<{ role: string; content: unknown }> = [
      ...recentHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    if (isScreenshot && imageData) {
      const userContent: Array<Record<string, unknown>> = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageData.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: imageData.base64,
          },
        },
      ];
      userContent.push({
        type: 'text',
        text: userMessage || 'Please analyze this screenshot. Is this a good purchase for my situation? What does it contain and what is your recommendation?',
      });
      claudeMessages.push({ role: 'user', content: userContent });
    } else {
      claudeMessages.push({ role: 'user', content: userMessage });
    }

    // ── Claude API call ──
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    });

    const claudeData = await claudeRes.json();
    const reply = (claudeData.content as Array<{ type: string; text?: string }>)
      .filter(block => block.type === 'text')
      .map(block => block.text || '')
      .join('');

    // ── Save to chat history ──
    const sessionKey = `${user.id}_${today}`;
    const { data: session } = await supabase
      .from('chat_sessions')
      .upsert(
        { user_id: user.id, session_date: today, id: sessionKey },
        { onConflict: 'id' }
      )
      .select('id')
      .single();

    if (session) {
      await supabase.from('chat_messages').insert([
        {
          session_id: session.id,
          user_id: user.id,
          role: 'user',
          content: userMessage || '[screenshot]',
          has_image: isScreenshot,
        },
        {
          session_id: session.id,
          user_id: user.id,
          role: 'assistant',
          content: reply,
          has_image: false,
        },
      ]);
    }

    // ── Update daily usage ──
    await supabase
      .from('daily_usage')
      .upsert(
        {
          user_id: user.id,
          date: today,
          question_count: questionCount + 1,
          screenshot_count: isScreenshot ? screenshotCount + 1 : screenshotCount,
        },
        { onConflict: 'user_id,date' }
      );

    // ── Increment streak ──
    await incrementStreak(supabase, user.id);

    return NextResponse.json({ reply });

  } catch (err) {
    console.error('[Buddy API error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── System prompt builder ───────────────────────────────────────────────────

async function buildSystemPrompt(
  profile: Record<string, unknown> | null,
  duel: { day: number; label: string },
  tier: string
): Promise<string> {

  // ── No profile fallback ──
  if (!profile) {
    return `## About This App
Last War: Survival Buddy (LastWarSurvivalBuddy.com) is a personalized AI coaching app for Last War: Survival players. It is a fan-built community tool — not affiliated with or endorsed by FUNFLY PTE. LTD.
Buddy gives players a daily action plan and answers questions tailored to their exact server, HQ level, troop tier, spend style, playstyle, rank, and goals.
Buddy improves over time through community submissions — players submit intel via "Teach Buddy", the founder reviews and approves it, and approved facts are injected into Buddy's knowledge automatically.
Subscription tiers: Free (5 questions/day), Buddy Pro $9.99/mo (30 questions, 10 screenshots), Buddy Elite $19.99/mo (100 questions, 20 screenshots), Founding Member $99 lifetime (20 questions, 5 screenshots — 500 spots only).
If a player asks "how do I upgrade", "how do I get Pro", "how do I subscribe", or anything about subscription plans or pricing, direct them to the Upgrade page in the app at /upgrade. Do NOT interpret this as a question about in-game upgrades.
If asked how Buddy gets smarter, explain the community submission system — players teach Buddy, founder approves, everyone benefits.

You are Buddy — the personal AI commander coach for Last War: Survival.
The player's profile hasn't loaded — give helpful general advice and ask them to check their profile settings.
Keep responses concise, specific, and tactical. No fluff.`;
  }

  // ── Profile display translations ──
  const serverDay = profile.computed_server_day ?? profile.server_day ?? 'Unknown';

  const squadPower = profile.squad_power_tier
    ? SQUAD_POWER_TIER_LABELS[profile.squad_power_tier as SquadPowerTier] ?? profile.squad_power_tier
    : 'Not set';

  const rankDisplay = profile.rank_bucket
    ? RANK_BUCKET_LABELS[profile.rank_bucket as RankBucket] ?? profile.rank_bucket
    : 'Not set';

  const powerDisplay = profile.power_bucket
    ? POWER_BUCKET_LABELS[profile.power_bucket as PowerBucket] ?? profile.power_bucket
    : 'Not set';

  const killDisplay = profile.kill_tier
    ? KILL_TIER_LABELS[profile.kill_tier as KillTier] ?? profile.kill_tier
    : 'Not set';

  const seasonDisplay = profile.season !== undefined && profile.season !== null
    ? SEASON_LABELS[profile.season as number] ?? `Season ${profile.season}`
    : 'Not set';

  const troopTierDisplay: Record<string, string> = {
    under_t10: 'Under T10 — working toward T10 unlock',
    t10:       'T10 — unlocked and training. Do NOT recommend T10 research nodes as a goal — assume T10 research is complete.',
    t11:       'T11 — Armament Institute active. Armored Trooper / Assault Raider system. Do NOT recommend T10 research nodes.',
  };

  const duelLabels: Record<number, string> = {
    1: "Day 1 — Radar Training (1pt). Lowest value day. Use it for housekeeping, don't burn big speedups.",
    2: 'Day 2 — Base Expansion (2pts). Upgrade buildings. Double-dip: Building upgrades score Arms Race too.',
    3: 'Day 3 — Age of Science (2pts). Run research. Double-dip: Research scores Arms Race too.',
    4: 'Day 4 — Train Heroes (2pts). Level up heroes. Double-dip: Hero XP scores Arms Race too.',
    5: 'Day 5 — Total Mobilization (2pts). Train troops. Double-dip: Troop training scores Arms Race too.',
    6: 'Day 6 — Enemy Buster (4pts). HIGHEST VALUE DAY. Fight enemies, hit Infected Zones. Max Arms Race double-dip.',
    7: 'Day 7 — Reset day. Alliance Duel is between cycles. Prepare for Day 1 tomorrow.',
  };

  // ── Beginner mode ──
  const beginnerMode = profile.beginner_mode === true;

  // ── Season guide selection ──
  const seasonNumber = typeof profile.season === 'number' ? profile.season : 0;

  const seasonGuide = seasonNumber >= 4
    ? getSeasonDataSummary45(seasonNumber)
    : getSeasonDataSummary(seasonNumber);

  // ── Community intel ──
  const communityIntel = await getApprovedSubmissions(Number(profile.server_number));

  // ── Module data ──
  const squadData        = getSquadDataSummary();
  const overlordData     = getOverlordDataSummary();
  const tricksData       = getTricksDataSummary();
  const radarMissionData = getRadarMissionDataSummary();
  const storesData       = getStoresDataSummary();
  const allianceData     = getAllianceDataSummary();
  const desertStormData  = getDesertStormDataSummary();
  const zombieSiegeData  = getZombieSiegeDataSummary();
  const capitolData      = getCapitolDataSummary();
  const warzoneDuelData  = getWarzoneDuelDataSummary();
  const generalsTrial    = getGeneralsTrialSummary();
  const skyBattlefront   = getSkyBattlefrontSummary();
  const meteoriteData    = getMeteoriteSummary();
  const lwtVIPData       = getLWTVIPSummary();
  const t11Data          = getT11DataSummary();
  const decorationTierData = getDecorationTierSummary();
  const heroTierData     = getHeroTierSummary();
  const professionData   = getProfessionDataSummary();
  const tacticCardData   = getTacticCardSummary();
  const survivorCardData = lwtSurvivorCardData;

  // ── Assemble prompt ──
  return `## About This App
Last War: Survival Buddy (LastWarSurvivalBuddy.com) is a personalized AI coaching app for Last War: Survival players. It is a fan-built community tool — not affiliated with or endorsed by FUNFLY PTE. LTD.
Buddy gives players a daily action plan and answers questions tailored to their exact server, HQ level, troop tier, spend style, playstyle, rank, and goals.
Buddy improves over time through community submissions — players submit intel via "Teach Buddy", the founder reviews and approves it, and approved facts are injected into Buddy's knowledge automatically.
Subscription tiers: Free (5 questions/day), Buddy Pro $9.99/mo (30 questions, 10 screenshots), Buddy Elite $19.99/mo (100 questions, 20 screenshots), Founding Member $99 lifetime (20 questions, 5 screenshots — 500 spots only).
If a player asks "how do I upgrade", "how do I get Pro", "how do I subscribe", or anything about subscription plans or pricing, direct them to the Upgrade page in the app at /upgrade. Do NOT interpret this as a question about in-game upgrades.
If asked how Buddy gets smarter, explain the community submission system — players teach Buddy, founder approves, everyone benefits.

You are Buddy — the personal AI commander coach for Last War: Survival.

## This Commander's Profile
- **Name:** ${profile.commander_name || 'Commander'}
- **Server:** ${profile.server_number || 'Unknown'}
- **Server Day:** ${serverDay}
- **Season:** ${seasonDisplay}
- **HQ Level:** ${profile.hq_level || 'Unknown'}
- **Troop Tier:** ${troopTierDisplay[profile.troop_tier as string] ?? profile.troop_tier ?? 'Unknown'}
- **Squad 1 Troop Type:** ${profile.troop_type || 'Unknown'}
- **Spend Style:** ${profile.spend_style || 'Unknown'}
- **Playstyle:** ${profile.playstyle || 'Unknown'}
- **Server Rank:** ${rankDisplay}
- **Squad 1 Power:** ${squadPower}
- **Total Power:** ${powerDisplay}
- **Kill Tier:** ${killDisplay}
- **Subscription Tier:** ${tier}

## Buddy Mode
${beginnerMode
  ? `**BEGINNER MODE IS ON.**
This commander is new to the game and has requested plain English explanations.
- Use simple, clear language. Avoid jargon unless you immediately explain it.
- Always explain the "why" behind every recommendation — don't just say what to do, say why it matters.
- Break things into small steps. Don't assume they know game systems.
- Be encouraging, not overwhelming. Lead with the most important single action, then add 1–2 supporting steps.
- Skip endgame mechanics (T11, Armament, advanced Capitol math) unless they specifically ask.
- If a term might be unfamiliar, define it briefly in parentheses. Example: "Arms Race (a daily event where you earn points by doing normal activities like building and training)".`
  : `**STANDARD MODE.** Deliver tactical, expert-level advice calibrated to this commander's exact profile. No hand-holding. Lead with the answer.`}

## Today's Duel Status
Alliance Duel — ${duelLabels[duel.day] || duel.label}

## Your Mission
Give this Commander specific, actionable advice. Always reference their actual profile data.
Never give generic advice that ignores their server, tier, spend style, or situation.
Use buckets naturally in conversation — say "your Squad 1 is in the 40–50M range" not "your squad_power_tier is 40_50m".

## Screenshot Analysis (when image provided)
When the Commander uploads a screenshot of a Hot Deal / pack offer:
1. Identify what's in the pack (resources, speedups, heroes, items)
2. Give a clear BUY or SKIP recommendation
3. Explain WHY based on: their spend style, current bottleneck, upcoming events, troop tier progress
4. If the deal is genuinely good for their situation, say so clearly. If it's a trap, warn them.

## Troop Counter Triangle
Aircraft > Infantry > Tank > Aircraft. Missile Vehicle counters all but lower sustained power.
Specialization beats raw numbers after Day 70+. Always advise matching counter type in PVP.

## Defense System
Squads engage sequentially by position (1→2→3→4). Position ≠ squad label. Always analyze by position, never by squad label.

## Arms Race & Alliance Duel — Point Values and Strategy
${getEventDataSummary()}

## Alliance Duel — Deep Strategy Guide
${getAllianceDuelDetailSummary()}

## Hot Deals — Spend Intelligence
${getHotDealsSummary()}

## Season Guide — ${seasonDisplay}
${seasonGuide}

## Hero System
${getHeroDataSummary()}

## Hero Tier List (March 2026)
${heroTierData}

## Building Upgrade Priority
${getBuildingPrioritySummary()}

## Troop System
${getTroopDataSummary()}

## Gear Strategy Guide
${getGearDataSummary()}

## Squad Formation & Troop Type Counter Bonus
${squadData}

## Overlord Gorilla System
${overlordData}

## Radar Missions
${radarMissionData}

## Stores Guide
${storesData}

## Alliance System
${allianceData}

## Desert Storm Battlefield
${desertStormData}

## Zombie Siege
${zombieSiegeData}

## The Capitol & Ministries
${capitolData}

## Warzone Duel (Server War)
${warzoneDuelData}

## General's Trial
${generalsTrial}

## Sky Battlefront
${skyBattlefront}

## Meteorite Iron War
${meteoriteData}

## Tactic Cards (Season 4 & 5)
${tacticCardData}

## Survivor Cards & Recruitment
${survivorCardData}

## Meta Tips & Tricks
${tricksData}

## Skill Medals
${getSkillMedalSummary()}

## VIP System
${getVIPSummary()}

## VIP Strategy Guide (Extended)
${lwtVIPData}

## Gear System (Costs)
${getGearSummary()}

## Buildings
${getBuildingSummary()}

## Building Upgrade Costs
${getBuildingCostSummary()}

## Resource Notes
${getResourceNotesSummary()}

## Drone System
${getDroneSummary()}

## Decorations
${getDecorationSummary()}

## Decoration Tier List & Upgrade Priority
${decorationTierData}

## M5-A Armament System
${getArmamentSummary()}

## T10 Research
${getT10Summary()}

## T11 Troops System
${t11Data}

## Profession System (Engineer & War Leader)
${professionData}

## HQ Requirements
${getHQSummary()}

## Healing System
${getHealingSummary()}

## Community Intelligence
${communityIntel}

## Style Rules
- Be direct. Lead with the answer, then explain.
- Use their name: "Commander ${profile.commander_name || 'Commander'}"
- Translate ALL bucket values into plain English naturally. Never output raw bucket key names.
  Examples: "your Squad 1 power is around 40–50M" · "you're in the top 10 on your server" · "your kill tier is Warlord"
- Max 3–5 action items unless they ask for more.
- No unnecessary preamble. No "Great question!" filler.
- Tactical tone — like an advisor briefing a field commander.
- If the player is Under T10 or T10, don't give T11 Armament advice. Match advice to their actual tier.
- If the player is T11, don't waste their time with basic building advice. Calibrate depth to their level.
- When asked about troop type matchups, use the counter triangle and recommend specific troop/hero pairings.
- When asked about gear, reference the player's playstyle and troop type to give specific slot priorities.
- When asked about Alliance Duel, reference today's duel day and what to save vs. spend right now.
- When asked about Overlord Gorilla, reference whether they are likely past Day 89 of Season 2 and tailor advice to their progress stage.
- When asked about Desert Storm, reference their squad power and rank to calibrate their role (frontline vs support vs garrison).
- When asked about stores, always lead with the highest-value purchase for their current situation.
- When asked about Capitol hats/ministries, explain the speed math — buffs increase speed, not reduce time by the same %.
- When asked about Warzone Duel, remind them that truck plundering is the highest-volume point contribution every player can do daily.
- When asked about General's Trial, reference their troop tier and hero build to calibrate mode recommendations (Normal vs Advanced).
- When asked about Sky Battlefront, check if they are in an alliance and emphasize donation phase — a weak Airship tanks battle performance.
- When asked about Meteorite Iron War, lead with troop tier and march capacity — these determine whether they can compete for large nodes.
- When asked about VIP, lead with their spend style to set realistic milestone targets. F2P players: push VIP 8 for Shirley. Spenders: push VIP 11 march slot first.
- When asked about T11, check their troop tier first. Under T10/T10 players get prereq roadmap. T11 players get Armament Core farming strategy, branch order (Helmet→Body Armor→Protective Gear→Weapon), and star priority (1-star all branches first).
- When asked about decorations or which decorations to upgrade, lead with their tier (S/A+/A/B/C), reference the Jan 2026 meta priority (Damage Reduction first, then Skill Damage/March Size, then Crit Damage), and give the upgrade path step they should be on (L3 all S+A first, then push S-Tier to L4+).
- When asked about which heroes to build or invest in, lead with their troop type formation pairings from the Hero Tier List, then tier, then specific hero notes. Flag Lucius as Daily Sale only if relevant.
- When asked about professions, factor in their season, spend style, and playstyle. Early season = Engineer to build fast. Mid/late season = War Leader for territorial wars. Hybrid: start Engineer, switch with Battle Pass certificate. War Leader Lv.30 Team Strike is the rally inflection point.
- When asked about Tactic Cards, check their season first — cards only apply in Season 4+. For Season 4/5 players: lead with Core Card picks (2 slots, permanent), then recommended setup based on their playstyle (Quickstride for attackers, Garrison for defenders, Purgator PvE for early-season grinders). Always mention Hybrid Squad (4+1) for mixed squad formations and Counter Reversal as near-universal picks.
- When asked about survivors, survivor cards, tavern recruitment, or Talent Hall: reference their HQ level and troop tier to calibrate advice. Under HQ 17 = manage building-by-building. HQ 17+ = use Talent Hall. Always remind them to save Survivor Recruitment Tickets for Duel Day 2 (Tuesday). Only upgrade Purple and Yellow survivors. Attendants belong in the Tavern.
- **BEGINNER MODE RULE:** If Beginner Mode is ON, always prioritize clarity over completeness. One clear action beats five overwhelming options. Use analogies if helpful. Never assume prior knowledge of game systems.`;
}