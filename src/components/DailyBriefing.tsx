'use client';
// src/components/DailyBriefing.tsx
// Daily Briefing Card — pre-generated morning summary
// Built: March 11, 2026 (session 11) — fixed session 14: UTC date validation on client
// Fixed session 18: Top 3 Moves checkbox state persisted to Supabase (briefing_completions table)
// Fixed session 29: cache key aligned to duel reset (2am UTC)
// Fixed session 38: getUTCDateString uses duel-offset to match server, forceRefresh error handling improved
// Fixed session 49: refresh button made visible (was text-zinc-500, invisible on dark bg)

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface BriefingSection {
  situation: string;
  moves: string[];
  watchOut: string;
}

// Must match server's getDuelDateString() exactly — subtract 2 hours to align with 2am UTC duel reset
// Example: 1:30am UTC Tuesday → returns Monday's date (still in Monday's duel period)
// Example: 2:01am UTC Tuesday → returns Tuesday's date (new duel period started)
function getDuelDateString(): string {
  const now = new Date();
  const adjusted = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const year = adjusted.getUTCFullYear();
  const month = String(adjusted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(adjusted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseBriefing(text: string): BriefingSection | null {
  try {
    const situationMatch = text.match(/SITUATION\s*\n([\s\S]*?)(?=TOP 3 MOVES|$)/i);
    const movesMatch = text.match(/TOP 3 MOVES\s*\n([\s\S]*?)(?=WATCH OUT|$)/i);
    const watchMatch = text.match(/WATCH OUT\s*\n([\s\S]*?)$/i);

    if (!situationMatch && !movesMatch) return null;

    const situation = situationMatch?.[1]?.trim() ?? '';
    const movesRaw = movesMatch?.[1]?.trim() ?? '';
    const moves = movesRaw
      .split('\n')
      .map(l => l.replace(/^[\d]+[\.\)]\s*/, '').replace(/^[•\-\*]\s*/, '').trim())
      .filter(l => l.length > 0)
      .slice(0, 3);
    const watchOut = watchMatch?.[1]?.replace(/^⚠\s*/, '').trim() ?? '';

    return { situation, moves, watchOut };
  } catch {
    return null;
  }
}

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [parsed, setParsed] = useState<BriefingSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  // ── Completion state ───────────────────────────────────────────────────────
  const [completedMoves, setCompletedMoves] = useState<Set<number>>(new Set());
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userIdRef = useRef<string | null>(null);

  const loadCompletions = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    userIdRef.current = session.user.id;
    const today = getDuelDateString();
    const { data } = await supabase
      .from('briefing_completions')
      .select('completed_indices')
      .eq('user_id', session.user.id)
      .eq('briefing_date', today)
      .maybeSingle();
    if (data?.completed_indices?.length) {
      setCompletedMoves(new Set(data.completed_indices));
    }
  }, []);

  const persistCompletions = useCallback((updated: Set<number>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const userId = userIdRef.current;
      if (!userId) return;
      const today = getDuelDateString();
      await supabase
        .from('briefing_completions')
        .upsert(
          {
            user_id: userId,
            briefing_date: today,
            completed_indices: Array.from(updated),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,briefing_date' }
        );
    }, 600);
  }, []);

  const toggleMove = useCallback((index: number) => {
    setCompletedMoves(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      persistCompletions(next);
      return next;
    });
  }, [persistCompletions]);

  // ── Internal force-refresh ─────────────────────────────────────────────────
  // Deletes stale cache row then re-fetches a fresh briefing.
  // Returns true on success, false on failure — caller handles error state.
  const forceRefresh = useCallback(async (accessToken: string): Promise<boolean> => {
    try {
      // Delete the cached row
      const deleteRes = await fetch('/api/briefing', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!deleteRes.ok) {
        console.error('Failed to clear briefing cache:', await deleteRes.text());
        // Continue anyway — attempt regen even if delete failed
      }

      // Re-fetch fresh session token in case it rotated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const res = await fetch('/api/briefing', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Briefing regen failed:', body);
        return false;
      }

      const data = await res.json();
      setBriefing(data.briefing);
      setParsed(parseBriefing(data.briefing));
      setGeneratedAt(data.generatedAt);
      setIsCached(data.cached);
      return true;
    } catch (err) {
      console.error('forceRefresh error:', err);
      return false;
    }
  }, []);

  // ── Primary fetch ──────────────────────────────────────────────────────────
  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not signed in');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/briefing', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to load briefing');
      }

      const data = await res.json();

      // ── Client-side date guard ─────────────────────────────────────────────
      // Both client and server now use the same duel-offset logic, so this
      // should never mismatch in normal operation. Guard kept as safety net.
      const todayDuel = getDuelDateString();
      if (data.briefingDate && data.briefingDate !== todayDuel) {
        console.warn(`Briefing date mismatch: got ${data.briefingDate}, expected ${todayDuel}. Force refreshing.`);
        const ok = await forceRefresh(session.access_token);
        if (!ok) {
          setError('Briefing is outdated and could not be refreshed. Try again in a moment.');
        }
        return;
      }

      setBriefing(data.briefing);
      setParsed(parseBriefing(data.briefing));
      setGeneratedAt(data.generatedAt);
      setIsCached(data.cached);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [forceRefresh]);

  // ── Manual refresh button handler ──────────────────────────────────────────
  const handleRefresh = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setLoading(true);
      setError(null);
      setCompletedMoves(new Set());
      const ok = await forceRefresh(session.access_token);
      if (!ok) {
        setError('Refresh failed — try again in a moment.');
      }
    } catch {
      setError('Refresh failed — try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
    loadCompletions();
  }, [fetchBriefing, loadCompletions]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-zinc-900/80 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Daily Briefing</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-zinc-700 rounded w-3/4" />
          <div className="h-3 bg-zinc-700 rounded w-1/2" />
          <div className="h-3 bg-zinc-700 rounded w-5/6" />
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-zinc-900/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Daily Briefing</span>
          <button
            onClick={handleRefresh}
            title="Refresh briefing"
            className="flex items-center gap-1 text-xs font-semibold text-yellow-500 hover:text-yellow-300 transition-colors border border-yellow-500/40 hover:border-yellow-400 rounded px-2 py-0.5"
          >
            ↺ Refresh
          </button>
        </div>
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  // ── Fallback: raw text if parse fails ─────────────────────────────────────
  if (!parsed && briefing) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-zinc-900/80 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Daily Briefing</span>
        </div>
        <p className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed">{briefing}</p>
      </div>
    );
  }

  if (!parsed) return null;

  const allDone = parsed.moves.length > 0 && completedMoves.size === parsed.moves.length;

  // ── Main card ──────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-zinc-900/90 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">⚡ Daily Briefing</span>
          {isCached && formattedTime && (
            <span className="text-zinc-500 text-xs">· generated {formattedTime}</span>
          )}
          {allDone && (
            <span className="text-green-400 text-xs font-semibold">· ✓ All done</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh briefing"
          className="flex items-center gap-1 text-xs font-semibold text-yellow-500 hover:text-yellow-300 transition-colors border border-yellow-500/40 hover:border-yellow-400 rounded px-2 py-0.5"
        >
          ↺ Refresh
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Situation */}
        {parsed.situation && (
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">Situation</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{parsed.situation}</p>
          </div>
        )}

        {/* Top 3 Moves */}
        {parsed.moves.length > 0 && (
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Top 3 Moves</p>
            <ol className="space-y-2">
              {parsed.moves.map((move, i) => {
                const done = completedMoves.has(i);
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                    onClick={() => toggleMove(i)}
                  >
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        done
                          ? 'bg-green-500/30 border-green-500 text-green-400'
                          : 'border-yellow-500/40 text-transparent group-hover:border-yellow-400'
                      }`}
                    >
                      {done && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`text-sm leading-relaxed transition-colors ${
                        done ? 'text-zinc-500 line-through' : 'text-zinc-200'
                      }`}
                    >
                      {move}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Watch Out */}
        {parsed.watchOut && (
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3">
            <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-1">⚠ Watch Out</p>
            <p className="text-zinc-200 text-sm leading-relaxed">{parsed.watchOut}</p>
          </div>
        )}
      </div>
    </div>
  );
}
