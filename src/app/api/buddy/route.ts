import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Daily limits per tier ───
const TIER_LIMITS: Record<string, { questions: number; screenshots: number }> = {
  free:     { questions: 5,   screenshots: 0  },
  pro:      { questions: 30,  screenshots: 10 },
  elite:    { questions: 100, screenshots: 20 },
  founding: { questions: 20,  screenshots: 5  },
  alliance: { questions: 100, screenshots: 20 },
};

// ─── Duel day calculation (DST-aware, 8pm CT reset) ───
function getCurrentDuelDay(): { day: number; label: string } {
  const now = new Date();

  // Determine CT offset (DST: UTC-5, Standard: UTC-6)
  // DST runs second Sunday March → first Sunday November (approx)
  const month = now.getUTCMonth(); // 0-indexed
  const isDST = month >= 2 && month <= 9; // March–October (rough)
  const ctOffsetHours = isDST ? -5 : -6;

  // Shift to CT
  const ctTime = new Date(now.getTime() + ctOffsetHours * 60 * 60 * 1000);
  const ctHour = ctTime.getUTCHours();
  const ctDow = ctTime.getUTCDay(); // 0=Sun

  // Duel resets at 8pm CT — if before 8pm use today's DOW, if after use tomorrow's
  const effectiveDow = ctHour >= 20 ? (ctDow + 1) % 7 : ctDow;

  // Mapping: Sun=1(Drones), Mon=2(Building), Tue=3(Research),
  //          Wed=4(Heroes), Thu=5(Training), Fri=6(EnemyBuster), Sat=7(Reset)
  const dowToDay: Record<number, { day: number; label: string }> = {
    0: { day: 1, label: 'Drones (1pt)'       },
    1: { day: 2, label: 'Building (2pts)'    },
    2: { day: 3, label: 'Research (2pts)'    },
    3: { day: 4, label: 'Heroes (2pts)'      },
    4: { day: 5, label: 'Training (2pts)'    },
    5: { day: 6, label: 'Enemy Buster (4pts)' },
    6: { day: 7, label: 'Reset'              },
  };

  return dowToDay[effectiveDow] ?? { day: 1, label: 'Drones (1pt)' };
}

export async function POST(req: NextRequest) {
  try {
    // ─── Auth ───
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─── Parse body ───
    const body = await req.json();
    const userMessage: string = body.message || '';
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = body.history || [];
    const imageData: { base64: string; mimeType: string } | undefined = body.image;

    const isScreenshot = !!imageData;

    if (!userMessage && !isScreenshot) {
      return NextResponse.json({ error: 'Message or image required' }, { status: 400 });
    }

    // ─── Subscription & limits ───
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
        upgradeMessage: "Screenshot analysis is a Pro feature. Upgrade to Buddy Pro ($9.99/mo) or go Founding Member for $99 lifetime.",
      }, { status: 403 });
    }

    // ─── Daily usage check ───
    const today = new Date().toISOString().split('T')[0];

    const { data: usage } = await supabase
      .from('daily_usage')
      .select('question_count, screenshot_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const questionCount = usage?.question_count || 0;
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

    // ─── Load commander profile ───
    const { data: profile } = await supabase
      .from('commander_profile')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const duel = getCurrentDuelDay();

    // ─── Build system prompt ───
    const systemPrompt = buildSystemPrompt(profile, duel, tier);

    // ─── Build message array for Claude ───
    // History (last 10 exchanges = 20 messages max to keep context tight)
    const recentHistory = history.slice(-20);

    const claudeMessages: Array<{ role: string; content: unknown }> = [
      ...recentHistory.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Current user message — may include image
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

      if (userMessage) {
        userContent.push({ type: 'text', text: userMessage });
      } else {
        userContent.push({
          type: 'text',
          text: 'Please analyze this screenshot. Is this a good purchase for my situation? What does it contain and what is your recommendation?',
        });
      }

      claudeMessages.push({ role: 'user', content: userContent });
    } else {
      claudeMessages.push({ role: 'user', content: userMessage });
    }

    // ─── Claude API call ───
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

    // ─── Save to chat history ───
    // Upsert session (one per day, keyed by user + date)
    const sessionKey = `${user.id}_${today}`;
    const { data: session, error: sessionError } = await supabase
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

    // ─── Update daily usage ───
    const newQuestionCount = questionCount + 1;
    const newScreenshotCount = isScreenshot ? screenshotCount + 1 : screenshotCount;

    await supabase
      .from('daily_usage')
      .upsert(
        {
          user_id: user.id,
          date: today,
          question_count: newQuestionCount,
          screenshot_count: newScreenshotCount,
        },
        { onConflict: 'user_id,date' }
      );

    return NextResponse.json({ reply });

  } catch (err) {
    console.error('[Buddy API error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── System prompt builder ───
function buildSystemPrompt(
  profile: Record<string, unknown> | null,
  duel: { day: number; label: string },
  tier: string
): string {
  if (!profile) {
    return `You are Buddy, the AI coach for Last War: Survival. 
The player's profile hasn't loaded — give helpful general advice and ask them to check their profile settings.
Keep responses concise, specific, and tactical. No fluff.`;
  }

  const duelLabels: Record<number, string> = {
    1: "Day 1 — Drones (1pt). Lowest value day. Use it for housekeeping, don't burn big speedups.",
    2: 'Day 2 — Building (2pts). Upgrade buildings. Double-dip: Building upgrades score Arms Race too.',
    3: 'Day 3 — Research (2pts). Run research. Double-dip: Research scores Arms Race too.',
    4: 'Day 4 — Heroes (2pts). Level up heroes. Double-dip: Hero XP scores Arms Race too.',
    5: 'Day 5 — Training (2pts). Train troops. Double-dip: Troop training scores Arms Race too.',
    6: 'Day 6 — Enemy Buster (4pts). HIGHEST VALUE DAY. Fight enemies, hit Infected Zones. Max Arms Race double-dip.',
    7: 'Day 7 — Reset day. Alliance Duel is between cycles. Prepare for Day 1 tomorrow.',
  };

  return `You are Buddy — the personal AI commander coach for Last War: Survival.

## This Commander's Profile
- **Name:** ${profile.commander_name || 'Commander'}
- **Server:** ${profile.server_number || 'Unknown'}
- **Server Day:** ${profile.server_day || 'Unknown'}
- **HQ Level:** ${profile.hq_level || 'Unknown'}
- **Troop Tier:** ${profile.troop_tier || 'Unknown'}
- **Troop Type:** ${profile.troop_type || 'Unknown'}
- **Spend Style:** ${profile.spend_style || 'Unknown'}
- **Playstyle:** ${profile.playstyle || 'Unknown'}
- **Server Rank:** ${profile.server_rank || 'Unknown'}
- **Hero Power:** ${profile.hero_power ? profile.hero_power + 'M' : 'Not set'}
- **Total Power:** ${profile.total_power ? profile.total_power + 'M' : 'Not set'}
- **Goals:** ${Array.isArray(profile.goals) ? (profile.goals as string[]).join(', ') : profile.goals || 'Not set'}
- **Subscription Tier:** ${tier}

## Today's Duel Status
Alliance Duel — ${duelLabels[duel.day] || duel.label}

## Your Mission
Give this Commander specific, actionable advice. Always reference their actual profile data.
Never give generic advice that ignores their server, tier, spend style, or goals.

## Screenshot Analysis (when image provided)
When the Commander uploads a screenshot of a Hot Deal / pack offer:
1. Identify what's in the pack (resources, speedups, heroes, items)
2. Give a clear BUY or SKIP recommendation
3. Explain WHY based on: their spend style, current bottleneck, upcoming events, troop tier progress
4. If the deal is genuinely good for their situation, say so clearly. If it's a trap, warn them.

## Troop Counter Triangle
Aircraft > Infantry > Tank > Aircraft. Missile Vehicle counters all but lower sustained power.

## Defense System
Squads engage sequentially by position (1→2→3→4). Position ≠ squad label. Analyze by position.

## Arms Race
Daily event. Double-dipping with Alliance Duel is the highest efficiency move in the game.
Most players don't do this — always highlight it when relevant.

## Style Rules
- Be direct. Lead with the answer, then explain.
- Use their name: "Commander ${profile.commander_name || 'Commander'}"
- Max 3–5 action items unless they ask for more
- No unnecessary preamble. No "Great question!" filler.
- Tactical tone — like an advisor briefing a field commander.`;
}