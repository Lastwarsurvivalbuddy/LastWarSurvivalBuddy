import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildBattleReportSystemPrompt, BATTLE_REPORT_QUOTAS } from '@/lib/lwtBattleReportData';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface IntakeAnswers {
  report_type: string;
  squad_type: string;
  tactics_cards: string[]; // multi-select — empty array is valid
}

interface ImagePayload {
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

interface BattleReportRequest {
  images: ImagePayload[];
  intake: IntakeAnswers;
}

interface SubscriptionRow {
  tier: string;
}

interface ProfileRow {
  hq_level: number | null;
  troop_type: string | null;
  troop_tier: string | null;
  squad_power: number | null;
  server_day: number | null;
  spend_style: string | null;
  hero_power: number | null;
  beginner_mode: boolean | null;
}

interface DailyUsageRow {
  battle_report_count: number | null;
}

// ─────────────────────────────────────────────────────────────
// TIER LIMIT HELPER
// ─────────────────────────────────────────────────────────────
function getDailyLimit(tier: string): number {
  switch (tier) {
    case 'pro':      return BATTLE_REPORT_QUOTAS.pro.daily_limit;
    case 'elite':    return BATTLE_REPORT_QUOTAS.elite.daily_limit;
    case 'alliance': return BATTLE_REPORT_QUOTAS.alliance.daily_limit;
    case 'founding': return BATTLE_REPORT_QUOTAS.founding.daily_limit; // soft cap
    case 'free':
    default:         return BATTLE_REPORT_QUOTAS.free.daily_limit;
  }
}

function getDisplayLimit(tier: string): string {
  if (tier === 'founding') return 'Unlimited';
  const limit = getDailyLimit(tier);
  return limit === 0 ? '0' : `${limit}/day`;
}

// ─────────────────────────────────────────────────────────────
// DATE HELPER (UTC — matches rest of app)
// ─────────────────────────────────────────────────────────────
function getUTCDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse body ─────────────────────────────────────────
    const body: BattleReportRequest = await req.json();
    const { images, intake } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    if (images.length > 6) {
      return NextResponse.json({ error: 'Maximum 6 screenshots per analysis' }, { status: 400 });
    }
    if (!intake?.squad_type || !intake?.report_type) {
      return NextResponse.json({ error: 'Intake answers required' }, { status: 400 });
    }

    // ── 3. Subscription tier ──────────────────────────────────
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single() as { data: SubscriptionRow | null };

    const tier = subData?.tier ?? 'free';
    const dailyLimit = getDailyLimit(tier);

    if (dailyLimit === 0) {
      return NextResponse.json({
        error: 'upgrade_required',
        message: 'Battle Report Analyzer is a Pro feature. Upgrade to analyze your battle reports.',
        upgrade_url: '/upgrade',
      }, { status: 403 });
    }

    // ── 4. Daily quota check ──────────────────────────────────
    const today = getUTCDateString();
    const { data: usageData } = await supabase
      .from('daily_usage')
      .select('battle_report_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single() as { data: DailyUsageRow | null };

    const currentCount = usageData?.battle_report_count ?? 0;
    if (currentCount >= dailyLimit) {
      return NextResponse.json({
        error: 'quota_exceeded',
        message: tier === 'founding'
          ? 'Daily soft limit reached. Come back tomorrow.'
          : `You've used all ${dailyLimit} Battle Report analyses today. Resets at midnight UTC.`,
        current: currentCount,
        limit: dailyLimit,
        display_limit: getDisplayLimit(tier),
        resets_at: `${today}T00:00:00Z`,
      }, { status: 429 });
    }

    // ── 5. Load player profile ────────────────────────────────
    const { data: profileData } = await supabase
      .from('commander_profile')
      .select('hq_level, troop_type, troop_tier, squad_power, server_day, spend_style, hero_power, beginner_mode')
      .eq('id', user.id)
      .single() as { data: ProfileRow | null };

    const playerProfile = {
      hq_level:     profileData?.hq_level     ?? undefined,
      troop_type:   profileData?.troop_type   ?? undefined,
      troop_tier:   profileData?.troop_tier   ?? undefined,
      squad_power:  profileData?.squad_power  ?? undefined,
      server_day:   profileData?.server_day   ?? undefined,
      spend_style:  profileData?.spend_style  ?? undefined,
      hero_power:   profileData?.hero_power   ?? undefined,
      beginner_mode: profileData?.beginner_mode ?? false,
    };

    // ── 6. Build system prompt ────────────────────────────────
    const systemPrompt = buildBattleReportSystemPrompt(playerProfile, intake);

    // ── 7. Build Claude Vision message content ────────────────
    type ContentBlock =
      | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
      | { type: 'text'; text: string };

    const contentBlocks: ContentBlock[] = images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType,
        data: img.base64,
      },
    }));

    const tacticsCardsSummary =
      intake.tactics_cards.length > 0 ? intake.tactics_cards.join(', ') : 'None';

    contentBlocks.push({
      type: 'text' as const,
      text: `Please analyze these ${images.length} battle report screenshot(s).

Player confirmed:
- Report type: ${intake.report_type}
- Their squad type: ${intake.squad_type}
- Tactics cards active: ${tacticsCardsSummary}

Read ALL screenshots as a set. Screen 1 (Outcome + Power Summary) contains the opponent's name and displayed power — extract these carefully.

Return ONLY valid JSON matching the schema in your instructions. No markdown, no preamble, no explanation outside the JSON object.`,
    });

    // ── 8. Claude API call ────────────────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: contentBlocks }],
      }),
    });

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      console.error('Claude API error:', errText);
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 502 });
    }

    const claudeData = await claudeResponse.json();
    const rawText: string = claudeData?.content?.[0]?.text ?? '';

    if (!rawText) {
      return NextResponse.json({ error: 'Empty response from AI. Please try again.' }, { status: 502 });
    }

    // ── 9. Parse structured JSON from Claude ──────────────────
    let analysis: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      analysis = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Claude JSON:', rawText.slice(0, 500));
      return NextResponse.json({
        error: 'Could not parse battle report analysis. Please try again with clearer screenshots.',
      }, { status: 422 });
    }

    // ── 10. Increment quota ───────────────────────────────────
    if (usageData) {
      await supabase
        .from('daily_usage')
        .update({ battle_report_count: currentCount + 1 })
        .eq('user_id', user.id)
        .eq('date', today);
    } else {
      await supabase
        .from('daily_usage')
        .upsert({
          user_id: user.id,
          date: today,
          question_count: 0,
          screenshot_count: 0,
          battle_report_count: 1,
        });
    }

    // ── 11. Save report to battle_reports table ───────────────
    // Extract opponent fields from analysis — these are new fields added to JSON schema
    const outcome        = (analysis.outcome as string)        ?? 'Unknown';
    const verdict        = (analysis.verdict as string)        ?? 'Analysis complete';
    const reportType     = (analysis.report_type as string)    ?? intake.report_type;
    const opponentName   = (analysis.opponent_name as string)  ?? 'Unknown';
    const opponentPower  = (analysis.opponent_power as string) ?? 'not visible';

    await supabase
      .from('battle_reports')
      .insert({
        user_id: user.id,
        outcome,
        report_type: reportType,
        verdict,
        analysis,
        images_count: images.length,
        intake_data: {
          ...intake,
          opponent_name: opponentName,
          opponent_power: opponentPower,
        },
      });

    // ── 12. Return success ────────────────────────────────────
    return NextResponse.json({
      success: true,
      analysis,
      meta: {
        images_analyzed: images.length,
        reports_used_today: currentCount + 1,
        reports_remaining_today:
          tier === 'founding' ? 'unlimited' : Math.max(0, dailyLimit - (currentCount + 1)),
        display_limit: getDisplayLimit(tier),
        tier,
      },
    });
  } catch (error) {
    console.error('Battle report route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// GET — fetch user's recent battle reports (last 10)
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch last 10 reports — include intake_data so we can pull opponent fields
    const { data: reports, error } = await supabase
      .from('battle_reports')
      .select('id, created_at, outcome, report_type, verdict, images_count, intake_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Normalize reports — pull opponent_name and opponent_power out of intake_data
    // so the component doesn't need to dig into jsonb
    const normalizedReports = (reports ?? []).map((r: {
      id: string;
      created_at: string;
      outcome: string;
      report_type: string;
      verdict: string;
      images_count: number;
      intake_data: Record<string, unknown> | null;
    }) => {
      const intakeData = (r.intake_data as Record<string, unknown>) ?? {};
      return {
        id: r.id,
        created_at: r.created_at,
        outcome: r.outcome,
        report_type: r.report_type,
        verdict: r.verdict,
        images_count: r.images_count,
        opponent_name:  (intakeData.opponent_name  as string) ?? 'Unknown',
        opponent_power: (intakeData.opponent_power as string) ?? 'not visible',
      };
    });

    // Also return today's quota status
    const today = getUTCDateString();
    const { data: usageData } = await supabase
      .from('daily_usage')
      .select('battle_report_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single() as { data: DailyUsageRow | null };

    const { data: subData } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single() as { data: SubscriptionRow | null };

    const tier = subData?.tier ?? 'free';
    const dailyLimit = getDailyLimit(tier);
    const usedToday = usageData?.battle_report_count ?? 0;

    return NextResponse.json({
      reports: normalizedReports,
      quota: {
        tier,
        used_today: usedToday,
        limit: dailyLimit,
        display_limit: getDisplayLimit(tier),
        remaining: tier === 'founding' ? 'unlimited' : Math.max(0, dailyLimit - usedToday),
        can_analyze: tier !== 'free' && usedToday < dailyLimit,
      },
    });
  } catch (error) {
    console.error('Battle report GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}