// src/lib/lwtDecorationTierData.ts
// Decoration Tier List & Upgrade Priority Guide
// Source: ldshop.gg decoration tier list (Jan 2026 community meta)
// Complements decorationData.ts (which covers upgrade costs/stat values)
// -----------------------------------------------------------------------

export interface DecorationEntry {
  name: string;
  notes: string;
}

export interface DecorationTier {
  tier: string;
  statFocus: string;
  priority: string;
  decorations: DecorationEntry[];
  tierNotes?: string;
}

// -----------------------------------------------------------------------
// TIER DATA
// -----------------------------------------------------------------------

export const DECORATION_TIERS: DecorationTier[] = [
  {
    tier: 'S',
    statFocus: 'Damage Reduction',
    priority: 'Max first — upgrade to L4+ after all S+A reach L3',
    tierNotes:
      'Damage Reduction is the strongest stat in competitive PvP as of Jan 2026. It scales better than flat HP and directly reduces burst damage impact.',
    decorations: [
      {
        name: 'Win in 2025',
        notes: 'High damage reduction scaling; extremely strong in PvP survivability and rallies.',
      },
      {
        name: 'Win in 2026',
        notes: 'Seasonal defensive piece with excellent mitigation value in long fights.',
      },
      {
        name: 'Torch Relay',
        notes: 'Consistent damage dampening; strong ROI at Level 3+.',
      },
      {
        name: 'Rock the End',
        notes: 'Reliable defensive stat spread; effective in sustained engagements.',
      },
      {
        name: 'Joyful Bunny',
        notes: 'Event-based decoration with strong defensive ceiling when upgraded.',
      },
    ],
  },
  {
    tier: 'A+',
    statFocus: 'Skill Damage & March Size',
    priority: 'Upgrade to L3 alongside S-Tier in first pass',
    tierNotes:
      'Offensive multipliers that significantly increase total damage output. God of Judgement is unique — it provides March Size which directly increases total deployed troop damage.',
    decorations: [
      {
        name: 'Easter Egg-sassin',
        notes: 'Strong Skill Damage boost; ideal for ability-based hero compositions.',
      },
      {
        name: 'Lovely Bears',
        notes: 'Balanced HP + Skill Damage; flexible and efficient early investment.',
      },
      {
        name: 'Fabulous Phonograph',
        notes: 'Reliable offensive scaling; boosts sustained DPS.',
      },
      {
        name: 'Win in 2024',
        notes: 'Stat-efficient seasonal decoration; strong at Level 3.',
      },
      {
        name: 'Turkey Swashbuckler',
        notes: 'Offensive stat boost that synergizes with crit builds.',
      },
      {
        name: 'Cornucopia',
        notes: 'Solid damage amplification; good scaling potential.',
      },
      {
        name: 'God of Judgement',
        notes: 'Rare March Size increase; directly increases total deployed troop damage. Only decoration of its kind — high priority if owned.',
      },
    ],
  },
  {
    tier: 'A',
    statFocus: 'Critical Damage',
    priority: 'Upgrade to L3 in second pass; push higher for crit-focused builds',
    tierNotes:
      'Excellent for burst compositions. Crit Damage dramatically increases burst output when paired with sufficient crit rate, but depends on hero synergy — slightly less universally powerful than Damage Reduction.',
    decorations: [
      { name: 'Rosy Cabriolet', notes: 'Boosts Crit Damage; strong for burst-oriented builds.' },
      { name: 'Golden Marshal', notes: 'Reliable crit scaling in PvP encounters.' },
      { name: 'Colorful Christmas Tree', notes: 'Seasonal decoration with solid crit amplification.' },
      { name: 'Happy Turkey', notes: 'Good synergy with high-crit compositions.' },
      { name: 'Jack-o\' Carriage', notes: 'Strong burst enhancement for offensive squads.' },
      { name: 'Cheese Manor', notes: 'Excellent crit damage scaling with balanced stats.' },
      { name: 'Jack-o\' Zombie', notes: 'Effective for crit-focused teams.' },
      { name: 'Tower of Victory', notes: 'High crit amplification; strong in competitive modes.' },
      { name: 'Year of the Dragon', notes: 'Event decoration with competitive crit scaling.' },
    ],
  },
  {
    tier: 'B',
    statFocus: 'General Hero Stat Boost (Attack, HP, Defense)',
    priority: 'Upgrade after S and A tiers are at L3+',
    tierNotes:
      'Provides general stat boosts but lacks the multiplicative scaling of higher tiers.',
    decorations: [
      { name: 'Pumpkin Panic', notes: 'General combat stats.' },
      { name: 'Warrior\'s Monument', notes: 'General combat stats.' },
      { name: 'Throne of Blood', notes: 'General combat stats.' },
      { name: 'Golden Missile Vehicle', notes: 'General combat stats.' },
      { name: 'Ferris Wheel', notes: 'General combat stats.' },
      { name: 'Bell Tower', notes: 'General combat stats.' },
    ],
  },
  {
    tier: 'C',
    statFocus: 'Lower Impact',
    priority: 'Lowest priority — upgrade only after everything else',
    decorations: [
      { name: 'Gold Bomber', notes: 'Lower stat ceiling and limited competitive scaling.' },
      { name: 'Gold Tank', notes: 'Lower stat ceiling and limited competitive scaling.' },
    ],
  },
  {
    tier: 'Economy',
    statFocus: 'Resource & Progression',
    priority: 'Useful for progression but not priority for combat power',
    tierNotes:
      'Economy decorations help with resource growth and progression speed, but should not take Universal Decor Component resources away from combat decorations.',
    decorations: [
      { name: 'Lucky Cat', notes: 'Resource/economy boosts.' },
      { name: 'Golden Mobile Squad', notes: 'Resource/economy boosts.' },
      { name: 'Eternal Pyramid', notes: 'Resource/economy boosts.' },
      { name: 'Military Monument', notes: 'Resource/economy boosts.' },
      { name: 'Neon Sign', notes: 'Resource/economy boosts.' },
      { name: 'Libertas', notes: 'Resource/economy boosts.' },
      { name: '"Eiffelle" Tower', notes: 'Resource/economy boosts.' },
    ],
  },
];

// -----------------------------------------------------------------------
// UPGRADE PATH
// -----------------------------------------------------------------------

export const DECORATION_UPGRADE_PATH = {
  step1: 'Upgrade ALL S-Tier and A-Tier (A+ and A) decorations to Level 3 first.',
  step2: 'Push S-Tier decorations to Level 4 and beyond.',
  step3: 'Strengthen A-Tier crit pieces (A) to L4+.',
  step4: 'Upgrade B and C tiers last.',
  keyBreakpoint: 'Level 3 is the first major efficiency breakpoint — the stat jump at L3 is the best value per Universal Decor Component spent.',
};

// -----------------------------------------------------------------------
// META SUMMARY (Jan 2026)
// -----------------------------------------------------------------------

export const DECORATION_META_NOTES = [
  'Damage Reduction (S-Tier) is the dominant stat in Jan 2026 competitive meta.',
  'S-Tier scaling outperforms flat HP in PvP, rallies, and world events.',
  'God of Judgement (A+) is uniquely valuable — only decoration providing March Size bonus.',
  'Crit Damage (A-Tier) requires crit rate synergy from heroes to be effective; not universally strong.',
  'Economy decorations should never compete with combat decorations for upgrade resources.',
  'Universal Decor Components are the limiting resource — spend them on S and A+ first.',
  'Decorations are permanent and account-wide — they apply in all game modes.',
];

// -----------------------------------------------------------------------
// SUMMARY FUNCTION FOR SYSTEM PROMPT INJECTION
// -----------------------------------------------------------------------

export function getDecorationTierSummary(): string {
  const lines: string[] = [
    '## Decoration Tier List & Upgrade Priority (Jan 2026 Meta)',
    '',
    '**Meta Rule:** Upgrade ALL S + A-Tier decorations to Level 3 first, then push S-Tier to Level 4+.',
    'Level 3 = first major efficiency breakpoint. Universal Decor Components are the bottleneck.',
    '',
  ];

  for (const tier of DECORATION_TIERS) {
    lines.push(`### ${tier.tier}-Tier — ${tier.statFocus}`);
    lines.push(`**Priority:** ${tier.priority}`);
    if (tier.tierNotes) lines.push(tier.tierNotes);
    for (const d of tier.decorations) {
      lines.push(`- **${d.name}**: ${d.notes}`);
    }
    lines.push('');
  }

  lines.push('### Recommended Upgrade Path');
  lines.push(`1. ${DECORATION_UPGRADE_PATH.step1}`);
  lines.push(`2. ${DECORATION_UPGRADE_PATH.step2}`);
  lines.push(`3. ${DECORATION_UPGRADE_PATH.step3}`);
  lines.push(`4. ${DECORATION_UPGRADE_PATH.step4}`);
  lines.push(`**Key breakpoint:** ${DECORATION_UPGRADE_PATH.keyBreakpoint}`);
  lines.push('');

  lines.push('### Key Meta Notes');
  for (const note of DECORATION_META_NOTES) {
    lines.push(`- ${note}`);
  }

  return lines.join('\n');
}