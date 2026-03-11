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
// Reset is always 2am UTC. No DST logic — pure UTC.
// Mon=Day1 Radar Training, Tue=Day2 Base Expansion, Wed=Day3 Age of Science,
// Thu=Day4 Train Heroes, Fri=Day5 Total Mobilization, Sat=Day6 Enemy Buster, Sun=Day7 Reset

function getCurrentDuelDay(): { day: number; label: string } {
  const now = new Date();

  // Subtract 2 hours so the day rolls over at 2am UTC
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const utcDay = adjusted.getUTCDay();

  // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun
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
    t11:       'T11 — Armament Research system active. T10 research tree is fully complete. Do NOT recommend T10 research nodes.',
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

  // ── Season guide selection ──
  // Seasons 0–3: lwtSeasonData.ts
  // Seasons 4–5: lwtSeason45Data.ts
  const seasonNumber = typeof profile.season === 'number' ? profile.season : 0;

  const seasonGuide = seasonNumber >= 4
    ? getSeasonDataSummary45(seasonNumber)
    : getSeasonDataSummary(seasonNumber);

  // ── Community intel ──
  const communityIntel = await getApprovedSubmissions(Number(profile.server_number));

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

## Hot Deals — Spend Intelligence
${getHotDealsSummary()}

## Season Guide — ${seasonDisplay}
${seasonGuide}

## Hero System
${getHeroDataSummary()}

## Building Upgrade Priority
${getBuildingPrioritySummary()}

## Skill Medals
${getSkillMedalSummary()}

## VIP System
${getVIPSummary()}

## Gear System
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

## M5-A Armament System
${getArmamentSummary()}

## T10 Research
${getT10Summary()}

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
- If the player is T11, don't waste their time with basic building advice. Calibrate depth to their level.`;
}