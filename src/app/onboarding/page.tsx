'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  SQUAD_POWER_TIER_LABELS,
  RANK_BUCKET_LABELS,
  POWER_BUCKET_LABELS,
  KILL_TIER_LABELS,
  SEASON_LABELS,
  BEGINNER_MODE_DESCRIPTION,
  type SquadPowerTier,
  type RankBucket,
  type PowerBucket,
  type KillTier,
} from '@/lib/profileTypes';

const supabase =
  typeof window !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

const theme = {
  bg: '#0a0c10',
  surface: '#111318',
  border: '#1e2229',
  gold: '#c9a84c',
  goldLight: '#e8c96a',
  goldDim: '#7a6030',
  text: '#e8e6e0',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  red: '#ef4444',
  green: '#22c55e',
};

const TOTAL_STEPS = 13;

interface ProfileData {
  commander_name: string;
  server_number: string | number;
  server_day: string | number;
  season: number;
  hq_level: string | number;
  spend_style: string; // FIX: was spend_tier — must match DB column and all other paths
  playstyle: string;
  troop_type: string;
  troop_tier: string;
  rank_bucket: RankBucket | '';
  squad_power_tier: SquadPowerTier | '';
  power_bucket: PowerBucket | '';
  kill_tier: KillTier | '';
  beginner_mode: boolean;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <div style={{ width: '100%', marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: theme.textMuted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Commander Profile
        </span>
        <span style={{ fontSize: 11, color: theme.goldDim, letterSpacing: '0.08em' }}>
          {step - 1} / {TOTAL_STEPS - 1}
        </span>
      </div>
      <div style={{ height: 2, background: theme.border, borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${theme.goldDim}, ${theme.gold})`,
            borderRadius: 2,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 26, fontWeight: 700, color: theme.text, letterSpacing: '0.04em', margin: 0, lineHeight: 1.2 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HintBox({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: `${theme.gold}10`, border: `1px solid ${theme.goldDim}`, borderRadius: 8, padding: '10px 14px', marginTop: 12, marginBottom: 4 }}>
      <span style={{ fontSize: 16 }}>💡</span>
      <span style={{ color: theme.goldDim, fontSize: 13, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  step,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  step: number;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
      {step > 1 && (
        <button onClick={onBack} style={btnStyle('ghost')}>← Back</button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{ ...btnStyle('gold'), flex: 1, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}
      >
        {nextLabel}
      </button>
    </div>
  );
}

function btnStyle(variant: 'gold' | 'ghost'): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '14px 24px',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
    fontFamily: '"Rajdhani", "Oswald", sans-serif',
  };
  if (variant === 'gold') return { ...base, background: theme.gold, color: '#0a0c10' };
  return { ...base, background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}` };
}

function OptionCard({
  label,
  sublabel,
  icon,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '14px 16px',
        background: selected ? `${theme.gold}12` : theme.surface,
        border: `1px solid ${selected ? theme.gold : theme.border}`,
        borderRadius: 8,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s',
        marginBottom: 8,
      }}
    >
      {icon && <span style={{ fontSize: 22, minWidth: 28 }}>{icon}</span>}
      <div>
        <div style={{ color: selected ? theme.gold : theme.text, fontWeight: 600, fontSize: 15, fontFamily: '"Rajdhani", "Oswald", sans-serif', letterSpacing: '0.03em' }}>
          {label}
        </div>
        {sublabel && <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? theme.gold : theme.border}`, background: selected ? theme.gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected && <span style={{ color: '#0a0c10', fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
    </button>
  );
}

function ChipGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Record<T, string>;
  value: T | '';
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {(Object.entries(options) as [T, string][]).map(([key, label]) => {
        const selected = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '10px 14px',
              background: selected ? `${theme.gold}18` : theme.surface,
              border: `1px solid ${selected ? theme.gold : theme.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              color: selected ? theme.gold : theme.textDim,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: '"Rajdhani", "Oswald", sans-serif',
              letterSpacing: '0.03em',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  min,
  max,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      style={{
        width: '100%',
        padding: '14px 16px',
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 8,
        color: theme.text,
        fontSize: 18,
        fontFamily: '"Rajdhani", "Oswald", sans-serif',
        fontWeight: 600,
        letterSpacing: '0.05em',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => (e.target.style.borderColor = theme.gold)}
      onBlur={e => (e.target.style.borderColor = theme.border)}
    />
  );
}

// ─── STEPS ──────────────────────────────────────────────────────────────────

function Step1_Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
        <h1 style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 32, fontWeight: 700, color: theme.gold, letterSpacing: '0.06em', margin: 0 }}>
          LAST WAR: SURVIVAL BUDDY
        </h1>
        <p style={{ color: theme.textDim, fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
          Your personalized daily action plan — built around<br />your server, your rank, your goals.
        </p>
      </div>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
        {[
          ['🗓️', 'Know your server day and upcoming events'],
          ['⚔️', 'Get the 3–5 highest-leverage moves every day'],
          ['💡', 'Buddy AI answers questions with your full context'],
          ['💰', 'Spend advice tuned to your budget'],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
            <span style={{ fontSize: 18, minWidth: 24 }}>{icon}</span>
            <span style={{ color: theme.textDim, fontSize: 14, lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
      <p style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 24 }}>
        Takes about 2 minutes. You can update everything later.
      </p>
      <button onClick={onNext} style={{ ...btnStyle('gold'), width: '100%', fontSize: 16, padding: '16px 24px' }}>
        Build My Commander Profile →
      </button>
    </div>
  );
}

type TagStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

function Step2_CommanderTag({ data, setData, onNext, onBack, step }: StepProps) {
  const [status, setStatus] = useState<TagStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const validate = (val: string): string | null => {
    if (val.length < 3) return 'Too short — minimum 3 characters';
    if (val.length > 20) return 'Too long — maximum 20 characters';
    if (!/^[a-zA-Z0-9_ ]+$/.test(val)) return 'Letters, numbers, underscores, and spaces only';
    return null;
  };

  const checkAvailability = useCallback(async (val: string) => {
    const err = validate(val);
    if (err) { setStatus('invalid'); setStatusMsg(err); return; }
    if (!supabase) return;
    setStatus('checking');
    setStatusMsg('Checking availability...');
    try {
      const { data: existing } = await supabase
        .from('profiles').select('id').ilike('commander_name', val).limit(1);
      if (existing && existing.length > 0) {
        setStatus('taken');
        setStatusMsg('That tag is already taken — try another');
      } else {
        setStatus('available');
        setStatusMsg('✓ Available!');
      }
    } catch {
      setStatus('idle');
      setStatusMsg('');
    }
  }, []);

  useEffect(() => {
    if (!data.commander_name || data.commander_name.length < 3) {
      if (data.commander_name && data.commander_name.length > 0) {
        const err = validate(data.commander_name);
        if (err) { setStatus('invalid'); setStatusMsg(err); }
      } else {
        setStatus('idle');
        setStatusMsg('');
      }
      return;
    }
    const timer = setTimeout(() => checkAvailability(data.commander_name), 500);
    return () => clearTimeout(timer);
  }, [data.commander_name, checkAvailability]);

  const statusColor = status === 'available' ? theme.green : status === 'taken' || status === 'invalid' ? theme.red : theme.textMuted;

  return (
    <div>
      <StepTitle title="Choose your Commander Tag" subtitle="This is your identity in the app — use your in-game name or gaming tag." />
      {data.commander_name && status === 'available' && (
        <div style={{ textAlign: 'center', padding: '16px', marginBottom: 20, background: `${theme.gold}10`, border: `1px solid ${theme.goldDim}`, borderRadius: 10 }}>
          <p style={{ color: theme.textMuted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>You'll appear as</p>
          <p style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 22, fontWeight: 700, color: theme.gold, letterSpacing: '0.04em' }}>
            Commander {data.commander_name}
          </p>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={data.commander_name}
          onChange={e => setData({ ...data, commander_name: e.target.value })}
          placeholder="e.g. Iron Wolf 1032"
          maxLength={20}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: theme.surface,
            border: `1px solid ${status === 'available' ? theme.green : status === 'taken' || status === 'invalid' ? theme.red : theme.border}`,
            borderRadius: 8,
            color: theme.text,
            fontSize: 18,
            fontFamily: '"Rajdhani", "Oswald", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: theme.textMuted }}>
          {(data.commander_name || '').length}/20
        </span>
      </div>
      {statusMsg && (
        <p style={{ color: statusColor, fontSize: 13, marginTop: 8, minHeight: 20 }}>
          {status === 'checking' ? '⏳ ' : ''}{statusMsg}
        </p>
      )}
      <div style={{ marginTop: 16, padding: '12px 14px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8 }}>
        {['3–20 characters', 'Letters, numbers, underscores, and spaces', 'Must be unique across all commanders'].map(rule => (
          <div key={rule} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ color: theme.goldDim, fontSize: 12 }}>—</span>
            <span style={{ color: theme.textMuted, fontSize: 12 }}>{rule}</span>
          </div>
        ))}
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={status !== 'available'} />
    </div>
  );
}

interface StepProps {
  data: ProfileData;
  setData: (d: ProfileData) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
}

function Step3_Server({ data, setData, onNext, onBack, step }: StepProps) {
  const valid = data.server_number && parseInt(String(data.server_number)) > 0;
  return (
    <div>
      <StepTitle title="What's your server number?" subtitle="Found in the bottom-left of your game map, or in your profile." />
      <NumberInput value={data.server_number} onChange={v => setData({ ...data, server_number: v })} placeholder="e.g. 1032" min={1} />
      <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
        This is how we track your server's event calendar and Arms Race timing.
      </p>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step4_ServerDay({ data, setData, onNext, onBack, step }: StepProps) {
  const valid = data.server_day && parseInt(String(data.server_day)) > 0;
  return (
    <div>
      <StepTitle title="What day is your server on?" subtitle="This tells us which events are active and what's coming up." />
      <NumberInput value={data.server_day} onChange={v => setData({ ...data, server_day: v })} placeholder="e.g. 502" min={1} />
      <HintBox text="Tap the VIP emblem at the top of your base screen. The number of days shown is your server day." />
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step5_Season({ data, setData, onNext, onBack, step }: StepProps) {
  const seasons = [0, 1, 2, 3, 4, 5];
  return (
    <div>
      <StepTitle title="What season is your server on?" subtitle="Check your Season Progress tab or alliance announcements." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {seasons.map(s => (
          <OptionCard
            key={s}
            label={SEASON_LABELS[s]}
            selected={data.season === s}
            onClick={() => setData({ ...data, season: s })}
            icon={s === 5 ? '🤠' : s === 4 ? '⚙️' : s === 0 ? '🌱' : '📅'}
          />
        ))}
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={data.season === undefined || data.season === null} />
    </div>
  );
}

function Step6_HQ({ data, setData, onNext, onBack, step }: StepProps) {
  const valid = data.hq_level && parseInt(String(data.hq_level)) >= 1 && parseInt(String(data.hq_level)) <= 40;
  return (
    <div>
      <StepTitle title="What's your HQ level?" subtitle="Tap your Headquarters building in-game to check." />
      <NumberInput value={data.hq_level} onChange={v => setData({ ...data, hq_level: v })} placeholder="e.g. 35" min={1} max={40} />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {[10, 15, 20, 25, 30, 32, 35].map(lvl => (
          <button
            key={lvl}
            onClick={() => setData({ ...data, hq_level: lvl })}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: `1px solid ${String(data.hq_level) === String(lvl) ? theme.gold : theme.border}`,
              background: String(data.hq_level) === String(lvl) ? `${theme.gold}18` : theme.surface,
              color: String(data.hq_level) === String(lvl) ? theme.gold : theme.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Rajdhani", "Oswald", sans-serif',
            }}
          >
            {lvl}
          </button>
        ))}
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step7_SpendStyle({ data, setData, onNext, onBack, step }: StepProps) {
  const options = [
    { value: 'f2p',        label: 'Free to Play',  sublabel: 'No real money spent',            icon: '🆓' },
    { value: 'budget',     label: 'Budget',         sublabel: 'Occasional small packs (<$20/mo)', icon: '💵' },
    { value: 'moderate',   label: 'Moderate',       sublabel: '$20–$100/mo',                    icon: '💳' },
    { value: 'investor',   label: 'Investor',       sublabel: '$100–$500/mo',                   icon: '📈' },
    { value: 'whale',      label: 'Whale',          sublabel: '$500–$2,000/mo',                 icon: '🐋' },
    { value: 'mega_whale', label: 'Mega Whale',     sublabel: '$2,000+/mo',                     icon: '🔱' },
  ];
  return (
    <div>
      <StepTitle title="What's your spend style?" subtitle="Be honest — this shapes your pack recommendations." />
      {options.map(o => (
        <OptionCard
          key={o.value}
          {...o}
          selected={data.spend_style === o.value}  // FIX: was data.spend_tier
          onClick={() => setData({ ...data, spend_style: o.value })}  // FIX: was spend_tier
        />
      ))}
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!data.spend_style} />  {/* FIX: was !data.spend_tier */}
    </div>
  );
}

function Step8_Playstyle({ data, setData, onNext, onBack, step }: StepProps) {
  const options = [
    { value: 'fighter',   label: 'Player vs. Player',       sublabel: 'Kill events, rallies, war — you live for combat',            icon: '⚔️' },
    { value: 'developer', label: 'Player vs. Event',        sublabel: 'Alliance Duel, Arms Race, Zombie Siege — max efficiency',    icon: '🎯' },
    { value: 'commander', label: '50/50 Commander',         sublabel: 'You do both and optimize everything',                        icon: '⚖️' },
    { value: 'scout',     label: 'Still Figuring It Out',   sublabel: 'New to the meta, learning the ropes',                       icon: '🗺️' },
  ];
  return (
    <div>
      <StepTitle title="What's your playstyle?" subtitle="This determines which events and strategies we prioritize for you." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.playstyle === o.value} onClick={() => setData({ ...data, playstyle: o.value })} />
      ))}
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!data.playstyle} />
    </div>
  );
}

function Step9_TroopType({ data, setData, onNext, onBack, step }: StepProps) {
  const options = [
    { value: 'aircraft', label: 'Aircraft',           sublabel: 'Counters Tank',              icon: '✈️' },
    { value: 'tank',     label: 'Tank',               sublabel: 'Counters Missile',           icon: '🛡️' },
    { value: 'missile',  label: 'Missile Vehicle',    sublabel: 'Counters Aircraft',          icon: '🚀' },
    { value: 'mixed',    label: 'Mixed / Not Sure',   sublabel: "Haven't specialized Squad 1 yet", icon: '⚖️' },
  ];
  return (
    <div>
      <StepTitle title="What's your Squad 1 troop type?" subtitle="Check your Squad 1 — your strongest, highest-power squad." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.troop_type === o.value} onClick={() => setData({ ...data, troop_type: o.value })} />
      ))}
      <HintBox text="Squad 1 is the squad with your highest combined hero + troop power. Check your Squad lineup in the Battle menu." />
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!data.troop_type} />
    </div>
  );
}

function Step10_TroopTier({ data, setData, onNext, onBack, step }: StepProps) {
  const options = [
    { value: 'under_t10', label: 'Under T10', sublabel: 'Still working toward T10 unlock', icon: '🔨' },
    { value: 't10',       label: 'T10',       sublabel: 'T10 unlocked and training',       icon: '⚙️' },
    { value: 't11',       label: 'T11',       sublabel: 'Armament Research system — Season 4+', icon: '🔱' },
  ];
  return (
    <div>
      <StepTitle title="What's your highest troop tier?" subtitle="Check your Barracks or Military Research tree." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.troop_tier === o.value} onClick={() => setData({ ...data, troop_tier: o.value })} />
      ))}
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!data.troop_tier} />
    </div>
  );
}

function Step11_RankAndPower({ data, setData, onNext, onBack, step }: StepProps) {
  const rankValid   = !!data.rank_bucket;
  const squadValid  = !!data.squad_power_tier;
  const powerValid  = !!data.power_bucket;
  const canContinue = rankValid && squadValid && powerValid;
  return (
    <div>
      <StepTitle title="Your rank and power" subtitle="Pick the buckets that best describe you right now." />
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: theme.textDim, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Server Rank — Total Hero Power
        </label>
        <p style={{ color: theme.textMuted, fontSize: 12, marginBottom: 10 }}>Find this in Rankings → Total Hero Power.</p>
        <ChipGrid<RankBucket> options={RANK_BUCKET_LABELS} value={data.rank_bucket} onChange={v => setData({ ...data, rank_bucket: v })} />
      </div>
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', color: theme.textDim, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Squad 1 Power
        </label>
        <p style={{ color: theme.textMuted, fontSize: 12, marginBottom: 10 }}>Tap Squad 1 in your Battle screen — the total power shown at the top.</p>
        <ChipGrid<SquadPowerTier> options={SQUAD_POWER_TIER_LABELS} value={data.squad_power_tier} onChange={v => setData({ ...data, squad_power_tier: v })} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', color: theme.textDim, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
          Total Individual Power
        </label>
        <p style={{ color: theme.textMuted, fontSize: 12, marginBottom: 10 }}>Your total power shown on your profile page.</p>
        <ChipGrid<PowerBucket> options={POWER_BUCKET_LABELS} value={data.power_bucket} onChange={v => setData({ ...data, power_bucket: v })} />
      </div>
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!canContinue} />
    </div>
  );
}

function Step12_KillTier({ data, setData, onNext, onBack, step }: StepProps) {
  return (
    <div>
      <StepTitle title="What's your kill count?" subtitle="Check your profile — total kills earned across all events." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(Object.entries(KILL_TIER_LABELS) as [KillTier, string][]).map(([key, label]) => (
          <OptionCard key={key} label={label} selected={data.kill_tier === key} onClick={() => setData({ ...data, kill_tier: key })} />
        ))}
      </div>
      <HintBox text="Find your kill count on your profile page under Combat Stats." />
      <NavButtons step={step} onBack={onBack} onNext={onNext} nextDisabled={!data.kill_tier} />
    </div>
  );
}

// ─── COMPLETE STEP with beginner mode auto-suggest ───────────────────────────
function StepComplete({
  data,
  setData,
  onDone,
}: {
  data: ProfileData;
  setData: (d: ProfileData) => void;
  onDone: () => void;
}) {
  const shouldSuggest = data.playstyle === 'scout' || data.troop_tier === 'under_t10';

  const tierLabels: Record<string, string> = {
    f2p: 'Free to Play', budget: 'Budget', moderate: 'Moderate',
    investor: 'Investor', whale: 'Whale', mega_whale: 'Mega Whale',
  };
  const playstyleLabels: Record<string, string> = {
    fighter: '⚔️ Fighter', developer: '🎯 Developer', commander: '⚖️ Commander', scout: '🗺️ Scout',
  };
  const troopLabels: Record<string, string> = {
    aircraft: '✈️ Aircraft', tank: '🛡️ Tank', missile: '🚀 Missile', mixed: '⚖️ Mixed',
  };
  const troopTierLabels: Record<string, string> = {
    under_t10: 'Under T10', t10: 'T10', t11: 'T11',
  };

  const stats: [string, string][] = [
    ['Commander',   data.commander_name],
    ['Server',      `#${data.server_number} · Day ${data.server_day}`],
    ['Season',      SEASON_LABELS[data.season] ?? String(data.season)],
    ['HQ Level',    String(data.hq_level)],
    ['Spend Style', tierLabels[data.spend_style] ?? data.spend_style],  // FIX: was data.spend_tier
    ['Playstyle',   playstyleLabels[data.playstyle] ?? data.playstyle],
    ['Squad 1 Type', troopLabels[data.troop_type] ?? data.troop_type],
    ['Troop Tier',  troopTierLabels[data.troop_tier] ?? data.troop_tier],
    ['Server Rank', data.rank_bucket ? RANK_BUCKET_LABELS[data.rank_bucket] : ''],
    ['Squad 1 Power', data.squad_power_tier ? SQUAD_POWER_TIER_LABELS[data.squad_power_tier] : ''],
    ['Total Power', data.power_bucket ? POWER_BUCKET_LABELS[data.power_bucket] : ''],
    ['Kill Tier',   data.kill_tier ? KILL_TIER_LABELS[data.kill_tier] : ''],
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎖️</div>
        <h2 style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 28, fontWeight: 700, color: theme.gold, letterSpacing: '0.06em', margin: 0 }}>
          COMMANDER PROFILE COMPLETE
        </h2>
        <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>
          Welcome, Commander {data.commander_name}. Buddy is ready.
        </p>
      </div>
      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
        {stats.map(([label, val]) =>
          val && (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textMuted, fontSize: 13 }}>{label}</span>
              <span style={{ color: label === 'Commander' ? theme.gold : theme.text, fontWeight: 600, fontSize: 14, fontFamily: '"Rajdhani", "Oswald", sans-serif' }}>
                {val}
              </span>
            </div>
          )
        )}
      </div>
      {shouldSuggest && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: theme.goldDim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            💡 Recommended for you
          </div>
          <div
            onClick={() => setData({ ...data, beginner_mode: !data.beginner_mode })}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px', borderRadius: 10,
              cursor: 'pointer',
              border: `1px solid ${data.beginner_mode ? theme.gold : theme.border}`,
              background: data.beginner_mode ? `${theme.gold}12` : theme.surface,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ position: 'relative', marginTop: 2, flexShrink: 0, width: 40, height: 20, borderRadius: 10, background: data.beginner_mode ? theme.gold : '#374151', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: data.beginner_mode ? 'translateX(22px)' : 'translateX(2px)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: data.beginner_mode ? theme.gold : theme.text, fontWeight: 700, fontSize: 15, fontFamily: '"Rajdhani", "Oswald", sans-serif', letterSpacing: '0.03em', marginBottom: 4 }}>
                Beginner Mode
              </div>
              <div style={{ color: theme.textMuted, fontSize: 12, lineHeight: 1.5 }}>
                {BEGINNER_MODE_DESCRIPTION}
              </div>
              {data.beginner_mode && (
                <div style={{ marginTop: 8, color: theme.gold, fontSize: 12, fontWeight: 600 }}>
                  ✓ Turned on — you can change this anytime in your profile.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <button onClick={onDone} style={{ ...btnStyle('gold'), width: '100%', fontSize: 16, padding: '16px 24px' }}>
        Show My Daily Action Plan →
      </button>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function calcServerStartDate(serverDay: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (serverDay - 1));
  return d.toISOString().split('T')[0];
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProfileData>({
    commander_name: '',
    server_number: '',
    server_day: '',
    season: 0,
    hq_level: '',
    spend_style: '',  // FIX: was spend_tier
    playstyle: '',
    troop_type: '',
    troop_tier: '',
    rank_bucket: '',
    squad_power_tier: '',
    power_bucket: '',
    kill_tier: '',
    beginner_mode: false,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile && !profile.onboarding_complete) {
        setData(prev => ({
          ...prev,
          commander_name: profile.commander_name || '',
          server_number:  profile.server_number  || '',
          server_day:     profile.server_day     || '',
          season:         profile.season ?? 0,
          hq_level:       profile.hq_level       || '',
          // FIX: read spend_style first, fall back to legacy spend_tier for existing rows
          spend_style:    profile.spend_style || profile.spend_tier || '',
          playstyle:      profile.playstyle      || '',
          troop_type:     profile.troop_type     || '',
          troop_tier:     profile.troop_tier     || '',
          rank_bucket:    profile.rank_bucket    || '',
          squad_power_tier: profile.squad_power_tier || '',
          power_bucket:   profile.power_bucket   || '',
          kill_tier:      profile.kill_tier      || '',
          beginner_mode:  profile.beginner_mode ?? false,
        }));
        if (profile.onboarding_step > 1) setStep(profile.onboarding_step);
      }
    }
    loadProfile();
  }, []);

  async function saveProgress(nextStep: number, complete = false) {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const serverDay = parseInt(String(data.server_day)) || 0;
      const serverStartDate = serverDay > 0 ? calcServerStartDate(serverDay) : null;
      const { error: upsertError } = await supabase.from('profiles').update({
        commander_name:  data.commander_name || null,
        server_number:   parseInt(String(data.server_number)) || 0,
        server_day:      serverDay,
        season:          data.season ?? 0,
        hq_level:        parseInt(String(data.hq_level)) || 1,
        spend_style:     data.spend_style || 'f2p',  // FIX: was spend_tier: data.spend_tier
        playstyle:       data.playstyle || 'scout',
        troop_type:      data.troop_type || 'mixed',
        troop_tier:      data.troop_tier || 'under_t10',
        rank_bucket:     data.rank_bucket || null,
        squad_power_tier: data.squad_power_tier || null,
        power_bucket:    data.power_bucket || null,
        kill_tier:       data.kill_tier || null,
        beginner_mode:   data.beginner_mode,
        onboarding_step: nextStep,
        onboarding_complete: complete,
        server_start_date: serverStartDate,
        last_profile_update: new Date().toISOString(),
        update_reminder_frequency: 'weekly',
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      if (upsertError) throw upsertError;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setSaving(false);
    }
  }

  async function advance() {
    const nextStep = step + 1;
    await saveProgress(nextStep);
    setStep(nextStep);
  }

  function back() { setStep(s => Math.max(1, s - 1)); }

  async function complete() {
    await saveProgress(TOTAL_STEPS + 1, true);
    window.location.href = '/dashboard';
  }

  const stepProps: StepProps = { data, setData, onNext: advance, onBack: back, step };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${theme.bg}; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
      <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px 60px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <span style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 13, fontWeight: 700, color: theme.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              LWSB
            </span>
            {step > 1 && step <= TOTAL_STEPS && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>Step {step - 1} of {TOTAL_STEPS - 1}</span>
            )}
          </div>
          {step > 1 && step <= TOTAL_STEPS && <ProgressBar step={step} />}
          {error && (
            <div style={{ background: `${theme.red}18`, border: `1px solid ${theme.red}`, borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: theme.red, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}
          {saving && <div style={{ color: theme.goldDim, fontSize: 12, textAlign: 'right', marginBottom: 8 }}>Saving...</div>}
          {step === 1  && <Step1_Welcome onNext={advance} />}
          {step === 2  && <Step2_CommanderTag {...stepProps} />}
          {step === 3  && <Step3_Server {...stepProps} />}
          {step === 4  && <Step4_ServerDay {...stepProps} />}
          {step === 5  && <Step5_Season {...stepProps} />}
          {step === 6  && <Step6_HQ {...stepProps} />}
          {step === 7  && <Step7_SpendStyle {...stepProps} />}
          {step === 8  && <Step8_Playstyle {...stepProps} />}
          {step === 9  && <Step9_TroopType {...stepProps} />}
          {step === 10 && <Step10_TroopTier {...stepProps} />}
          {step === 11 && <Step11_RankAndPower {...stepProps} />}
          {step === 12 && <Step12_KillTier {...stepProps} />}
          {step === 13 && <StepComplete data={data} setData={setData} onDone={complete} />}
        </div>
      </div>
    </>
  );
}
