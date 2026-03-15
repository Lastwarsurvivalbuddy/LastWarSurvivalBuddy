// src/app/api/briefing/route.ts
// Daily Briefing Card — generates once per day per user, cached in Supabase
// Built: March 11, 2026 (session 11) — fixed session 14: UTC date consistency

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildBriefingPrompt } from '@/lib/briefingPrompt';

export const runtime = 'edge';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Always derive date from UTC — never local time
function getUTCDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();

    // ── Auth ─────────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = getUTCDateString();

    // ── Check cache ───────────────────────────────────────────────────────────
    const { data: cached } = await supabase
      .from('daily_briefings')
      .select('briefing_text, briefing_date, generated_at')
      .eq('user_id', user.id)
      .eq('briefing_date', today)
      .single();

    if (cached?.briefing_text && cached.briefing_date === today) {
      return NextResponse.json({
        briefing: cached.briefing_text,
        cached: true,
        generatedAt: cached.generated_at,
        briefingDate: cached.briefing_date,
      });
    }

    // ── Load profile ──────────────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('commander_profile')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // ── Build prompt ──────────────────────────────────────────────────────────
    const { systemPrompt, userPrompt } = await buildBriefingPrompt(profile);

    // ── Call Claude ───────────────────────────────────────────────────────────
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      console.error('Claude API error:', await claudeRes.text());
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const claudeData = await claudeRes.json();
    const briefingText: string = claudeData.content?.[0]?.text ?? '';

    if (!briefingText) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    // ── Cache result ──────────────────────────────────────────────────────────
    const now = new Date().toISOString();
    await supabase
      .from('daily_briefings')
      .upsert({
        user_id: user.id,
        briefing_date: today,
        briefing_text: briefingText,
        generated_at: now,
      }, { onConflict: 'user_id,briefing_date' });

    return NextResponse.json({
      briefing: briefingText,
      cached: false,
      generatedAt: now,
      briefingDate: today,
    });

  } catch (err) {
    console.error('Briefing route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── Force refresh (POST) ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = getUTCDateString();

    await supabase
      .from('daily_briefings')
      .delete()
      .eq('user_id', user.id)
      .eq('briefing_date', today);

    return NextResponse.json({ cleared: true });
  } catch (err) {
    console.error('Briefing clear error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}