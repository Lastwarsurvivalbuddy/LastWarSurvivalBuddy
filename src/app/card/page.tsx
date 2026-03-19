'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  SQUAD_POWER_TIER_LABELS,
  RANK_BUCKET_LABELS,
  KILL_TIER_TITLES,
  type SquadPowerTier,
  type RankBucket,
  type KillTier,
} from '@/lib/profileTypes';

interface CommanderData {
  commander_name: string | null;
  server_number: number | null;
  computed_server_day: number | null;
  hq_level: number | null;
  troop_type: string | null;
  troop_tier: string | null;
  squad_power_tier: SquadPowerTier | null;
  rank_bucket: RankBucket | null;
  kill_tier: KillTier | null;
  alliance_name: string | null;
  alliance_tag: string | null;
  season: number | null;
  subscription_tier: string;
}

const KILL_CLUB_LABELS: Partial<Record<KillTier, string>> = {
  '500k':     '500K KILL CLUB',
  '1m':       '1M KILL CLUB',
  '2m':       '2M KILL CLUB',
  '3m':       '3M KILL CLUB',
  '4m':       '4M KILL CLUB',
  '5m':       '5M KILL CLUB',
  '10m':      '10M KILL CLUB',
  '15m':      '15M KILL CLUB',
  '20m':      '20M KILL CLUB',
  '25m':      '25M KILL CLUB',
  '50m':      '50M KILL CLUB',
  '100m_plus':'100M+ KILL CLUB',
};

function KillTierBadge({ tier }: { tier: KillTier | null }) {
  if (!tier) return null;
  const title = KILL_TIER_TITLES[tier] ?? 'Recruit';
  const clubLabel = KILL_CLUB_LABELS[tier] ?? null;

  const insignia: Record<string, React.ReactElement> = {
    under_500k: <path d="M16 4 L22 20 L10 20 Z" fill="none" stroke="#9ca3af" strokeWidth="2" />,
    '500k': <><path d="M16 3 L22 18 L10 18 Z" fill="none" stroke="#9ca3af" strokeWidth="2" /><path d="M16 9 L20 20 L12 20 Z" fill="none" stroke="#9ca3af" strokeWidth="1.5" /></>,
    '1m': <><circle cx="16" cy="10" r="5" fill="none" stroke="#d4a017" strokeWidth="2" /><rect x="13" y="17" width="6" height="3" fill="#d4a017" rx="1" /><line x1="16" y1="5" x2="16" y2="2" stroke="#d4a017" strokeWidth="2" /></>,
    '2m': <><circle cx="16" cy="10" r="5" fill="none" stroke="#d4a017" strokeWidth="2" /><rect x="13" y="17" width="6" height="2.5" fill="#d4a017" rx="1" /><rect x="13" y="21" width="6" height="2.5" fill="#d4a017" rx="1" /></>,
    '3m': <><line x1="10" y1="10" x2="22" y2="22" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" /><line x1="22" y1="10" x2="10" y2="22" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" /><circle cx="16" cy="16" r="3" fill="#d4a017" /></>,
    '4m': <><line x1="10" y1="10" x2="22" y2="22" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" /><line x1="22" y1="10" x2="10" y2="22" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" /><circle cx="16" cy="16" r="4" fill="none" stroke="#d4a017" strokeWidth="1.5" /><circle cx="16" cy="16" r="1.5" fill="#d4a017" /></>,
    '5m': <><polygon points="16,2 19,11 28,11 21,17 23,26 16,20 9,26 11,17 4,11 13,11" fill="none" stroke="#d4a017" strokeWidth="1.8" /><polygon points="16,7 18,13 24,13 19,17 21,23 16,19 11,23 13,17 8,13 14,13" fill="#d4a017" /></>,
    '10m': <><polygon points="16,2 19,11 28,11 21,17 23,26 16,20 9,26 11,17 4,11 13,11" fill="none" stroke="#f59e0b" strokeWidth="2" /><polygon points="16,7 18,13 24,13 19,17 21,23 16,19 11,23 13,17 8,13 14,13" fill="#f59e0b" /></>,
    '15m': <><polygon points="16,2 19,11 28,11 21,17 23,26 16,20 9,26 11,17 4,11 13,11" fill="none" stroke="#f59e0b" strokeWidth="2" /><polygon points="16,7 18,13 24,13 19,17 21,23 16,19 11,23 13,17 8,13 14,13" fill="#f59e0b" /><rect x="10" y="27" width="12" height="2.5" fill="#f59e0b" rx="1" /></>,
    '20m': <><polygon points="16,2 19,11 28,11 21,17 23,26 16,20 9,26 11,17 4,11 13,11" fill="none" stroke="#f59e0b" strokeWidth="2" /><polygon points="16,7 18,13 24,13 19,17 21,23 16,19 11,23 13,17 8,13 14,13" fill="#f59e0b" /><rect x="10" y="27" width="12" height="2" fill="#f59e0b" rx="1" /><rect x="10" y="30.5" width="12" height="2" fill="#f59e0b" rx="1" /></>,
    '25m': <><polygon points="16,2 20,11 30,11 22,17 25,27 16,21 7,27 10,17 2,11 12,11" fill="none" stroke="#f59e0b" strokeWidth="2" /><polygon points="16,6 19,13 26,13 21,17 23,24 16,20 9,24 11,17 6,13 13,13" fill="#f59e0b" /><circle cx="16" cy="16" r="3" fill="#111" /><circle cx="16" cy="16" r="1.5" fill="#f59e0b" /></>,
    '50m': <><polygon points="16,1 20,11 30,11 22,17 25,28 16,22 7,28 10,17 2,11 12,11" fill="none" stroke="#f59e0b" strokeWidth="2.5" /><polygon points="16,5 19,13 26,13 21,17 23,25 16,20 9,25 11,17 6,13 13,13" fill="#f59e0b" /><circle cx="16" cy="15" r="4" fill="#111" /><circle cx="16" cy="15" r="2" fill="#f59e0b" /><rect x="9" y="29" width="14" height="2.5" fill="#f59e0b" rx="1" /></>,
    '100m_plus': <><polygon points="16,1 20,11 30,11 22,17 25,28 16,22 7,28 10,17 2,11 12,11" fill="none" stroke="#f59e0b" strokeWidth="3" /><polygon points="16,5 19,13 26,13 21,17 23,25 16,20 9,25 11,17 6,13 13,13" fill="#f59e0b" /><circle cx="16" cy="15" r="5" fill="#111" /><circle cx="16" cy="15" r="2.5" fill="#f59e0b" /><rect x="8" y="29" width="16" height="2.5" fill="#f59e0b" rx="1" /><rect x="8" y="32.5" width="16" height="2.5" fill="#f59e0b" rx="1" /></>,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg viewBox="0 0 32 36" width="48" height="54">
        {insignia[tier] ?? insignia['under_500k']}
      </svg>
      <span style={{ color: '#f59e0b', fontSize: '9px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', textTransform: 'uppercase' }}>
        {title}
      </span>
      {clubLabel && (
        <span style={{ color: '#a88a30', fontSize: '7px', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, letterSpacing: '0.08em', textAlign: 'center', textTransform: 'uppercase', opacity: 0.85 }}>
          {clubLabel}
        </span>
      )}
    </div>
  );
}

function troopTierLabel(tier: string | null): string {
  if (tier === 't11') return 'T11';
  if (tier === 't10') return 'T10';
  if (tier === 'under_t10') return 'Under T10';
  return '—';
}

function troopTypeLabel(t: string | null): string {
  if (!t) return '—';
  return t.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export default function CommanderCardPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<CommanderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameFontSize, setNameFontSize] = useState(32);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/signin'); return; }
      const { data: profile } = await supabase
        .from('commander_profile')
        .select('commander_name, server_number, computed_server_day, hq_level, troop_type, troop_tier, squad_power_tier, rank_bucket, kill_tier, alliance_name, alliance_tag, season, subscription_tier')
        .eq('user_id', session.user.id)
        .single();
      if (profile) setData(profile as CommanderData);
      setLoading(false);
    })();
  }, [router]);

  // Auto-scale name font size to fit card width
  useEffect(() => {
    if (!nameRef.current || !data?.commander_name) return;
    const MAX_SIZE = 32;
    const MIN_SIZE = 14;
    const AVAILABLE_WIDTH = 260; // 360px card - 20px left pad - 80px right (badge area)

    let size = MAX_SIZE;
    nameRef.current.style.fontSize = `${size}px`;

    while (nameRef.current.scrollWidth > AVAILABLE_WIDTH && size > MIN_SIZE) {
      size -= 0.5;
      nameRef.current.style.fontSize = `${size}px`;
    }

    setNameFontSize(size);
  }, [data?.commander_name]);

const exportCard = async (format: 'png' | 'jpg') => {
  if (!cardRef.current || exporting) return;
  setExporting(true);
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, {
      background: '#000000',
      useCORS: true,
      logging: false,
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
    });
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : undefined;
    const url = canvas.toDataURL(mimeType, quality);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';

    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'max-width:100%;max-height:75vh;border-radius:12px;display:block;';

    const msg = document.createElement('p');
    msg.innerText = 'Press and hold image → Save to Photos';
    msg.style.cssText = 'color:#d4a017;font-size:15px;font-family:sans-serif;margin-top:20px;text-align:center;';

    const btn = document.createElement('button');
    btn.innerText = '✕ Close';
    btn.style.cssText = 'margin-top:16px;background:#333;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;';
    btn.onclick = () => document.body.removeChild(overlay);

    overlay.appendChild(img);
    overlay.appendChild(msg);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    setExporting(false);
  }
};

  const copyLink = async () => {
    await navigator.clipboard.writeText('https://LastWarSurvivalBuddy.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Loading...</div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-zinc-500 text-sm">Could not load profile.</div>
    </div>
  );

  const serverDay  = data.computed_server_day ?? '—';
  const squadPower = data.squad_power_tier ? SQUAD_POWER_TIER_LABELS[data.squad_power_tier] : '—';
  const rankLabel  = data.rank_bucket ? RANK_BUCKET_LABELS[data.rank_bucket] : '—';
  const alliance   = data.alliance_tag
    ? `[${data.alliance_tag}] ${data.alliance_name ?? ''}`
    : (data.alliance_name ?? null);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-start py-8 px-4 gap-6">

      <div className="w-full max-w-sm flex items-center justify-between">
        <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">← Back</button>
        <h1 className="text-zinc-300 text-sm font-semibold tracking-widest uppercase">Commander Card</h1>
        <div className="w-12" />
      </div>

      {/* Card — 360×640 (9:16) */}
      <div
        ref={cardRef}
        style={{
          width: '360px', height: '640px',
          background: 'linear-gradient(160deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)',
          border: '1px solid #2a2a1a', borderRadius: '12px',
          position: 'relative', overflow: 'hidden',
          fontFamily: "'Rajdhani', sans-serif", flexShrink: 0,
        }}
      >
        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)', pointerEvents: 'none' }} />

        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderTop: '2px solid #d4a017', borderLeft: '2px solid #d4a017', borderRadius: '12px 0 0 0', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 32, height: 32, borderTop: '2px solid #d4a017', borderRight: '2px solid #d4a017', borderRadius: '0 12px 0 0', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 32, height: 32, borderBottom: '2px solid #d4a017', borderLeft: '2px solid #d4a017', borderRadius: '0 0 0 12px', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderBottom: '2px solid #d4a017', borderRight: '2px solid #d4a017', borderRadius: '0 0 12px 0', zIndex: 1 }} />

        {/* Diagonal slash */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.06 }}>
          <line x1="0" y1="200" x2="360" y2="440" stroke="#d4a017" strokeWidth="60" />
        </svg>

        {/* Top bar */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0' }}>
          <div style={{ background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.4)', borderRadius: '6px', padding: '4px 10px', color: '#d4a017', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            S-{data.server_number ?? '—'} · Day {serverDay}
          </div>
          <div style={{ color: '#6b6b4a', fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right' }}>
            LAST WAR<br />SURVIVAL BUDDY
          </div>
        </div>

        {/* Kill tier badge */}
        <div style={{ position: 'absolute', top: '60px', right: '20px', zIndex: 2 }}>
          <KillTierBadge tier={data.kill_tier} />
        </div>

        {/* Commander name */}
        <div style={{ position: 'relative', zIndex: 2, padding: '28px 20px 0 20px' }}>
          <div
            ref={nameRef}
            style={{
              color: '#f5f5f5',
              fontSize: `${nameFontSize}px`,
              fontWeight: 800,
              letterSpacing: '0.03em',
              lineHeight: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
          >
            {data.commander_name ?? 'COMMANDER'}
          </div>
          {alliance && (
            <div style={{ color: '#d4a017', fontSize: '12px', fontWeight: 600, marginTop: '4px', letterSpacing: '0.05em' }}>
              {alliance}
            </div>
          )}
          <div style={{ marginTop: '6px', height: '2px', width: '48px', background: 'linear-gradient(90deg, #d4a017, transparent)' }} />
        </div>

        {/* Divider */}
        <div style={{ margin: '20px 20px 0', borderTop: '1px solid rgba(212,160,23,0.15)', position: 'relative', zIndex: 2 }} />

        {/* Stats grid */}
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', margin: '16px 20px 0', border: '1px solid rgba(212,160,23,0.12)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(212,160,23,0.06)' }}>
          {[
            { label: 'HQ Level',      value: data.hq_level ?? '—' },
            { label: 'Troop Tier',    value: troopTierLabel(data.troop_tier) },
            { label: 'Squad 1 Type',  value: troopTypeLabel(data.troop_type) },
            { label: 'Squad 1 Power', value: squadPower },
            { label: 'Server Rank',   value: rankLabel },
            { label: 'Kill Tier',     value: data.kill_tier ? KILL_TIER_TITLES[data.kill_tier] : '—' },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.3)', borderRight: i % 2 === 0 ? '1px solid rgba(212,160,23,0.1)' : 'none', borderBottom: i < 4 ? '1px solid rgba(212,160,23,0.1)' : 'none' }}>
              <div style={{ color: '#6b6b4a', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{stat.label}</div>
              <div style={{ color: '#e5e5e5', fontSize: '16px', fontWeight: 700 }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Season badge */}
        {data.season != null && (
          <div style={{ position: 'relative', zIndex: 2, padding: '16px 20px 0' }}>
            <span style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.25)', borderRadius: '4px', color: '#a88a30', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', textTransform: 'uppercase' }}>
              Season {data.season}
            </span>
          </div>
        )}

        {/* Bottom branding */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: '0 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: '#3d3d2a', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>lastwarsurvivalbuddy.com</div>
          <div style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)', borderRadius: '4px', padding: '3px 8px', color: '#6b6b4a', fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Fan Tool · Not Official</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <div className="flex gap-3">
          <button onClick={() => exportCard('png')} disabled={exporting} className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-black disabled:text-zinc-500 font-bold py-3 rounded-lg text-sm tracking-wide transition-colors">
            {exporting ? 'Exporting...' : '⬇ Download PNG'}
          </button>
          <button onClick={() => exportCard('jpg')} disabled={exporting} className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-zinc-200 disabled:text-zinc-500 font-bold py-3 rounded-lg text-sm tracking-wide transition-colors">
            {exporting ? '...' : '⬇ Download JPG'}
          </button>
        </div>
        <button onClick={copyLink} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-lg text-sm tracking-wide transition-colors border border-zinc-700">
          {copied ? '✓ Link Copied!' : '🔗 Copy LWSB Link'}
        </button>
        <button onClick={() => router.push('/dashboard')} className="w-full text-zinc-600 hover:text-zinc-400 text-sm py-2 transition-colors">
          Back to Dashboard
        </button>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;800&display=swap');`}</style>
    </div>
  );
}
