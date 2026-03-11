// src/lib/lwtHeroTierData.ts
// Hero Tier List — March 2026 Meta
// Source: ldshop.gg hero tier list (March 2026)
// Complements lwtHeroData.ts (which covers progression, skill priority, EW reference)
// This module covers: competitive tier rankings, troop type tags, per-hero specialties
// -----------------------------------------------------------------------

export interface HeroEntry {
  name: string;
  type: string;       // Tank Vehicle / Aircraft Vehicle / Missile Vehicle
  role: string;       // Attack / Defense / Support
  specialty: string;
  notes: string;
}

export interface HeroTier {
  tier: string;
  label: string;
  heroes: HeroEntry[];
}

// -----------------------------------------------------------------------
// TIER DATA — March 2026
// -----------------------------------------------------------------------

export const HERO_TIERS: HeroTier[] = [
  {
    tier: 'SS',
    label: 'Must-have. Top of meta.',
    heroes: [
      {
        name: 'Marshall',
        type: 'Tank Vehicle',
        role: 'Support',
        specialty: 'Team-wide offensive boost',
        notes: 'Enhances entire team with attack and crit buffs. Best support in the game — turns the tide in critical moments. Universal fit across all troop type compositions.',
      },
      {
        name: 'Kimberly',
        type: 'Tank Vehicle',
        role: 'Attack',
        specialty: 'Devastating area damage',
        notes: 'AoE damage dealer — wipes out groups efficiently in PvE and PvP. Consistent offensive pressure. Shines in crowd management scenarios.',
      },
      {
        name: 'DVA',
        type: 'Aircraft Vehicle',
        role: 'Attack',
        specialty: 'High burst damage',
        notes: 'Top Aircraft DPS. Devastating focused damage — best for eliminating bosses and priority targets. Keep in backline with tank protection. Pairs naturally with Aircraft troop type players.',
      },
      {
        name: 'Tesla',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Energy damage, endgame scaling',
        notes: 'Lethal against high-defense targets. Strong endgame scaling — becomes crucial in late-game sustained combat. Best in Missile formations.',
      },
      {
        name: 'Morrison',
        type: 'Aircraft Vehicle',
        role: 'Attack',
        specialty: 'Armor piercing and defense reduction',
        notes: 'Shreds enemy defenses. Reduces target defense while dealing consistent physical DPS. Strong in prolonged engagements. Core Aircraft offensive hero.',
      },
      {
        name: 'Fiona',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Multi-target attacks',
        notes: 'Steady multi-target damage — strong in PvE group fights. Pair with tanks for maximum output. Missile formation staple.',
      },
    ],
  },
  {
    tier: 'S',
    label: 'Excellent. Core of strong builds.',
    heroes: [
      {
        name: 'Williams',
        type: 'Tank Vehicle',
        role: 'Defense',
        specialty: 'Team-wide damage reduction',
        notes: 'Backbone tank. Soaks heavy damage while buffing allies with defensive boosts. Frontline anchor — pair with damage-focused heroes. Best defensive Tank hero.',
      },
      {
        name: 'Murphy',
        type: 'Tank Vehicle',
        role: 'Defense',
        specialty: 'HP and attack boosts',
        notes: 'Reliable balanced tank. Less raw toughness than Williams but offers HP + attack buffs. Best in drawn-out encounters where consistent survivability matters.',
      },
      {
        name: 'Mason',
        type: 'Tank Vehicle',
        role: 'Attack',
        specialty: 'Monster slayer and team damage reduction',
        notes: 'Most accessible SSR hero. Massive bonus damage vs zombie-type enemies + team-wide damage reduction. Best PvE campaign hero. Also referenced in World Boss trick (Mason World Boss trick in Meta Tips).',
      },
      {
        name: 'Lucius',
        type: 'Aircraft Vehicle',
        role: 'Defense',
        specialty: 'Energy damage mitigation',
        notes: 'Shields entire team from energy-based attacks. Substantial Energy Damage Reduction for all allies. ACQUISITION NOTE: Only obtainable via Daily Sale — not available in standard summon pool.',
      },
      {
        name: 'Carlie',
        type: 'Aircraft Vehicle',
        role: 'Support',
        specialty: 'Energy damage absorption, AoE damage',
        notes: 'Only Aircraft-type tank. Reduces energy damage taken while dealing AoE. Creates safe space for backline Aircraft damage dealers. Essential for full Aircraft formations.',
      },
      {
        name: 'Schuyler',
        type: 'Aircraft Vehicle',
        role: 'Attack',
        specialty: 'Crowd control and stuns',
        notes: 'Stun abilities freeze opponents — gives team control of the fight. Strong in PvP where shutting down enemy moves is key. Core Aircraft PvP hero.',
      },
      {
        name: 'Adam',
        type: 'Missile Vehicle',
        role: 'Defense',
        specialty: 'Damage reduction and retaliation',
        notes: 'Protects frontline allies by reducing all damage to front-row units. Cornerstone of full Missile formations. Always pair with McGregor — Adam + McGregor is the Missile formation core duo.',
      },
      {
        name: 'Swift',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Execution and infinite scaling',
        notes: 'Auto-targets lowest HP enemies for finishing blows. Stacking attack buffs have NO CAP — becomes the top damage contributor in extended PvE content. Best World Boss DPS hero in the game.',
      },
    ],
  },
  {
    tier: 'A',
    label: 'Strong. Important in specific formations or modes.',
    heroes: [
      {
        name: 'Stetmann',
        type: 'Tank Vehicle',
        role: 'Attack',
        specialty: 'Energy damage, rapid auto-attacks',
        notes: 'Consistent energy damage via high-multiplier auto-attacks. Position frontline as Tank-type damage dealer. Useful in Tank offensive builds.',
      },
      {
        name: 'Sarah',
        type: 'Aircraft Vehicle',
        role: 'Defense',
        specialty: 'Monster damage reduction, backline protection',
        notes: 'Marshall substitute in full Aircraft PvE formations. Increases backline damage against monsters. Best in monster-focused PvE content when Marshall is unavailable.',
      },
      {
        name: 'Violet',
        type: 'Tank Vehicle',
        role: 'Support',
        specialty: 'Backline attack buffs, monster damage reduction',
        notes: 'Absorbs monster damage with significant reduction in PvE. Best as secondary tank alongside Murphy in monster-heavy encounters.',
      },
      {
        name: 'McGregor',
        type: 'Missile Vehicle',
        role: 'Defense',
        specialty: 'Taunt and attack debuff',
        notes: 'Taunts front enemies while reducing their attack — protects backline. Essential in full Missile formations. Always pair with Adam — Adam + McGregor is the Missile formation core duo.',
      },
    ],
  },
  {
    tier: 'B',
    label: 'Situational. Useful in specific contexts.',
    heroes: [
      {
        name: 'Cage',
        type: 'Aircraft Vehicle',
        role: 'Defense',
        specialty: 'Frontline placeholder for Aircraft formations',
        notes: 'Holds frontline as Aircraft-type tank. Useful in Aircraft-heavy formations as interim tank before better options are available.',
      },
      {
        name: 'Richard',
        type: 'Tank Vehicle',
        role: 'Attack',
        specialty: 'Multi-target physical damage',
        notes: 'Moderate damage but not tough enough for frontline. Position behind main fighters in specialized team setups only.',
      },
      {
        name: 'Monica',
        type: 'Tank Vehicle',
        role: 'Support',
        specialty: 'Resource farming and monster loot',
        notes: 'B-tier in combat — but uniquely valuable for World Map resource farming. Passive increases drops from zombies and Doom Elites. ALSO NOTE: Monica 39% resource trick (use Monica skill before collecting resources for 39% bonus) is a key meta trick — see Meta Tips.',
      },
      {
        name: 'Scarlett',
        type: 'Tank Vehicle',
        role: 'Defense',
        specialty: 'Fire damage absorption, team protection',
        notes: 'Absorbs damage while boosting defense and fire resistance passively. Team-wide damage reduction. Best in early-mid game PvE content.',
      },
      {
        name: 'Elsa',
        type: 'Missile Vehicle',
        role: 'Defense',
        specialty: 'Frontline monster damage reduction',
        notes: 'Reduces damage taken from monsters on frontline. Effective in monster-heavy PvE only — diminishes in late-game and PvP.',
      },
    ],
  },
  {
    tier: 'C',
    label: 'Avoid investing heavily. Use only when no better option exists.',
    heroes: [
      {
        name: 'Kane',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Single-target damage',
        notes: 'Minimal damage, little support value. Last resort for Missile slot only.',
      },
      {
        name: 'Ambolt',
        type: 'Aircraft Vehicle',
        role: 'Support',
        specialty: 'Minor healing',
        notes: 'Early-game only. Quickly outclassed by every other support option.',
      },
      {
        name: 'Loki',
        type: 'Tank Vehicle',
        role: 'Defense',
        specialty: 'Physical damage tank',
        notes: 'Early-game SR tank. Outclassed by virtually every other defensive option at any meaningful stage.',
      },
      {
        name: 'Maxwell',
        type: 'Aircraft Vehicle',
        role: 'Attack',
        specialty: 'Basic physical damage',
        notes: 'No unique mechanics, minimal damage output. Only useful in the earliest game stages.',
      },
      {
        name: 'Venom',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Damage over time (Poison)',
        notes: 'Slow DoT damage — only viable in very long PvE missions. Not competitive in PvP or standard content.',
      },
      {
        name: 'Blaz',
        type: 'Missile Vehicle',
        role: 'Attack',
        specialty: 'Basic physical damage',
        notes: 'No redeeming utility. Last-resort option only.',
      },
    ],
  },
];

// -----------------------------------------------------------------------
// KEY HERO NOTES (cross-reference callouts for Buddy)
// -----------------------------------------------------------------------

export const HERO_KEY_NOTES = [
  'Marshall (SS) is the universal support — fits any troop type formation. Priority for all players.',
  'Swift (S) has uncapped stacking attack buffs — top World Boss DPS. Never stops scaling.',
  'Mason (S) is the most accessible SSR and the best PvE/campaign hero available to most players.',
  'Lucius (S) is ONLY available via Daily Sale — cannot be summoned normally.',
  'Adam + McGregor are a locked duo — Missile formation is incomplete without both.',
  'Carlie is the only Aircraft-type tank — essential for full Aircraft formations.',
  'Monica is B-tier in combat but S-tier for World Map resource farming. See Monica 39% trick.',
  'Sarah is a Marshall substitute for full Aircraft PvE — not a replacement in PvP.',
  'DVA and Morrison are the Aircraft offensive core — DVA is burst, Morrison is sustained armor-pierce.',
  'Tesla and Fiona are the Missile offensive core — Tesla for endgame scaling, Fiona for multi-target.',
];

// -----------------------------------------------------------------------
// FORMATION PAIRINGS BY TROOP TYPE
// -----------------------------------------------------------------------

export const HERO_FORMATION_PAIRINGS: Record<string, string> = {
  tank: 'Williams or Murphy (tank) + Kimberly or Stetmann (DPS) + Marshall or Violet (support). Mason for PvE.',
  aircraft: 'Carlie (tank) or Cage (placeholder) + DVA and Morrison (DPS) + Marshall or Sarah (support). Schuyler for PvP stuns.',
  missile: 'Adam + McGregor (defense duo, mandatory) + Tesla and Fiona (DPS) + Marshall (support). Swift for World Boss.',
  infantry: 'Refer to counter triangle — Infantry counters Tank. Use Tank-type heroes as primary formation base.',
};

// -----------------------------------------------------------------------
// SUMMARY FUNCTION FOR SYSTEM PROMPT INJECTION
// -----------------------------------------------------------------------

export function getHeroTierSummary(): string {
  const lines: string[] = [
    '## Hero Tier List — March 2026 Meta',
    '',
    'Tier list covers all named heroes with troop type, role, and specialty.',
    'Use this alongside the Hero System section for full hero guidance.',
    '',
  ];

  for (const tier of HERO_TIERS) {
    lines.push(`### ${tier.tier}-Tier — ${tier.label}`);
    for (const h of tier.heroes) {
      lines.push(`- **${h.name}** (${h.type} · ${h.role}): ${h.specialty}. ${h.notes}`);
    }
    lines.push('');
  }

  lines.push('### Key Hero Notes');
  for (const note of HERO_KEY_NOTES) {
    lines.push(`- ${note}`);
  }
  lines.push('');

  lines.push('### Recommended Formation Pairings by Troop Type');
  for (const [type, pairing] of Object.entries(HERO_FORMATION_PAIRINGS)) {
    lines.push(`- **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${pairing}`);
  }

  return lines.join('\n');
}