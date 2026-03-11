'use client';
// src/components/DailyBriefing.tsx
// Daily Briefing Card — pre-generated morning summary
// Built: March 11, 2026 (session 11)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface BriefingSection {
  situation: string;
  moves: string[];
  watchOut: string;
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

  const fetchBriefing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Not signed in'); setLoading(false); return; }

      const res = await fetch('/api/briefing', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to load briefing');
      }

      const data = await res.json();
      setBriefing(data.briefing);
      setParsed(parseBriefing(data.briefing));
      setGeneratedAt(data.generatedAt);
      setIsCached(data.cached);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await fetch('/api/briefing', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      await fetchBriefing();
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchBriefing(); }, [fetchBriefing]);

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // ── Loading state ────────────────────────────────────────────────────────
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

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-zinc-900/80 p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Daily Briefing</span>
        </div>
        <p className="text-zinc-400 text-sm">{error}</p>
        <button
          onClick={fetchBriefing}
          className="mt-3 text-xs text-yellow-400 hover:text-yellow-300 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Fallback: raw text if parse fails ────────────────────────────────────
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

  // ── Main card ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-yellow-500/30 bg-zinc-900/90 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">⚡ Daily Briefing</span>
          {isCached && formattedTime && (
            <span className="text-zinc-500 text-xs">· generated {formattedTime}</span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          title="Refresh briefing"
          className="text-zinc-500 hover:text-yellow-400 transition-colors text-xs"
        >
          ↺
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
              {parsed.moves.map((move, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-zinc-200 text-sm leading-relaxed">{move}</span>
                </li>
              ))}
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
