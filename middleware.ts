import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────────────────────
// RATE LIMIT CONFIG — 2 requests per minute across the board
//
// Why 2/min: A human reading a battle report analysis takes
// 30-60 seconds minimum. Buddy responses take 10-20 seconds
// to read. 2/min = one request every 30 seconds.
// Any script fires faster and hits the wall on request 3.
// Tier doesn't change the per-minute cap — it changes daily
// quota. A Founding Member still can't fire 60 requests/min.
// ─────────────────────────────────────────────────────────────

const RATE_LIMITS: Record<string, Record<string, number>> = {
  '/api/battle-report': {
    free: 0, pro: 2, elite: 2, alliance: 2, founding: 2, anon: 1,
  },
  '/api/buddy': {
    free: 2, pro: 2, elite: 2, alliance: 2, founding: 2, anon: 1,
  },
  '/api/pack-scanner': {
    free: 0, pro: 2, elite: 2, alliance: 2, founding: 2, anon: 1,
  },
  '/api/briefing': {
    free: 2, pro: 2, elite: 2, alliance: 2, founding: 2, anon: 1,
  },
  'default': {
    free: 2, pro: 2, elite: 2, alliance: 2, founding: 2, anon: 1,
  },
}

// How many rate limit hits per hour before flagging for review
const ABUSE_THRESHOLD_PER_HOUR = 5

const WINDOW_SECONDS = 60
const ABUSE_WINDOW_SECONDS = 3600

// ─────────────────────────────────────────────────────────────
// WARNING — injected into every 429 response
// ─────────────────────────────────────────────────────────────

const ABUSE_WARNING =
  'Last War: Survival Buddy is a human-use service. ' +
  'Automated scripts, bots, and programmatic API access are strictly prohibited. ' +
  'Accounts detected running automated requests will be permanently banned ' +
  'without refund, regardless of subscription tier. ' +
  'This is monitored and enforced.'

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (!pathname.startsWith('/api/')) return NextResponse.next()
  if (pathname.startsWith('/api/stripe/webhook')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()
  if (pathname.startsWith('/api/pulse')) return NextResponse.next()  // Public leaderboard — no auth, no rate limit

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // ── 1. Identify user ──────────────────────────────────────
  let userId: string | null = null
  let userTier = 'anon'

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        userId = user.id

        // ── 2. Ban check ──────────────────────────────────
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('tier, banned, ban_reason')
          .eq('user_id', user.id)
          .single()

        if (sub?.banned) {
          return new NextResponse(
            JSON.stringify({
              error: 'account_banned',
              message:
                'This account has been permanently banned for automated API abuse. ' +
                'No refunds are issued for ToS violations.',
              ban_reason: sub.ban_reason ?? 'Automated script detected',
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }

        userTier = sub?.tier ?? 'free'
      }
    } catch {
      // Invalid token — treat as anon
    }
  }

  const identifier =
    userId ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  // ── 3. Route limit ────────────────────────────────────────
  const routeKey =
    Object.keys(RATE_LIMITS).find(
      k => k !== 'default' && pathname.startsWith(k)
    ) ?? 'default'

  const limit = RATE_LIMITS[routeKey][userTier] ?? RATE_LIMITS[routeKey]['anon'] ?? 1

  // ── 4. Per-minute counter ─────────────────────────────────
  const windowStart = Math.floor(Date.now() / (WINDOW_SECONDS * 1000))
  const rateLimitKey = `${identifier}:${routeKey}:${windowStart}`
  const windowExpiry = new Date((windowStart + 1) * WINDOW_SECONDS * 1000).toISOString()

  let currentCount = 1

  try {
    const { error: insertErr } = await supabase
      .from('rate_limits')
      .insert({ key: rateLimitKey, count: 1, expires_at: windowExpiry })

    if (insertErr) {
      // Row exists — read and increment
      const { data: row } = await supabase
        .from('rate_limits')
        .select('count')
        .eq('key', rateLimitKey)
        .single()

      currentCount = (row?.count ?? 0) + 1
      await supabase
        .from('rate_limits')
        .update({ count: currentCount })
        .eq('key', rateLimitKey)
    }
  } catch {
    // DB failure — allow through
    return NextResponse.next()
  }

  // ── 5. Rate limit exceeded ────────────────────────────────
  if (currentCount > limit) {

    // Track abuse hits for authenticated users
    if (userId) {
      try {
        const abuseWindowStart = Math.floor(Date.now() / (ABUSE_WINDOW_SECONDS * 1000))
        const abuseKey = `abuse:${userId}:${abuseWindowStart}`
        const abuseExpiry = new Date((abuseWindowStart + 1) * ABUSE_WINDOW_SECONDS * 1000).toISOString()

        let abuseCount = 1
        const { error: abuseInsertErr } = await supabase
          .from('rate_limits')
          .insert({ key: abuseKey, count: 1, expires_at: abuseExpiry })

        if (abuseInsertErr) {
          const { data: abuseRow } = await supabase
            .from('rate_limits')
            .select('count')
            .eq('key', abuseKey)
            .single()

          abuseCount = (abuseRow?.count ?? 0) + 1
          await supabase
            .from('rate_limits')
            .update({ count: abuseCount })
            .eq('key', abuseKey)
        }

        // Flag for review — admin manually confirms before hard ban
        if (abuseCount >= ABUSE_THRESHOLD_PER_HOUR) {
          await supabase
            .from('subscriptions')
            .update({
              flagged_for_review: true,
              flag_reason: `Rate limit hit ${abuseCount}x in 1 hour on ${routeKey}. Possible script. Review and ban if confirmed.`,
              flagged_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('banned', false)
        }
      } catch {
        // Abuse tracking failure is non-fatal
      }
    }

    return new NextResponse(
      JSON.stringify({
        error: 'rate_limit_exceeded',
        message: "You're sending requests faster than any human can read responses. Wait a minute.",
        retry_after: WINDOW_SECONDS,
        limit,
        warning: ABUSE_WARNING,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(WINDOW_SECONDS),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String((windowStart + 1) * WINDOW_SECONDS),
        },
      }
    )
  }

  // ── 6. Allow — attach headers ─────────────────────────────
  const remaining = Math.max(0, limit - currentCount)
  const res = NextResponse.next()
  res.headers.set('X-RateLimit-Limit', String(limit))
  res.headers.set('X-RateLimit-Remaining', String(remaining))
  res.headers.set('X-RateLimit-Reset', String((windowStart + 1) * WINDOW_SECONDS))
  return res
}

export const config = {
  matcher: '/api/:path*',
}