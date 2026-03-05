'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase =
  typeof window !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

// ─── THEME ────────────────────────────────────────────────────────────────────
const t = {
  bg: '#07080a',
  surface: '#0e1014',
  surfaceRaised: '#13161b',
  border: '#1e2229',
  borderHover: '#2a3040',
  gold: '#c9a84c',
  goldLight: '#e8c96a',
  goldDim: '#7a6030',
  goldFaint: '#c9a84c18',
  red: '#c0281a',
  text: '#e8e6e0',
  textMuted: '#606878',
  textDim: '#9ca3af',
  green: '#22c55e',
  greenFaint: '#22c55e15',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  commander_name: string | null;
  server_number: number;
  server_day: number;
  hq_level: number;
  spend_tier: string;
  playstyle: string;
  troop_type: string;
  troop_tier: string;
  server_rank: string;
  hero_power: number | null;
  total_power: number | null;
  goals: string[];
  onboarding_complete: boolean;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatPower(n: number | null): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function getAllianceDuelDay(): { day: number; label: string; sublabel: string } {
  // Duel resets at 8pm CT (2am UTC standard / 1am UTC DST)
  // Sun=Day1(Drones), Mon=Day2(Building), Tue=Day3(Research)
  // Wed=Day4(Heroes), Thu=Day5(Training), Fri=Day6(Enemy Buster), Sat=Day7(Reset)
  const now = new Date();
  const year = now.getUTCFullYear();
  const dstStart = new Date(Date.UTC(year, 2, 8));
  dstStart.setUTCDate(8 + ((7 - dstStart.getUTCDay()) % 7));
  const dstEnd = new Date(Date.UTC(year, 10, 1));
  dstEnd.setUTCDate(1 + ((7 - dstEnd.getUTCDay()) % 7));
  const isDST = now >= dstStart && now < dstEnd;
  const resetHourUTC = isDST ? 1 : 2;
  const utcHour = now.getUTCHours();
  let dayOfWeek = now.getUTCDay();
  if (utcHour < resetHourUTC) {
    dayOfWeek = (dayOfWeek + 6) % 7;
  }
  const dowToDuel: Record<number, number> = { 4: 4, 5: 5, 6: 6, 0: 7, 1: 1, 2: 2, 3: 3 };
  const cycle = dowToDuel[dayOfWeek];
  const map: Record<number, { label: string; sublabel: string }> = {
    1: { label: 'Day 1 — Drones', sublabel: '1 alliance point — lowest value day' },
    2: { label: 'Day 2 — Building', sublabel: '2 alliance points' },
    3: { label: 'Day 3 — Research', sublabel: '2 alliance points' },
    4: { label: 'Day 4 — Heroes', sublabel: '2 alliance points' },
    5: { label: 'Day 5 — Training', sublabel: '2 alliance points' },
    6: { label: 'Day 6 — Enemy Buster', sublabel: '4 alliance points — fight your vs opponent' },
    7: { label: 'Day 7 — Reset', sublabel: 'Cycle resets tonight at 8pm CT' },
  };
  return { day: cycle, ...map[cycle] };
}

function getTierLabel(tier: string): string {
  const map: Record<string, string> = {
    f2p: 'F2P', budget: 'Budget', moderate: 'Moderate',
    investor: 'Investor', whale: 'Whale', mega_whale: 'Mega Whale',
  };
  return map[tier] || tier;
}

function getPlaystyleLabel(p: string): string {
  const map: Record<string, string> = {
    fighter: '⚔️ Fighter', developer: '🎯 Developer',
    commander: '⚖️ Commander', scout: '🗺️ Scout',
  };
  return map[p] || p;
}

function getTroopLabel(t: string): string {
  const map: Record<string, string> = {
    aircraft: '✈️ Aircraft', tank: '🛡️ Tank',
    missile: '🚀 Missile', mixed: '⚖️ Mixed',
  };
  return map[t] || t;
}

function getRankLabel(r: string): string {
  const map: Record<string, string> = {
    top_5: 'Top 5', top_10: 'Top 10', top_20: 'Top 20',
    top_50: 'Top 50', top_100: 'Top 100', still_building: 'Building',
  };
  return map[r] || r;
}

function getTierBadge(tier: string): string {
  const map: Record<string, string> = {
    t8: 'T8', t9: 'T9', t10_working: 'T10 →', t10_unlocked: 'T10',
    t11: 'T11', t12: 'T12',
  };
  return map[tier] || tier.toUpperCase();
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 16px', background: t.surfaceRaised,
      border: `1px solid ${t.border}`, borderRadius: 8, minWidth: 80,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: t.gold, fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.04em' }}>
        {value}
      </span>
      <span style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>
        {label}
      </span>
    </div>
  );
}

function SectionHeader({ title, tag }: { title: string; tag?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{
        fontFamily: '"Rajdhani", sans-serif', fontSize: 13, fontWeight: 700,
        color: t.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase',
      }}>
        {title}
      </span>
      {tag && (
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 20,
          background: t.goldFaint, border: `1px solid ${t.goldDim}`,
          color: t.goldLight, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          {tag}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}

function ActionCard({
  icon, title, description, tag, tagColor, locked,
}: {
  icon: string; title: string; description: string;
  tag?: string; tagColor?: string; locked?: boolean;
}) {
  return (
    <div style={{
      padding: '16px', background: t.surface,
      border: `1px solid ${locked ? t.border : t.borderHover}`,
      borderRadius: 10, marginBottom: 10,
      opacity: locked ? 0.5 : 1,
      position: 'relative', overflow: 'hidden',
    }}>
      {!locked && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, ${t.gold}, ${t.red})`,
          borderRadius: '3px 0 0 3px',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: locked ? 0 : 8 }}>
        <span style={{ fontSize: 22, minWidth: 28, marginTop: 1 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: '"Rajdhani", sans-serif', fontSize: 15, fontWeight: 700,
              color: locked ? t.textMuted : t.text, letterSpacing: '0.03em',
            }}>
              {title}
            </span>
            {tag && (
              <span style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 20,
                background: tagColor ? `${tagColor}20` : t.goldFaint,
                border: `1px solid ${tagColor || t.goldDim}`,
                color: tagColor || t.goldLight,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {tag}
              </span>
            )}
          </div>
          <p style={{ color: t.textMuted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function DuelDayCard({ duel }: { duel: { day: number; label: string; sublabel: string } }) {
  const isHighValue = duel.day === 6;
  return (
    <div style={{
      padding: '14px 16px',
      background: isHighValue ? `${t.gold}10` : t.surface,
      border: `1px solid ${isHighValue ? t.gold : t.border}`,
      borderRadius: 10, marginBottom: 16,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: isHighValue ? t.gold : t.surfaceRaised,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Rajdhani", sans-serif', fontSize: 18, fontWeight: 700,
        color: isHighValue ? '#07080a' : t.textMuted, flexShrink: 0,
      }}>
        {duel.day}
      </div>
      <div>
        <div style={{
          fontFamily: '"Rajdhani", sans-serif', fontSize: 15, fontWeight: 700,
          color: isHighValue ? t.gold : t.text, letterSpacing: '0.03em',
        }}>
          Alliance Duel · {duel.label}
        </div>
        <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{duel.sublabel}</div>
      </div>
      {isHighValue && (
        <div style={{
          marginLeft: 'auto', fontSize: 10, padding: '3px 8px', borderRadius: 20,
          background: `${t.gold}25`, border: `1px solid ${t.gold}`,
          color: t.gold, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0,
        }}>
          4× 🔥
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUserEmail(user.email || '');

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (prof) {
        // If onboarding not complete, send them back
        if (!prof.onboarding_complete) {
          router.push('/onboarding');
          return;
        }
        setProfile(prof);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/signin');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: t.goldDim, fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.2em', fontSize: 13 }}>
          LOADING...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const duel = getAllianceDuelDay();
  const displayName = profile.commander_name || userEmail.split('@')[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${t.bg}; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: t.bg, paddingBottom: 100 }}>

        {/* ── TOP NAV ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: `${t.bg}ee`, backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${t.border}`,
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: '"Rajdhani", sans-serif', fontSize: 14, fontWeight: 700,
            color: t.gold, letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>
            LWSB
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: t.textMuted, fontSize: 12 }}>
              Server {profile.server_number} · Day {profile.server_day}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent', border: `1px solid ${t.border}`,
                borderRadius: 6, padding: '6px 12px', color: t.textMuted,
                fontSize: 12, cursor: 'pointer', letterSpacing: '0.06em',
                fontFamily: '"Rajdhani", sans-serif', textTransform: 'uppercase',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>

          {/* ── COMMANDER HEADER ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Welcome back
                </p>
                <h1 style={{
                  fontFamily: '"Rajdhani", sans-serif', fontSize: 28, fontWeight: 700,
                  color: t.text, letterSpacing: '0.04em', lineHeight: 1.1,
                }}>
                  Commander {displayName}
                </h1>
              </div>
              <div style={{
                padding: '6px 12px', borderRadius: 6,
                background: t.goldFaint, border: `1px solid ${t.goldDim}`,
                fontFamily: '"Rajdhani", sans-serif', fontSize: 13, fontWeight: 700,
                color: t.gold, letterSpacing: '0.08em',
              }}>
                HQ {profile.hq_level}
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
              <StatPill label="Rank" value={getRankLabel(profile.server_rank)} />
              <StatPill label="Troops" value={getTierBadge(profile.troop_tier)} />
              <StatPill label="Type" value={getTroopLabel(profile.troop_type).split(' ')[1] || getTroopLabel(profile.troop_type)} />
              <StatPill label="Playstyle" value={getPlaystyleLabel(profile.playstyle).split(' ').slice(1).join(' ') || getPlaystyleLabel(profile.playstyle)} />
              {profile.hero_power && <StatPill label="Hero Power" value={formatPower(profile.hero_power)} />}
            </div>
          </div>

          {/* ── TODAY'S INTEL ── */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Today's Intel" tag="Live" />
            <DuelDayCard duel={duel} />

            {/* Server day context */}
            <div style={{
              padding: '12px 16px', background: t.surface,
              border: `1px solid ${t.border}`, borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Server Age
                </div>
                <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 15, fontWeight: 700, color: t.text }}>
                  Day {profile.server_day}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Spend Tier
                </div>
                <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 15, fontWeight: 700, color: t.text }}>
                  {getTierLabel(profile.spend_tier)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Server
                </div>
                <div style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: 15, fontWeight: 700, color: t.text }}>
                  #{profile.server_number}
                </div>
              </div>
            </div>
          </div>

          {/* ── DAILY ACTION PLAN ── */}
          <div style={{ marginBottom: 28 }}>
            <SectionHeader title="Daily Action Plan" tag="Coming Soon" />

            <ActionCard
              icon="⚔️"
              title="Your top moves for today"
              description="Personalized recommendations based on your server day, Alliance Duel cycle, and current goals. Coming in the next update."
              locked
            />
            <ActionCard
              icon="💰"
              title="Pack advisor"
              description="Buddy will scan active Hot Deals and tell you which are worth buying at your spend tier and current bottlenecks."
              locked
            />
            <ActionCard
              icon="📈"
              title="Arms Race optimizer"
              description="Know exactly which actions score today and how to double-dip with Alliance Duel for maximum efficiency."
              locked
            />
          </div>

          {/* ── GOALS ── */}
          {profile.goals && profile.goals.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SectionHeader title="Your Goals" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.goals.map(g => (
                  <div key={g} style={{
                    padding: '8px 14px', borderRadius: 8,
                    background: t.surface, border: `1px solid ${t.border}`,
                    fontSize: 13, color: t.textDim,
                    fontFamily: '"Rajdhani", sans-serif', fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}>
                    {g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EDIT PROFILE LINK ── */}
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              width: '100%', padding: '12px', background: 'transparent',
              border: `1px solid ${t.border}`, borderRadius: 8,
              color: t.textMuted, fontSize: 13, cursor: 'pointer',
              fontFamily: '"Rajdhani", sans-serif', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            ✏️ Edit Commander Profile
          </button>

        </div>

        {/* ── BUDDY AI FLOATING BUTTON ── */}
        <div style={{
          position: 'fixed', bottom: 24, right: 20, zIndex: 100,
        }}>
          <button
            onClick={() => alert('Buddy AI — coming soon!')}
            style={{
              width: 58, height: 58, borderRadius: '50%',
              background: `linear-gradient(135deg, ${t.red}, ${t.gold})`,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              boxShadow: `0 4px 24px ${t.gold}40`,
            }}
          >
            💬
          </button>
          <div style={{
            position: 'absolute', bottom: '110%', right: 0,
            background: t.surfaceRaised, border: `1px solid ${t.border}`,
            borderRadius: 6, padding: '6px 10px', whiteSpace: 'nowrap',
            fontSize: 11, color: t.textMuted, letterSpacing: '0.06em',
            pointerEvents: 'none',
          }}>
            Ask Buddy
          </div>
        </div>

      </div>
    </>
  );
}
