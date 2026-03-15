import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') // 'server' | 'global'
    const serverNumber = searchParams.get('server_number')

    // --- Top Streaks ---
    let streakQuery = supabase
      .from('profiles')
      .select('commander_name, streak_count, server_number')
      .gt('streak_count', 0)
      .order('streak_count', { ascending: false })
      .limit(5)

    if (scope === 'server' && serverNumber) {
      streakQuery = streakQuery.eq('server_number', parseInt(serverNumber))
    }

    const { data: streakData, error: streakError } = await streakQuery
    if (streakError) throw streakError

    // --- Most Active (approved submissions) ---
    // NOTE: community_submissions does NOT have server_number.
    // For server scope, filter by joining against profiles after the fact.
    const { data: submissionData, error: submissionError } = await supabase
      .from('community_submissions')
      .select('user_id')
      .eq('status', 'approved')

    if (submissionError) throw submissionError

    // Count submissions per user_id
    const countMap: Record<string, number> = {}
    for (const row of submissionData ?? []) {
      countMap[row.user_id] = (countMap[row.user_id] ?? 0) + 1
    }

    const allUserIds = Object.keys(countMap)

    let topContributors: { commander_name: string; count: number; server_number: number }[] = []

    if (allUserIds.length > 0) {
      let profileQuery = supabase
        .from('profiles')
        .select('id, commander_name, server_number')
        .in('id', allUserIds)

      // Filter by server at the profile level — this is where server_number lives
      if (scope === 'server' && serverNumber) {
        profileQuery = profileQuery.eq('server_number', parseInt(serverNumber))
      }

      const { data: profileData, error: profileError } = await profileQuery
      if (profileError) throw profileError

      topContributors = (profileData ?? [])
        .map((profile) => ({
          commander_name: profile.commander_name ?? 'Unknown',
          server_number: profile.server_number ?? 0,
          count: countMap[profile.id] ?? 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }

    return NextResponse.json({
      streaks: streakData ?? [],
      contributors: topContributors,
    })
  } catch (err) {
    console.error('Pulse API error:', err)
    return NextResponse.json({ error: 'Failed to load pulse data' }, { status: 500 })
  }
}