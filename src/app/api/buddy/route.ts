import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1024;
const FREE_QUESTION_LIMIT = 5;

// ─── SYSTEM PROMPT BUILDER ────────────────────────────────────────────────────

function buildSystemPrompt(profile: Record<string, unknown>): string {
  const tierLabels: Record<string, string> = {
    f2p: 'Free to Play', budget: 'Budget', moderate: 'Moderate',
    investor: 'Investor', whale: 'Whale', mega_whale: 'Mega Whale',
  };
  const playstyleLabels: Record<string, string> = {
    fighter: 'Player vs. Player (Fighter)',
    developer: 'Player vs. Event (Developer)',
    commander: '50/50 Commander',
    scout: 'Still Figuring It Out (Scout)',
  };
  const troopLabels: Record<string, string> = {
    aircraft: 'Aircraft', tank: 'Tank', missile: 'Missile Vehicle', mixed: 'Mixed',
  };
  const tierBadge: Record<string, string> = {
    t8: 'T8', t9: 'T9', t10_working: 'T10 (working towards)',
    t10_unlocked: 'T10 (unlocked)', t11: 'T11', t12: 'T12',
  };
  const rankLabels: Record<string, string> = {
    top_5: 'Top 5', top_10: 'Top 10', top_20: 'Top 20',
    top_50: 'Top 50', top_100: 'Top 100', still_building: 'Still Building',
  };

  // Alliance Duel current day (same logic as dashboard)
  const now = new Date();
  const year = now.getUTCFullYear();
  const dstStart = new Date(Date.UTC(year, 2, 8));
  dstStart.setUTCDate(8 + ((7 - dstStart.getUTCDay()) % 7));
  const dstEnd = new Date(Date.UTC(year, 10, 1));
  dstEnd.setUTCDate(1 + ((7 - dstEnd.getUTCDay()) % 7));
  const isDST = now >= dstStart && now < dstEnd;
  const resetHourUTC = isDST ? 1 : 2;
  let dayOfWeek = now.getUTCDay();
  if (now.getUTCHours() < resetHourUTC) dayOfWeek = (dayOfWeek + 6) % 7;
  const dowToDuel: Record<number, number> = { 4: 4, 5: 5, 6: 6, 0: 7, 1: 1, 2: 2, 3: 3 };
  const duelDay = dowToDuel[dayOfWeek];
  const duelNames: Record<number, string> = {
    1: 'Day 1 — Drones (1 alliance point, lowest value)',
    2: 'Day 2 — Building (2 alliance points)',
    3: 'Day 3 — Research (2 alliance points)',
    4: 'Day 4 — Heroes (2 alliance points)',
    5: 'Day 5 — Training (2 alliance points)',
    6: 'Day 6 — Enemy Buster (4 alliance points, HIGHEST VALUE — fight vs opponent server)',
    7: 'Day 7 — Reset',
  };

  const goals = (profile.goals as string[] || [])
    .map(g => g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .join(', ') || 'None set';

  return `You are Buddy, the AI coach inside Last War: Survival Buddy — a personalized coaching app for the mobile game Last War: Survival.

Your job is to give this specific player — Commander ${profile.commander_name || 'Unknown'} — precise, actionable advice based on everything you know about them. Never give generic advice. Always tie your answer back to their profile.

═══════════════════════════════════════
COMMANDER PROFILE
═══════════════════════════════════════
Name:         Commander ${profile.commander_name || 'Unknown'}
Server:       #${profile.server_number} · Day ${profile.server_day}
HQ Level:     ${profile.hq_level}
Troop Tier:   ${tierBadge[profile.troop_tier as string] || profile.troop_tier}
Troop Type:   ${troopLabels[profile.troop_type as string] || profile.troop_type}
Playstyle:    ${playstyleLabels[profile.playstyle as string] || profile.playstyle}
Spend Tier:   ${tierLabels[profile.spend_tier as string] || profile.spend_tier}
Server Rank:  ${rankLabels[profile.server_rank as string] || profile.server_rank}
Hero Power:   ${profile.hero_power ? `${(Number(profile.hero_power) / 1_000_000).toFixed(1)}M` : 'Not set'}
Total Power:  ${profile.total_power ? `${(Number(profile.total_power) / 1_000_000).toFixed(1)}M` : 'Not set'}
Goals:        ${goals}
Subscription: ${profile.subscription_tier || 'free'}

═══════════════════════════════════════
TODAY'S INTEL
═══════════════════════════════════════
Alliance Duel: ${duelNames[duelDay]}
Duel Reset:    8pm CT (resets daily)

═══════════════════════════════════════
GAME KNOWLEDGE
═══════════════════════════════════════
TROOP COUNTERS: Aircraft beats Infantry. Infantry beats Tank. Tank beats Aircraft. Missile Vehicle counters all but has lower sustained power. Specialization matters more than raw numbers after Day 70.

DEFENSE: Squads engage sequentially by position (1→2→3→4). Position order ≠ squad label. Always analyze by position.

ALLIANCE DUEL CYCLE (weekly, resets 8pm CT):
- Day 1: Drones — 1 point (lowest)
- Day 2: Building — 2 points
- Day 3: Research — 2 points  
- Day 4: Heroes — 2 points
- Day 5: Training — 2 points
- Day 6: Enemy Buster — 4 points (HIGHEST — vs opponent server)
- Day 7: Reset

ARMS RACE: Daily event. Double-dipping with Alliance Duel is the highest efficiency play in the game. Most players don't know this. Always recommend aligning Arms Race actions with the current Duel day focus.

T10 TRACK: HQ 16–30, Seasons 1–3.
T11 TRACK: HQ 31–35, Season 4+. Uses Armament Research system.

HOT DEALS: Pack ROI depends on contents, current bottleneck, upcoming events, and spend tier. Always factor in the player's spend tier before recommending a purchase.

═══════════════════════════════════════
RESPONSE RULES
═══════════════════════════════════════
1. Be direct and specific. No fluff. Lead with the answer.
2. Always reference the player's actual stats and situation.
3. Use numbered lists for action items. Keep them scannable.
4. If you don't have enough info to answer well, ask one clarifying question.
5. Keep responses concise — this is a mobile app. Aim for under 200 words unless depth is genuinely needed.
6. Use "Commander [name]" sparingly — once per response max to keep it personal without being annoying.
7. Never recommend spending above the player's stated spend tier.
8. You are NOT a generic AI assistant. You are Buddy — their personal Last War coach.`;
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json();

    // Auth via Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch commander profile
    const { data: profile } = await supabase
      .from('commander_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // Check daily usage (free tier gate)
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('question_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .single();

    const questionCount = usage?.question_count || 0;
    const isFree = profile.subscription_tier === 'free' || !profile.subscription_tier;

    if (isFree && questionCount >= FREE_QUESTION_LIMIT) {
      return NextResponse.json({
        error: 'limit_reached',
        message: `You've used your ${FREE_QUESTION_LIMIT} free questions today. Upgrade to Pro for unlimited Buddy access — $4.99/mo, or grab a Founding Member spot while they last — $59 lifetime.`,
      }, { status: 429 });
    }

    // Call Claude API
    const claudeRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(profile),
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error('Claude API error:', err);
      return NextResponse.json({ error: 'AI error' }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const reply = claudeData.content?.[0]?.text || '';

    // Increment daily usage
    await supabase.from('daily_usage').upsert({
      user_id: user.id,
      usage_date: today,
      question_count: questionCount + 1,
    }, { onConflict: 'user_id,usage_date' });

    // Save messages to chat history
    if (sessionId) {
      const lastUserMessage = messages[messages.length - 1];
      await supabase.from('chat_messages').insert([
        {
          session_id: sessionId,
          user_id: user.id,
          role: 'user',
          content: lastUserMessage.content,
        },
        {
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: reply,
        },
      ]);

      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    return NextResponse.json({
      reply,
      questionsUsed: questionCount + 1,
      questionsRemaining: isFree ? Math.max(0, FREE_QUESTION_LIMIT - questionCount - 1) : null,
    });

  } catch (err) {
    console.error('Buddy API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}