'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase =
  typeof window !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

// ─── THEME ────────────────────────────────────────────────────────────────────
const theme = {
  bg: '#0a0c10',
  surface: '#111318',
  surfaceHover: '#16191f',
  border: '#1e2229',
  borderActive: '#c9a84c',
  gold: '#c9a84c',
  goldLight: '#e8c96a',
  goldDim: '#7a6030',
  text: '#e8e6e0',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  red: '#ef4444',
  green: '#22c55e',
};

// ─── STEP CONFIG ──────────────────────────────────────────────────────────────
const TOTAL_STEPS = 11;

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function ProgressBar({ step }) {
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

function StepTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{
        fontFamily: '"Rajdhani", "Oswald", sans-serif',
        fontSize: 26,
        fontWeight: 700,
        color: theme.text,
        letterSpacing: '0.04em',
        margin: 0,
        lineHeight: 1.2,
      }}>
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

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, step }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
      {step > 1 && (
        <button onClick={onBack} style={btnStyle('ghost')}>
          ← Back
        </button>
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

function btnStyle(variant) {
  const base = {
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
  if (variant === 'ghost') return { ...base, background: 'transparent', color: theme.textMuted, border: `1px solid ${theme.border}` };
  return base;
}

function OptionCard({ label, sublabel, icon, selected, onClick }) {
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
        <div style={{ color: selected ? theme.gold : theme.text, fontWeight: 600, fontSize: 15,
          fontFamily: '"Rajdhani", "Oswald", sans-serif', letterSpacing: '0.03em' }}>
          {label}
        </div>
        {sublabel && <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${selected ? theme.gold : theme.border}`,
        background: selected ? theme.gold : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <span style={{ color: '#0a0c10', fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
    </button>
  );
}

function MultiCard({ label, sublabel, icon, selected, onClick }) {
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
        <div style={{ color: selected ? theme.gold : theme.text, fontWeight: 600, fontSize: 15,
          fontFamily: '"Rajdhani", "Oswald", sans-serif', letterSpacing: '0.03em' }}>
          {label}
        </div>
        {sublabel && <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: 4,
        border: `2px solid ${selected ? theme.gold : theme.border}`,
        background: selected ? theme.gold : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <span style={{ color: '#0a0c10', fontSize: 11, fontWeight: 900 }}>✓</span>}
      </div>
    </button>
  );
}

function NumberInput({ value, onChange, placeholder, min, max }) {
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

// ─── STEPS ───────────────────────────────────────────────────────────────────

function Step1_Welcome({ onNext }) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
        <h1 style={{
          fontFamily: '"Rajdhani", "Oswald", sans-serif',
          fontSize: 32,
          fontWeight: 700,
          color: theme.gold,
          letterSpacing: '0.06em',
          margin: 0,
        }}>
          LAST WAR: SURVIVAL BUDDY
        </h1>
        <p style={{ color: theme.textDim, fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
          Your personalized daily action plan — built around<br />
          your server, your rank, your goals.
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

function Step2_Server({ data, setData, onNext, onBack }) {
  const valid = data.server_number && parseInt(data.server_number) > 0;
  return (
    <div>
      <StepTitle title="What's your server number?" subtitle="Found in the bottom-left of your game map, or in your profile." />
      <NumberInput
        value={data.server_number}
        onChange={v => setData({ ...data, server_number: v })}
        placeholder="e.g. 1032"
        min={1}
      />
      <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
        This is how we track your server's event calendar and Arms Race timing.
      </p>
      <NavButtons step={2} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step3_ServerDay({ data, setData, onNext, onBack }) {
  const valid = data.server_day && parseInt(data.server_day) > 0;
  return (
    <div>
      <StepTitle title="What day is your server on?" subtitle="Check the Arms Race screen or your alliance info panel." />
      <NumberInput
        value={data.server_day}
        onChange={v => setData({ ...data, server_day: v })}
        placeholder="e.g. 502"
        min={1}
      />
      <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 10 }}>
        Server day determines which events are active and what's coming up.
      </p>
      <NavButtons step={3} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step4_HQ({ data, setData, onNext, onBack }) {
  const valid = data.hq_level && parseInt(data.hq_level) >= 1 && parseInt(data.hq_level) <= 40;
  return (
    <div>
      <StepTitle title="What's your HQ level?" subtitle="Tap your Headquarters building in-game to check." />
      <NumberInput
        value={data.hq_level}
        onChange={v => setData({ ...data, hq_level: v })}
        placeholder="e.g. 35"
        min={1}
        max={40}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {[10, 15, 20, 25, 30, 32, 35].map(lvl => (
          <button
            key={lvl}
            onClick={() => setData({ ...data, hq_level: lvl })}
            style={{
              padding: '8px 14px',
              borderRadius: 6,
              border: `1px solid ${data.hq_level == lvl ? theme.gold : theme.border}`,
              background: data.hq_level == lvl ? `${theme.gold}18` : theme.surface,
              color: data.hq_level == lvl ? theme.gold : theme.textMuted,
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
      <NavButtons step={4} onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function Step5_SpendTier({ data, setData, onNext, onBack }) {
  const options = [
    { value: 'f2p', label: 'Free to Play', sublabel: 'No real money spent', icon: '🆓' },
    { value: 'budget', label: 'Budget', sublabel: 'Occasional small packs (<$20/mo)', icon: '💵' },
    { value: 'moderate', label: 'Moderate', sublabel: '$20–$100/mo', icon: '💳' },
    { value: 'investor', label: 'Investor', sublabel: '$100–$500/mo', icon: '📈' },
    { value: 'whale', label: 'Whale', sublabel: '$500–$2,000/mo', icon: '🐋' },
    { value: 'mega_whale', label: 'Mega Whale', sublabel: '$2,000+/mo', icon: '🔱' },
  ];
  return (
    <div>
      <StepTitle title="What's your spend style?" subtitle="Be honest — this shapes your pack recommendations." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.spend_tier === o.value}
          onClick={() => setData({ ...data, spend_tier: o.value })} />
      ))}
      <NavButtons step={5} onBack={onBack} onNext={onNext} nextDisabled={!data.spend_tier} />
    </div>
  );
}

function Step6_Playstyle({ data, setData, onNext, onBack }) {
  const options = [
    { value: 'fighter', label: 'Player vs. Player', sublabel: 'Kill events, rallies, war — you live for combat', icon: '⚔️' },
    { value: 'developer', label: 'Player vs. Event', sublabel: 'Alliance Duel, Arms Race, Zombie Siege — max efficiency', icon: '🎯' },
    { value: 'commander', label: '50/50 Commander', sublabel: 'You do both and optimize everything', icon: '⚖️' },
    { value: 'scout', label: 'Still Figuring It Out', sublabel: "New to the meta, learning the ropes", icon: '🗺️' },
  ];
  return (
    <div>
      <StepTitle title="What's your playstyle?" subtitle="This determines which events and strategies we prioritize for you." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.playstyle === o.value}
          onClick={() => setData({ ...data, playstyle: o.value })} />
      ))}
      <NavButtons step={6} onBack={onBack} onNext={onNext} nextDisabled={!data.playstyle} />
    </div>
  );
}

function Step7_TroopType({ data, setData, onNext, onBack }) {
  const options = [
    { value: 'aircraft', label: 'Aircraft', sublabel: 'Beats Infantry — high mobility', icon: '✈️' },
    { value: 'tank', label: 'Tank', sublabel: 'Beats Aircraft — heavy armor', icon: '🛡️' },
    { value: 'missile', label: 'Missile Vehicle', sublabel: 'Counters all types — lower sustained power', icon: '🚀' },
    { value: 'mixed', label: 'Mixed', sublabel: "Haven't specialized yet", icon: '⚖️' },
  ];
  return (
    <div>
      <StepTitle title="What's your primary troop type?" subtitle="Specialization matters more than raw numbers after Day 70." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.troop_type === o.value}
          onClick={() => setData({ ...data, troop_type: o.value })} />
      ))}
      <NavButtons step={7} onBack={onBack} onNext={onNext} nextDisabled={!data.troop_type} />
    </div>
  );
}

function Step8_TroopTier({ data, setData, onNext, onBack }) {
  const options = [
    { value: 't8', label: 'T8', sublabel: 'HQ 8–12 range', icon: null },
    { value: 't9', label: 'T9', sublabel: 'HQ 12–16 range', icon: null },
    { value: 't10_working', label: 'T10 — Working Towards It', sublabel: 'HQ 16–29, not yet unlocked', icon: null },
    { value: 't10_unlocked', label: 'T10 — Unlocked ✓', sublabel: 'Training T10 troops now', icon: null },
    { value: 't11', label: 'T11', sublabel: 'HQ 31–35, Season 4+', icon: null },
    { value: 't12', label: 'T12', sublabel: 'Endgame tier', icon: null },
  ];
  return (
    <div>
      <StepTitle title="What's your highest troop tier?" subtitle="Check your Barracks or Military Research tree." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.troop_tier === o.value}
          onClick={() => setData({ ...data, troop_tier: o.value })} />
      ))}
      <NavButtons step={8} onBack={onBack} onNext={onNext} nextDisabled={!data.troop_tier} />
    </div>
  );
}

function Step9_Rank({ data, setData, onNext, onBack }) {
  const options = [
    { value: 'top_5', label: 'Top 5', sublabel: 'Elite — server anchor', icon: '🥇' },
    { value: 'top_10', label: 'Top 6–10', sublabel: 'Dominant force', icon: '🥈' },
    { value: 'top_20', label: 'Top 11–20', sublabel: 'Serious competitor', icon: '🥉' },
    { value: 'top_50', label: 'Top 21–50', sublabel: 'Strong mid-tier', icon: '🎖️' },
    { value: 'top_100', label: 'Top 51–100', sublabel: 'Established player', icon: '🏅' },
    { value: 'still_building', label: 'Still Building', sublabel: 'Outside top 100', icon: '🔨' },
  ];
  return (
    <div>
      <StepTitle title="What's your server rank?" subtitle="Check the leaderboard — top right of your map screen." />
      {options.map(o => (
        <OptionCard key={o.value} {...o} selected={data.server_rank === o.value}
          onClick={() => setData({ ...data, server_rank: o.value })} />
      ))}
      <NavButtons step={9} onBack={onBack} onNext={onNext} nextDisabled={!data.server_rank} />
    </div>
  );
}

function Step10_Power({ data, setData, onNext, onBack }) {
  const formatPower = (val) => {
    if (!val) return '';
    const n = parseInt(val.toString().replace(/,/g, ''));
    if (isNaN(n)) return '';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  const fields = [
    { key: 'hero_power', label: 'Hero Power', placeholder: 'e.g. 178500000' },
    { key: 'total_power', label: 'Total Power', placeholder: 'e.g. 450000000' },
  ];

  return (
    <div>
      <StepTitle title="What's your power?" subtitle="Open your profile in-game to check. Enter raw numbers — no commas needed." />
      {fields.map(f => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: theme.textDim, fontSize: 12,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            {f.label}
            {data[f.key] && (
              <span style={{ marginLeft: 8, color: theme.gold, textTransform: 'none', letterSpacing: 0 }}>
                = {formatPower(data[f.key])}
              </span>
            )}
          </label>
          <NumberInput
            value={data[f.key] || ''}
            onChange={v => setData({ ...data, [f.key]: v })}
            placeholder={f.placeholder}
          />
        </div>
      ))}
      <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
        You can skip this and add it later from your profile.
      </p>
      <NavButtons step={10} onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}

function Step11_Goals({ data, setData, onNext, onBack }) {
  const options = [
    { value: 'crack_top10', label: 'Crack Top 10', icon: '🏆' },
    { value: 'unlock_t10', label: 'Unlock T10', icon: '🔓' },
    { value: 'finish_t11', label: 'Finish T11', icon: '⚙️' },
    { value: 'max_hero_power', label: 'Max Hero Power', icon: '💪' },
    { value: 'prep_season5', label: 'Prep for Season 5', icon: '🗺️' },
    { value: 'dominate_alliance_war', label: 'Dominate Alliance War', icon: '⚔️' },
    { value: 'spend_smarter', label: 'Spend Smarter', icon: '💰' },
  ];

  const toggle = (val) => {
    const current = data.goals || [];
    const updated = current.includes(val) ? current.filter(g => g !== val) : [...current, val];
    setData({ ...data, goals: updated });
  };

  return (
    <div>
      <StepTitle title="What are your goals?" subtitle="Pick everything that applies — Buddy will prioritize around these." />
      {options.map(o => (
        <MultiCard key={o.value} label={o.label} icon={o.icon}
          selected={(data.goals || []).includes(o.value)}
          onClick={() => toggle(o.value)} />
      ))}
      <NavButtons step={11} onBack={onBack} onNext={onNext}
        nextLabel="Build My Action Plan →"
        nextDisabled={(data.goals || []).length === 0} />
    </div>
  );
}

function StepComplete({ data, onDone }) {
  const tierLabels = { f2p: 'Free to Play', budget: 'Budget', moderate: 'Moderate', investor: 'Investor', whale: 'Whale', mega_whale: 'Mega Whale' };
  const playstyleLabels = { fighter: '⚔️ Fighter', developer: '🎯 Developer', commander: '⚖️ Commander', scout: '🗺️ Scout' };
  const troopLabels = { aircraft: '✈️ Aircraft', tank: '🛡️ Tank', missile: '🚀 Missile', mixed: '⚖️ Mixed' };

  const stats = [
    ['Server', `#${data.server_number} · Day ${data.server_day}`],
    ['HQ Level', data.hq_level],
    ['Spend Tier', tierLabels[data.spend_tier]],
    ['Playstyle', playstyleLabels[data.playstyle]],
    ['Troop Type', troopLabels[data.troop_type]],
    ['Rank', data.server_rank?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())],
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎖️</div>
        <h2 style={{ fontFamily: '"Rajdhani", "Oswald", sans-serif', fontSize: 28, fontWeight: 700,
          color: theme.gold, letterSpacing: '0.06em', margin: 0 }}>
          COMMANDER PROFILE COMPLETE
        </h2>
        <p style={{ color: theme.textMuted, fontSize: 14, marginTop: 8 }}>
          Buddy is ready to build your daily action plan.
        </p>
      </div>

      <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
        {stats.map(([label, val]) => val && (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
            <span style={{ color: theme.textMuted, fontSize: 13 }}>{label}</span>
            <span style={{ color: theme.text, fontWeight: 600, fontSize: 14,
              fontFamily: '"Rajdhani", "Oswald", sans-serif' }}>{val}</span>
          </div>
        ))}
        {(data.goals || []).length > 0 && (
          <div style={{ paddingTop: 12 }}>
            <span style={{ color: theme.textMuted, fontSize: 13, display: 'block', marginBottom: 8 }}>Goals</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(data.goals || []).map(g => (
                <span key={g} style={{ padding: '4px 10px', background: `${theme.gold}15`,
                  border: `1px solid ${theme.goldDim}`, borderRadius: 20, fontSize: 12, color: theme.gold }}>
                  {g.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={onDone} style={{ ...btnStyle('gold'), width: '100%', fontSize: 16, padding: '16px 24px' }}>
        Show My Daily Action Plan →
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    server_number: '',
    server_day: '',
    hq_level: '',
    spend_tier: '',
    playstyle: '',
    troop_type: '',
    troop_tier: '',
    server_rank: '',
    hero_power: '',
    total_power: '',
    goals: [],
  });

  // Resume from last saved step on mount
  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profile && !profile.onboarding_complete) {
        // Pre-fill what we have
        setData(prev => ({
          ...prev,
          server_number: profile.server_number || '',
          server_day: profile.server_day || '',
          hq_level: profile.hq_level || '',
          spend_tier: profile.spend_tier || '',
          playstyle: profile.playstyle || '',
          troop_type: profile.troop_type || '',
          troop_tier: profile.troop_tier || '',
          server_rank: profile.server_rank || '',
          hero_power: profile.hero_power || '',
          total_power: profile.total_power || '',
          goals: profile.goals || [],
        }));
        // Resume from saved step
        if (profile.onboarding_step > 1) setStep(profile.onboarding_step);
      }
    }
    loadProfile();
  }, []);

  // Save progress to Supabase on every step advance
  async function saveProgress(nextStep, complete = false) {
    if (!supabase) return;
    setSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const payload = {
        server_number: parseInt(data.server_number) || 0,
        server_day: parseInt(data.server_day) || 0,
        hq_level: parseInt(data.hq_level) || 1,
        spend_tier: data.spend_tier || 'f2p',
        playstyle: data.playstyle || 'scout',
        troop_type: data.troop_type || 'mixed',
        troop_tier: data.troop_tier || 't8',
        server_rank: data.server_rank || 'still_building',
        hero_power: data.hero_power ? parseInt(data.hero_power) : null,
        total_power: data.total_power ? parseInt(data.total_power) : null,
        goals: data.goals || [],
        onboarding_step: nextStep,
        onboarding_complete: complete,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (upsertError) throw upsertError;
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function advance() {
    const nextStep = step + 1;
    await saveProgress(nextStep);
    setStep(nextStep);
  }

  function back() {
    setStep(s => Math.max(1, s - 1));
  }

  async function complete() {
    await saveProgress(TOTAL_STEPS + 1, true);
    // Redirect to dashboard / daily action plan
    window.location.href = '/dashboard';
  }

  const stepProps = { data, setData, onNext: advance, onBack: back, step };

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

      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <span style={{
              fontFamily: '"Rajdhani", "Oswald", sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: theme.gold,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              LWSB
            </span>
            {step > 1 && step <= TOTAL_STEPS && (
              <span style={{ fontSize: 12, color: theme.textMuted }}>Step {step - 1} of {TOTAL_STEPS - 1}</span>
            )}
          </div>

          {/* Progress */}
          {step > 1 && step <= TOTAL_STEPS && <ProgressBar step={step} />}

          {/* Error */}
          {error && (
            <div style={{ background: `${theme.red}18`, border: `1px solid ${theme.red}`,
              borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: theme.red, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Saving indicator */}
          {saving && (
            <div style={{ color: theme.goldDim, fontSize: 12, textAlign: 'right', marginBottom: 8 }}>
              Saving...
            </div>
          )}

          {/* Step content */}
          {step === 1  && <Step1_Welcome onNext={advance} />}
          {step === 2  && <Step2_Server {...stepProps} />}
          {step === 3  && <Step3_ServerDay {...stepProps} />}
          {step === 4  && <Step4_HQ {...stepProps} />}
          {step === 5  && <Step5_SpendTier {...stepProps} />}
          {step === 6  && <Step6_Playstyle {...stepProps} />}
          {step === 7  && <Step7_TroopType {...stepProps} />}
          {step === 8  && <Step8_TroopTier {...stepProps} />}
          {step === 9  && <Step9_Rank {...stepProps} />}
          {step === 10 && <Step10_Power {...stepProps} />}
          {step === 11 && <Step11_Goals {...stepProps} />}
          {step === 12 && <StepComplete data={data} onDone={complete} />}
        </div>
      </div>
    </>
  );
}
