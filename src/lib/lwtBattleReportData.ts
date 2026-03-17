// ============================================================
// lwtBattleReportData.ts
// Battle Report Analyzer — Knowledge Module
// Last War: Survival Buddy
// ============================================================
// Sources: lastwartutorial.com, cpt-hedge.com, lastwarhandbook.com,
// bluestacks.com, theriagames.com, allclash.com
// All mechanics verified against Boyd's endgame experience.
// ============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 1 — TROOP TYPE COUNTER SYSTEM
// ─────────────────────────────────────────────────────────────
export const TROOP_COUNTER_MATRIX = {
  description: `
Last War uses a rock-paper-scissors counter system.
Each matchup applies a 20% damage modifier IN BOTH DIRECTIONS simultaneously,
creating a ~40% effective power swing total.
Buildings deal an additional +25% damage to Aircraft specifically in base defense.
  `,
  counters: {
    aircraft_vs_tank: {
      attacker: 'Aircraft', defender: 'Tank', result: 'Aircraft WINS',
      damage_dealt_modifier: '+20% (Aircraft deals more to Tank)',
      damage_taken_modifier: '-20% (Aircraft takes less from Tank)',
      effective_power_swing: '+40% for Aircraft',
      notes: 'Aircraft is the endgame meta counter to Tank-heavy servers (Day 70+)',
    },
    tank_vs_missile: {
      attacker: 'Tank', defender: 'Missile', result: 'Tank WINS',
      damage_dealt_modifier: '+20% (Tank deals more to Missile)',
      damage_taken_modifier: '-20% (Tank takes less from Missile)',
      effective_power_swing: '+40% for Tank',
      notes: 'Early game meta. Tank absorbs Missile damage well.',
    },
    missile_vs_aircraft: {
      attacker: 'Missile', defender: 'Aircraft', result: 'Missile WINS',
      damage_dealt_modifier: '+20% (Missile deals more to Aircraft)',
      damage_taken_modifier: '-20% (Missile takes less from Aircraft)',
      effective_power_swing: '+40% for Missile',
      notes: 'Missile is the hard counter to Aircraft-dominant servers.',
    },
    aircraft_vs_missile: {
      attacker: 'Aircraft', defender: 'Missile', result: 'Aircraft LOSES',
      damage_dealt_modifier: '-20% (Aircraft deals less to Missile)',
      damage_taken_modifier: '+20% (Aircraft takes more from Missile)',
      effective_power_swing: '-40% for Aircraft',
      notes: 'DANGEROUS. Aircraft players must scout Missile defenders before attacking.',
    },
    tank_vs_aircraft: {
      attacker: 'Tank', defender: 'Aircraft', result: 'Tank LOSES',
      damage_dealt_modifier: '-20% (Tank deals less to Aircraft)',
      damage_taken_modifier: '+20% (Tank takes more from Aircraft)',
      effective_power_swing: '-40% for Tank',
      notes: 'Do not march Tank into Aircraft wall without significant power advantage.',
    },
    missile_vs_tank: {
      attacker: 'Missile', defender: 'Tank', result: 'Missile LOSES',
      damage_dealt_modifier: '-20% (Missile deals less to Tank)',
      damage_taken_modifier: '+20% (Missile takes more from Tank)',
      effective_power_swing: '-40% for Missile',
      notes: 'Missile squads avoid Tank defenders.',
    },
  },
  building_bonus: {
    description: 'Base defense buildings deal +25% bonus damage to Aircraft attackers.',
    implication: 'Aircraft attacking defended bases face extra punishment beyond the troop type counter. Always scout wall composition before marching Aircraft.',
  },
  real_world_example: `
100K Missile vs 100K Aircraft → Missile wins, ~50% army surviving.
100K Aircraft vs 100K Tank → Aircraft wins, ~50% army surviving.
100K Tank vs 100K Missile → Tank wins, ~56% army surviving.
Key: A 20% power disadvantage can be overcome by correct type counter.
A player with 2M power from wrong type can lose to 1.5M correct type.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 2 — FORMATION BONUS SYSTEM
// ─────────────────────────────────────────────────────────────
export const FORMATION_BONUS = {
  description: `
Unlocks after first Capitol conquest.
Applies to HP, ATK, and DEF simultaneously.
Bonuses are multiplicative with other modifiers.
  `,
  tiers: [
    { heroes_same_type: 3, bonus_pct: 5, label: '3-same (weak)' },
    { heroes_same_type: 3, plus_different: 2, bonus_pct: 10, label: '3+2 mixed' },
    { heroes_same_type: 4, bonus_pct: 15, label: '4-same (strong)' },
    { heroes_same_type: 5, bonus_pct: 20, label: '5-same (MAX)' },
  ],
  special_card: {
    name: 'Efficient Unity (Tactics Card)',
    effect: 'Grants FULL 5-hero bonus with only 4 same-type heroes deployed',
    implication: 'Player with this card and 4 Aircraft + 1 Murphy gets +20% not +15%',
  },
  coaching_implication: `
A player running 3 Aircraft + 2 Tank is getting +10% instead of +20%.
That 10% formation gap on top of a type counter = compounding disadvantage.
Always run 5-same for the troop type you main.
Only break for exclusive weapon hybrid builds.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 3 — MORALE SYSTEM
// ─────────────────────────────────────────────────────────────
export const MORALE_SYSTEM = {
  description: `
Morale is the most underutilized combat mechanic. It scales damage linearly.
Morale Bonus = 1 + (Your Morale - Enemy Morale) / 100
A morale advantage of 20 means you deal 20% more damage.
  `,
  sources: [
    'Special Forces research (morale node)',
    'War Leader role in Season 1 (Inspire skill: up to +10%)',
    'Warmind – Morale Boost tactics card (passive: +6% per win, stacks 5x)',
    'Windrusher – Morale Boost tactics card (passive: +5% per march speed tier)',
    'Buluwark – Morale Boost tactics card (garrison: +3% per ally with same card)',
  ],
  cascade_mechanic: `
THE SNOWBALL: When you start losing troops, morale drops → damage drops → you lose MORE troops
→ morale drops further → cascade to crushing defeat.
This explains how a "close" power matchup becomes a 90% wipe.
The army that gains early troop advantage snowballs to decisive victory.
Close battles that suddenly became one-sided = morale cascade.
  `,
  war_fever: {
    name: 'War Fever',
    effect: 'Flat attack buff. Does NOT increase morale.',
    activation: 'Killing world map zombies or players. Removed when shield activated.',
    note: 'Attacking zombies does NOT activate War Fever. PvP kills only.',
  },
  diagnosis: `
If a player lost despite similar reported power and no obvious type counter,
morale cascade is the likely explanation.
Ask: did you take early losses? Did the opponent have Warmind Morale Boost stacked from prior fights?
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 4 — DAMAGE FORMULA
// ─────────────────────────────────────────────────────────────
export const DAMAGE_FORMULA = {
  formula: 'Final Damage = Base ATK × Skill Multiplier × Type Advantage × Morale Bonus × Equipment Bonus × Set Bonus × Formation Bonus × (1 - Enemy DEF Reduction)',
  effective_power_formula: 'Effective Power = Base Power × Type Modifier × Morale Modifier × Formation Bonus × Equipment Bonus',
  skill_multipliers: {
    range: '~100% (basic auto) to 400%+ (powerful tactical skill)',
    upgrade_method: 'Skill Medals — always scarce, spend wisely',
    max_level_base: 30,
    max_level_with_ew: 40,
  },
  key_insight: `
Displayed power is a POOR predictor of actual combat outcomes.
A 3.5M power Tank squad with full bonuses (type counter + morale + formation + EW + decos)
can fight with ~12.5M effective power — a 356% increase.
This is why a 500K player can beat a 1.5M player with smart play.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 5 — EXCLUSIVE WEAPONS
// ─────────────────────────────────────────────────────────────
export const EXCLUSIVE_WEAPONS = {
  description: `
Every season releases 3 EWs — one per hero type (Tank/Aircraft/Missile).
Released in weeks 1, 3, 6 of the season.
EWs boost stats, upgrade skills beyond level 30, and add 7.5% stat boost at level 20.
  `,
  release_schedule: {
    season_1: { week_1: 'Kimberly (Tank)', week_3: 'DVA (Aircraft)', week_6: 'Tesla (Missile)' },
    season_2: { week_1: 'Murphy (Tank)', week_3: 'Carlie (Aircraft)', week_6: 'Swift (Missile)' },
    season_3: { week_1: 'Marshall (Support)', week_3: 'Schuyler (Aircraft)', week_6: 'McGregor (Missile)' },
    season_4: { week_1: 'Williams (Tank)', week_3: 'Lucius (Aircraft)', week_6: 'Adam (Missile)' },
    season_5: { week_1: 'Fiona (Missile)', week_3: 'Stetmann (Tank)', week_6: 'Morrison (Aircraft)' },
  },
  power_impact: {
    unlock: '~0.3M squad power boost',
    level_10: 'Additional ~0.3M',
    level_20: 'Additional ~0.3M + 7.5% stat boost (PRIORITY TARGET)',
    level_30: 'Additional ~0.3M (maximum)',
    total_max: '~1.2M squad power boost from unlock to level 30',
  },
  skill_impact: {
    description: 'Every 3 EW levels = +1 skill level beyond base cap of 30',
    at_level_30: '+10 additional skill levels (skills reach level 40)',
    implication: 'EW level 20 hero can have skills at level 36 vs non-EW at 30',
  },
  cost_to_level_20: {
    named_shards_to_unlock: 50,
    additional_shards_1_to_20: 1080,
    total: '1,130 shards',
    cost_paid: '~$20 via battle pass OR free via Black Market post-season',
  },
  wall_of_honor: 'At level 30 max, excess shards go to Wall of Honor for small % stat boosts. Not a priority until all squad EWs are at L20+.',
  coaching_implication: `
If battle report shows hero skill damage dramatically lower than squad power suggests,
EW gap is the prime suspect.
Ask: are your main squad heroes' EWs at level 20?
An opponent with EW L20+ has skills at level 36 vs your L30 — meaningful skill multiplier gap.
Priority: Get all 5 main squad heroes to EW L20 before pushing L30 on any single hero.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 6 — TACTICS CARDS (Season 4+)
// ─────────────────────────────────────────────────────────────
export const TACTICS_CARDS = {
  description: `
Introduced in Season 4. 3 types: Core Cards (permanent UR), Battle Cards, Resource Cards.
Deck slots: 2 Core + 4 Battle + 4 Resource.
Core Cards persist after season ends. Battle/Resource cards are removed at season end.
Core Card slot 1 requires Profession level 50+.
  `,
  pvp_core_cards: [
    {
      name: 'Warmind – Rapid Rescue',
      effect: 'As attacker: +10% HP/ATK/DEF base stats. Tactical: after winning PvP battle, restore up to 100% lightly wounded troops (2x daily).',
      combat_implication: 'Makes serial attackers nearly immune to lightly wounded losses.',
    },
    {
      name: 'Warmind – Morale Boost',
      effect: 'As attacker: +10% HP/ATK/DEF base stats. Passive: after each PvP world map win, +6% morale (stacks 5x, expires on base return).',
      combat_implication: 'At 5 stacks = +30% morale advantage before the next fight even starts. DEVASTATING in kill events. Explains otherwise inexplicable losses.',
    },
    {
      name: 'Windrusher – Morale Boost',
      effect: 'As attacker: +10% HP/ATK/DEF base stats. Passive: per 8 tiles marched (up to 5x), +5% morale.',
      combat_implication: 'Long-march attackers arrive with stacked morale. Scout from far away = morale-stacked on arrival.',
    },
    {
      name: 'Windrusher – Rapid Rescue',
      effect: 'As attacker: +10% HP/ATK/DEF base stats. Tactical: self + 3x3 allies +50% march speed (3x daily).',
      combat_implication: 'Rapid reinforcement in alliance war scenarios.',
    },
    {
      name: 'Buluwark – Comprehensive Enhancement',
      effect: 'As defender: +10% HP/ATK/DEF base stats. Tactical: self + allies +8% HP/ATK/DEF while in Defense Support (stacks 3x, 2x daily).',
      combat_implication: 'Wall defenders with this card get a +24% buff at max stacks. Explains hard-to-crack garrison.',
    },
    {
      name: 'Buluwark – Morale Boost',
      effect: 'As defender: +10% HP/ATK/DEF. Passive: at start of Defense Support, +3% morale per ally with same card (stacks 9x).',
      combat_implication: 'Full alliance defense with this card = +27% morale bonus to all defenders.',
    },
    {
      name: 'Purgator – Monster Slayer',
      effect: 'PvE: base -3% damage from monsters. Tactical: +250 virus resistance + -20% monster damage for 180s (1x daily).',
      combat_implication: 'Required for Season 1 high-level zombie farming. Explains why some players clear content others cannot.',
    },
  ],
  pvp_battle_cards: [
    {
      name: 'Damage Reduction Reversal',
      effect: 'Reduces damage TAKEN when countered by up to 5.10%',
      implication: 'Partially negates the -20% damage disadvantage of wrong type matchup.',
    },
    {
      name: 'Damage Reversal',
      effect: 'Increases damage DEALT when countered by up to 2.55%',
      implication: 'Stacked with Damage Reduction Reversal = partially nullifies type counter.',
    },
    {
      name: 'Efficient Unity',
      effect: 'Grants FULL troop type bonus (+20%) with only 4 same-type heroes.',
      implication: 'Player running Murphy (Tank) + 4 Aircraft gets +20% instead of +15%. Changes formation calculus entirely.',
    },
    {
      name: 'Attribute Aura',
      effect: '1st squad heroes gain up to +4% ATK/DEF/HP in world map PvP.',
      implication: 'Flat stat boost to primary squad.',
    },
    {
      name: 'Warmind – One Against Ten',
      effect: 'Reduces attribute penalties when marching squad has insufficient units by up to 30%.',
      implication: 'Players who march with reduced march size take less of a penalty.',
    },
  ],
  coaching_implication: `
Tactics Cards are INVISIBLE in battle reports. They explain gaps that pure power analysis cannot.
Key questions to ask after analyzing a report:
1. Did attacker have Warmind Morale Boost stacked? (serial attacker in kill event)
2. Did defender have Buluwark stacks? (hard garrison defense)
3. Did loser have Damage Reduction Reversal? (type mismatch but cards partially compensated)
4. Is the attacker running Efficient Unity? (4-hero mono + Murphy with +20% instead of +15%)
Always collect tactics card status in the pre-analysis intake.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 7 — DECORATIONS
// ─────────────────────────────────────────────────────────────
export const DECORATIONS = {
  description: `
Passive bonuses active at all times across ALL squads and ALL game modes.
No activation required. Stack additively.
Show up in the stat comparison screen.
Tiers: UR (gold) > SSR (purple, single stat) > SR (blue, weakest).
Only invest in UR decorations. SR/SSR are early-game only.
UR decorations get a major bonus jump at Level 3 — spread all to L3 before going deeper.
  `,
  stat_types: [
    'Hero HP', 'Hero ATK', 'Hero DEF', 'Critical Damage %', 'Skill Damage %',
    'Construction Speed %', 'March Size (rare — God of Judgment only)', 'Zombie Damage % (PvE only)',
  ],
  top_ur_decorations: [
    { name: 'God of Judgment', stats: 'HP + ATK + DEF + March Size (only march size source from decos)', priority: 'S-Tier — best all-around, get this first', note: 'Cannot be upgraded with Universal Decor Components. Harder to max.' },
    { name: 'Tower of Victory', stats: 'ATK + Critical Damage %', priority: 'S-Tier — offensive. Second priority after God of Judgment.' },
    { name: 'Eternal Pyramid', stats: '+55% Construction Speed', priority: 'A-Tier for progression speed. Not combat, but accelerates all building.' },
    { name: 'Pumpkin Panic', stats: '+90K HP, +2,142 ATK, +428 DEF, +5% Crit Damage', priority: 'A-Tier — multi-stat with crit.' },
    { name: 'Eiffel Tower', stats: '+120K HP, +285 DEF', priority: 'A-Tier — HP/survivability focus.' },
    { name: 'Gold Missile Vehicle', stats: '+4,285 ATK at Level 7 (highest single-stat ATK from vehicle decos)', priority: 'A-Tier for attack-focused builds.' },
    { name: 'Gold Tank', stats: '+82,500 HP', priority: 'B-Tier — HP only but solid if you have it.' },
    { name: 'Cheese Manor', stats: 'Large HP + 5% Critical Damage', priority: 'A-Tier — HP + crit combo.' },
    { name: 'Throne of Blood', stats: '+55K HP, +ATK, +DEF (3-stat)', priority: 'B-Tier — versatile 3-stat.' },
    { name: 'Military Monument', stats: '+1,300 DEF (highest DEF single-stat), +2% Zombie Damage', priority: 'B-Tier — defense-focused or PvE farming.' },
  ],
  upgrade_strategy: `
1. Spread ALL UR decorations to Level 3 first (big jump at L3 special bonus).
2. Then prioritize L4 on your top 2-3 combat decos.
3. God of Judgment and Tower of Victory are first and second targets.
4. Use Universal Decor Components only on UR decorations.
5. January 2026 meta: Damage Reduction > Skill Damage > Crit Damage.
  `,
  coaching_implication: `
The stat comparison screen (red/green arrows) is where deco gap shows up.
If your ATK and HP both have red arrows against an opponent with similar displayed power,
deco gap is the most likely explanation.
A player with God of Judgment + Tower of Victory + Pumpkin Panic at L5+ has ~300K+ more HP
and ~6K+ more ATK than a player with basic decos.
This shows as a crushing stat disadvantage on the comparison screen.
Coaching: "Your stat gap isn't a hero issue — it's a decoration investment gap.
Tower of Victory is your next upgrade target."
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 8 — TROOP LOSS INTERPRETATION
// ─────────────────────────────────────────────────────────────
export const TROOP_LOSS_INTERPRETATION = {
  categories: {
    lightly_wounded: { label: 'Lightly Wounded', meaning: 'Auto-recover. No hospital. No resources needed. Essentially free.', severity: 'LOW' },
    wounded: { label: 'Wounded (Hospital)', meaning: 'Go to hospital. Require resources to heal. Recoverable.', severity: 'MEDIUM' },
    killed: { label: 'Killed / Dead', meaning: 'Permanently lost UNLESS hospital overflow goes to Enlistment Office. True kills are gone forever.', severity: 'HIGH' },
    enlistment: { label: 'Enlistment Office', meaning: 'Overflow from full hospital. Can be recalled at no resource cost (timed). Strategic storage.', severity: 'MEDIUM — recoverable' },
  },
  hospital_overflow_rule: `
CRITICAL: When hospital is full, subsequent wounded go to Enlistment Office.
But if BOTH hospital AND enlistment are full → troops die permanently.
High kill count in a report = hospital was full.
This is permanent loss.
Coaching implication: "Your kill count is high. Either your hospital was full during this fight,
or you were significantly outmatched. Check hospital capacity and ensure it's upgraded to your HQ level."
  `,
  attacker_vs_defender_asymmetry: `
DEFENDERS get an advantage: killed troops go partially to Enlistment Office for recovery.
ATTACKERS keep their lightly wounded from successful attacks.
A loss for the attacker with high kill count = bad.
A loss for the defender with high kill count = survivable if enlistment has capacity.
  `,
  troop_damage_percentage: `
The per-troop-type damage % is the clearest indicator of what happened:
- Your type at 100% damage, theirs at 0% = pure type counter wipe
- Both sides at ~50% = even fight, other factors decided it
- Your type at 100%, theirs at 30-50% = type counter + power gap
- Your type at 30%, theirs at 100% = you won but took real losses
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 9 — PvE REPORT LOGIC (Monster / Zombie)
// ─────────────────────────────────────────────────────────────
export const PVE_REPORT_LOGIC = {
  report_types: {
    zombie_world_map: {
      name: 'World Map Zombie Kill', stamina_cost: 10,
      shows: ['Hero skill damage', 'Resources earned', 'Courage medals', 'Troop losses (if any)'],
      no_show: ['Opponent stat comparison', 'Troop type breakdown vs enemy'],
      proper_squad: 'Should take ZERO troop losses on normal world map zombies with correct squad.',
    },
    zombie_boss: {
      name: 'Zombie Boss / Doom Walker', stamina_cost: 20,
      shows: ['Damage dealt per hero', 'Troop losses', 'Rewards'],
      note: 'Requires rally with alliance for high-level bosses.',
    },
    zombie_siege: {
      name: 'Zombie Siege (Alliance Event)',
      format: '20 waves, 30 seconds each, escalating strength',
      critical_heroes: 'AoE damage dealers + defensive buffers. All three troop types recommended.',
      failure_mode: 'Wrong formation (PvP squad in PvE defense), no reinforcements, underleveled heroes.',
    },
  },
  virus_resistance: {
    description: 'Season 1 (Crimson Plague) mechanic. Required to attack certain zombie types.',
    consequence: 'Attacking without sufficient resistance = -99% damage + troop infection.',
    solution: 'Purgator – Monster Slayer tactics card (+250 resistance for 180s) + VRI research upgrades.',
    diagnosis: 'If player reports near-zero damage to zombies → virus resistance gap. Not a power problem.',
  },
  pve_squad_mistakes: [
    'Running PvP formation (5-same type mono) into Zombie Siege — wrong for PvE waves',
    'No Purgator tactics card for high-level zombie farming in Season 1',
    'Using Monica (resource hero) as main DPS in PvE events instead of damage dealers',
    'Attacking boss without alliance rally — stamina waste',
    'Mixed troop type formation in Zombie Siege — need all three types for wave coverage',
  ],
  pve_coaching_template: `
PvE reports should show zero or near-zero troop losses for world map zombies.
If losses are occurring on basic zombies: check squad composition, hero levels,
and ensure Purgator – Monster Slayer card is active if in Season 1.
If Zombie Siege losses are high: check wave readiness, hero AoE coverage,
and whether alliance reinforcements are being used.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 10 — BATTLE REPORT SCREEN LAYOUT
// ─────────────────────────────────────────────────────────────
export const BATTLE_REPORT_SCREENS = {
  description: 'Last War battle reports are multi-tab. Each tab reveals different data.',
  screens: [
    {
      screen: 1, name: 'Outcome + Power Summary',
      visible_data: [
        'Win / Loss outcome',
        'Attacker name and power (displayed)',
        'Defender name and power (displayed)',
        'Power lost from battle (each side)',
        'Hero lineup used (both sides, small icons)',
        'Loot stolen (if win)',
        'Battle timestamp and coordinates',
        'OPPONENT NAME — visible as the other player\'s name on this screen',
      ],
      analysis_use: 'Power differential, outcome, opponent name, which heroes were deployed.',
    },
    {
      screen: 2, name: 'Troop Loss Breakdown',
      visible_data: [
        'Total troops sent vs total troops defending',
        'Killed / Wounded / Lightly Wounded / Survived — both sides',
        'Per-troop-type damage % (Aircraft/Tank/Missile each shown separately)',
        'Troops sent per type, troops survived per type',
      ],
      analysis_use: 'THE MOST IMPORTANT SCREEN. Type matchup diagnosis. Morale cascade evidence.',
    },
    {
      screen: 3, name: 'Hero Skill Damage',
      visible_data: [
        'Damage dealt by each hero skill',
        'Kills attributed to each skill',
        'Shields/blocks credited to defensive skills',
      ],
      analysis_use: 'EW gap diagnosis. Hero investment gap. Skill level comparison.',
    },
    {
      screen: 4, name: 'Stat Comparison',
      visible_data: [
        'ATK, HP, DEF, Lethality — both players',
        'Green arrow = your stat higher, Red arrow = theirs higher',
        'No arrows = equal',
      ],
      analysis_use: 'Decoration gap, research gap, gear gap. If power is equal but stats are red = deco/gear.',
    },
    {
      screen: 5, name: 'Gear / Chief Level',
      visible_data: [
        "Each player's Chief Level",
        'Gear equipped per slot (helmet, chest, boots, weapon, badge)',
        'Badge quality',
      ],
      analysis_use: 'Gear tier comparison. Badge investment gap.',
    },
    {
      screen: 6, name: 'Power Up Analysis',
      visible_data: [
        'Letter-grade (S/A/B/C) breakdown of improvement areas',
        'Tap each grade for specific material recommendations',
      ],
      analysis_use: 'Game\'s own assessment. Use as secondary confirmation of Buddy\'s diagnosis.',
    },
  ],
  screenshot_guidance: `
For the best analysis, upload screenshots of ALL screens in order.
Minimum viable: Screen 1 (outcome) + Screen 2 (troop breakdown) + Screen 4 (stats).
Screen 3 (hero skills) adds EW/skill diagnosis.
Screen 5 (gear) adds gear gap diagnosis.
The more screens uploaded, the more precise the coaching.
  `,
};

// ─────────────────────────────────────────────────────────────
// SECTION 11 — VERDICT TEMPLATES
// ─────────────────────────────────────────────────────────────
export const VERDICT_TEMPLATES = {
  countered_type_mismatch: {
    label: 'Countered — Troop Type Mismatch',
    trigger: 'Your troop type took significantly more damage than opponent\'s. Opponent ran counter type.',
    summary: 'You marched into a type disadvantage. The counter system applied a ~40% effective power swing against you before a single hero skill fired.',
    rematch: 'Not yet — scout opponent troop type first and counter appropriately.',
  },
  power_gap: {
    label: 'Outmatched — Power / Investment Gap',
    trigger: 'Stats comparison screen shows multiple red arrows. Similar troop type matchup but heavy losses.',
    summary: 'No type mismatch. Pure investment gap — decorations, gear, or EW levels.',
    rematch: 'Only if you close the gap. Check decoration tier list priority.',
  },
  morale_cascade: {
    label: 'Morale Cascade',
    trigger: 'Near-equal power and type matchup, but losses were catastrophically asymmetric.',
    summary: 'You took early losses which dropped morale → reduced damage → more losses → snowball defeat. Or opponent had Warmind Morale Boost stacked from prior fights.',
    rematch: 'Possible — ensure you engage fresh, not after prior losses. Check your morale research.',
  },
  hospital_overflow: {
    label: 'Hospital Overflow — Permanent Loss Alert',
    trigger: 'High killed count. Wounded count lower than expected.',
    summary: 'Your hospital was full during this fight. Excess wounded became permanent deaths. Upgrade hospital or use Enlistment Office strategy.',
    rematch: 'Fix hospital capacity first.',
  },
  formation_gap: {
    label: 'Formation Bonus Gap',
    trigger: 'Mixed troop types in squad (3+2 or worse) vs opponent running mono-type.',
    summary: 'You were getting +10% formation bonus while opponent had +20%. That 10% gap on HP/ATK/DEF is significant in close matchups.',
    rematch: 'Run 5-same type. Only break formation for confirmed EW hybrid builds.',
  },
  won_clean: {
    label: 'Clean Win — Well Executed',
    trigger: 'Won with minimal losses. Correct type matchup. Stat advantages.',
    summary: 'Type counter was correct. Formation was solid. Good outcome.',
    rematch: 'N/A — you won.',
  },
  pyrrhic_win: {
    label: 'Pyrrhic Win — Won But At Cost',
    trigger: 'Won but with heavy troop losses. Hospital likely full or near-full.',
    summary: 'Victory achieved but the cost was high. Check hospital and Enlistment Office capacity. Was this fight worth it?',
    rematch: 'Evaluate loot gained vs troop cost. May not have been worth it.',
  },
  pve_resistance_failure: {
    label: 'PvE — Virus Resistance Gap',
    trigger: 'Near-zero damage to zombies in Season 1 content.',
    summary: 'You lack sufficient virus resistance for this zombie tier. Not a power issue.',
    rematch: 'Use Purgator – Monster Slayer tactics card before attacking. Build VRI research.',
  },
  pve_wrong_squad: {
    label: 'PvE — Wrong Squad Composition',
    trigger: 'Taking unexpected troop losses on world map zombies or Zombie Siege.',
    summary: 'PvP mono-type formation is suboptimal for PvE. Need AoE damage dealers and defensive buffers.',
    rematch: 'Rebuild squad for PvE: AoE attackers, defensive skills, all three troop types for Siege.',
  },
};

// ─────────────────────────────────────────────────────────────
// SECTION 12 — COACHING ACTION TEMPLATES
// ─────────────────────────────────────────────────────────────
export const COACHING_ACTIONS = {
  type_counter_fix: [
    'Before attacking: tap the enemy base → check their squad type icons.',
    'Match your march to counter: Aircraft → use Missile. Tank → use Aircraft. Missile → use Tank.',
    'If you don\'t have a strong counter squad, don\'t attack until you do.',
    'Wall defense: put your counter-type squad on the wall before dropping shield.',
  ],
  formation_fix: [
    'Build toward 5 same-type heroes for your chosen type.',
    'If running Murphy (Tank) with Aircraft squad — consider Efficient Unity tactics card for +20% at 4 Aircraft.',
    'Never run 3+2 in endgame PvP — the 10% formation penalty compounds with everything else.',
  ],
  deco_fix: [
    'Priority: God of Judgment → Tower of Victory → Pumpkin Panic.',
    'Get ALL UR decos to Level 3 before pushing any single one to Level 5+.',
    'Use Universal Decor Components only on UR (gold) decorations.',
    'Check event shop and Black Market for UR decoration shards.',
  ],
  ew_fix: [
    'Target EW Level 20 on main squad heroes first — this unlocks the 7.5% stat boost.',
    'Save Universal EW Shards between seasons — use them immediately on new season EW releases.',
    'Free path: skip the $20 battle pass, farm Black Market post-season for EW shard choice boxes.',
    'Priority order: Squad 1 EWs to L20 → Squad 2 EWs to L20 → then L30 push.',
  ],
  hospital_fix: [
    'Upgrade hospital to maximum for your HQ level before any kill event.',
    'Use Enlistment Office as overflow — it holds troops without healing cost.',
    'Before major fights: heal hospital to full so it has maximum capacity.',
    'Strategy: let hospital fill → overflow to Enlistment → recall all before key event for power spike.',
  ],
  morale_fix: [
    'Research Special Forces morale node if available.',
    'Don\'t attack in series without returning to base — Warmind Morale stacks reset on base return.',
    'If opponent may have stacked morale (serial attacker), engage when they return to base.',
    'War Leader profession in Season 1 gives Inspire skill for morale boost.',
  ],
  scout_discipline: [
    'Always scout before attacking. A well-scouted counter formation beats 2x raw power.',
    'Use radar missions to generate recon data passively.',
    'Scout wall squad composition — identifies troop type and formation bonus.',
    'Never attack blind in Kill Event. You will regret it.',
  ],
};

// ─────────────────────────────────────────────────────────────
// SECTION 13 — PRE-ANALYSIS INTAKE QUESTIONS (updated)
// ─────────────────────────────────────────────────────────────
export const INTAKE_QUESTIONS = {
  purpose: 'Capture invisible variables that don\'t show in screenshots.',
  questions: [
    {
      id: 'report_type',
      question: 'What type of report is this?',
      options: ['PvP — I attacked someone', 'PvP — Someone attacked me', 'PvP — Rally', 'PvE — Zombie / Monster'],
      why: 'Changes analysis logic entirely. Determines which tactics card groups to show. PvE uses different diagnostic path.',
    },
    {
      id: 'squad_type',
      question: 'What troop type is your main squad?',
      options: ['Tank', 'Aircraft', 'Missile', 'Mixed'],
      why: 'Confirms type counter diagnosis direction.',
    },
    {
      id: 'tactics_cards',
      question: 'Which Tactics Cards were active in your deck?',
      type: 'multi-select',
      why: 'Tactics cards are completely invisible in battle reports. Efficient Unity changes formation math. Warmind Morale Boost explains asymmetric losses. Purgator explains PvE virus resistance outcomes.',
      options_pvp: {
        'Core Cards — Attacker': ['Warmind – Rapid Rescue', 'Warmind – Morale Boost', 'Windrusher – Morale Boost', 'Windrusher – Rapid Rescue'],
        'Core Cards — Defender': ['Buluwark – Comprehensive Enhancement', 'Buluwark – Morale Boost'],
        'Battle Cards': ['Efficient Unity', 'Damage Reduction Reversal', 'Damage Reversal', 'Attribute Aura', 'Warmind – One Against Ten'],
      },
      options_pve: {
        'PvE Cards': ['Purgator – Monster Slayer'],
        'Battle Cards': ['Attribute Aura'],
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// SECTION 14 — SYSTEM PROMPT BUILDER (for battle-report/route.ts)
// ─────────────────────────────────────────────────────────────
export function buildBattleReportSystemPrompt(
  playerProfile: {
    hq_level?: number;
    troop_type?: string;
    troop_tier?: string;
    squad_power?: number;
    server_day?: number;
    spend_style?: string;
    hero_power?: number;
    beginner_mode?: boolean;
  },
  intake: {
    report_type: string;
    squad_type: string;
    tactics_cards: string[];
  }
): string {
  const isPvE =
    intake.report_type.toLowerCase().includes('pve') ||
    intake.report_type.toLowerCase().includes('zombie') ||
    intake.report_type.toLowerCase().includes('monster');

  const tacticsCardsSummary =
    intake.tactics_cards.length > 0 ? intake.tactics_cards.join(', ') : 'None reported';

  const hasEfficientUnity = intake.tactics_cards.includes('Efficient Unity');
  const hasWarmindMorale = intake.tactics_cards.includes('Warmind – Morale Boost');
  const hasWindrusherMorale = intake.tactics_cards.includes('Windrusher – Morale Boost');
  const hasWarmindRapidRescue = intake.tactics_cards.includes('Warmind – Rapid Rescue');
  const hasWindrusherRapidRescue = intake.tactics_cards.includes('Windrusher – Rapid Rescue');
  const hasBuluwarkComp = intake.tactics_cards.includes('Buluwark – Comprehensive Enhancement');
  const hasBuluwarkMorale = intake.tactics_cards.includes('Buluwark – Morale Boost');
  const hasDamageReductionReversal = intake.tactics_cards.includes('Damage Reduction Reversal');
  const hasDamageReversal = intake.tactics_cards.includes('Damage Reversal');
  const hasAttributeAura = intake.tactics_cards.includes('Attribute Aura');
  const hasWarmindOneAgainstTen = intake.tactics_cards.includes('Warmind – One Against Ten');
  const hasPurgator = intake.tactics_cards.includes('Purgator – Monster Slayer');

  const cardFlags = [
    hasEfficientUnity ? '- EFFICIENT UNITY ACTIVE: Player has 4 same-type heroes but gets FULL +20% formation bonus, not +15%. Do NOT flag a formation issue if they have a 4+1 lineup.' : '',
    hasWarmindMorale ? '- WARMIND MORALE BOOST ACTIVE: Player may have entered this fight with stacked morale (+6% per prior PvP win, up to +30% at 5 stacks). Factor into damage advantage analysis.' : '',
    hasWindrusherMorale ? '- WINDRUSHER MORALE BOOST ACTIVE: Player gains +5% morale per march distance tier (up to 5x = +25%). Long-march attacks may have arrived with significant morale advantage.' : '',
    hasWarmindRapidRescue ? '- WARMIND RAPID RESCUE ACTIVE: Player recovers up to 100% lightly wounded troops after winning PvP (2x daily). Lightly wounded numbers in report may understate actual attrition.' : '',
    hasWindrusherRapidRescue ? '- WINDRUSHER RAPID RESCUE ACTIVE: Player can grant +50% march speed to self + 3x3 allies (3x daily).' : '',
    hasBuluwarkComp ? '- BULUWARK COMPREHENSIVE ENHANCEMENT ACTIVE: Player in defense gets +10% HP/ATK/DEF base + up to +24% more at max stacks (2x daily). Explains harder-than-expected garrison defense.' : '',
    hasBuluwarkMorale ? '- BULUWARK MORALE BOOST ACTIVE: Player in defense gets +3% morale per ally with same card (stacks 9x = +27%). Alliance defense coordination with this card = substantial morale wall.' : '',
    hasDamageReductionReversal ? '- DAMAGE REDUCTION REVERSAL ACTIVE: Player takes up to 5.10% less damage when at a type disadvantage.' : '',
    hasDamageReversal ? '- DAMAGE REVERSAL ACTIVE: Player deals up to 2.55% more damage when countered.' : '',
    hasAttributeAura ? '- ATTRIBUTE AURA ACTIVE: 1st squad heroes gain up to +4% ATK/DEF/HP in world map PvP.' : '',
    hasWarmindOneAgainstTen ? '- WARMIND ONE AGAINST TEN ACTIVE: Attribute penalties from marching with reduced march size reduced by up to 30%.' : '',
    hasPurgator ? '- PURGATOR MONSTER SLAYER ACTIVE: +250 virus resistance for 180s + -20% monster damage reduction.' : '',
    intake.tactics_cards.length === 0 ? '- NO TACTICS CARDS REPORTED: Player either has none equipped or is unsure. Do not assume any card effects. Note in coaching that equipping relevant cards is a free power gain.' : '',
  ].filter(Boolean).join('\n');

  return `You are the Last War: Survival Battle Report Analyzer — an expert AI combat coach embedded in Last War: Survival Buddy (LastWarSurvivalBuddy.com).

You will be given one or more screenshots of a Last War: Survival battle report along with player profile data and pre-analysis intake answers. Your job is to deliver a structured, expert-level post-battle analysis.

## PLAYER PROFILE
- HQ Level: ${playerProfile.hq_level ?? 'Unknown'}
- Main Troop Type: ${playerProfile.troop_type ?? intake.squad_type}
- Troop Tier: ${playerProfile.troop_tier ?? 'Unknown'}
- Squad Power: ${playerProfile.squad_power ? `${(playerProfile.squad_power / 1000000).toFixed(1)}M` : 'Unknown'}
- Server Day: ${playerProfile.server_day ?? 'Unknown'}
- Hero Power: ${playerProfile.hero_power ? `${(playerProfile.hero_power / 1000000).toFixed(1)}M` : 'Unknown'}
- Spend Style: ${playerProfile.spend_style ?? 'Unknown'}

## PLAYER INTAKE ANSWERS
- Report Type: ${intake.report_type}
- Squad Type Confirmed: ${intake.squad_type}
- Tactics Cards Active: ${tacticsCardsSummary}

## TACTICS CARD FLAGS (apply these directly to your analysis)
${cardFlags}

## COMBAT KNOWLEDGE BASE

### COUNTER SYSTEM (HARD RULE — DO NOT DEVIATE)
- Aircraft BEATS Tank (+20% deal, -20% take = ~40% effective swing)
- Tank BEATS Missile (+20% deal, -20% take = ~40% effective swing)
- Missile BEATS Aircraft (+20% deal, -20% take = ~40% effective swing)
- REVERSE IS TRUE FOR EACH — being on wrong side is a ~40% effective power penalty
- Buildings deal +25% extra damage to Aircraft in base defense

### FORMATION BONUS
- 5 same-type heroes: +20% HP/ATK/DEF
- 4 same-type: +15% (UNLESS Efficient Unity card active — then +20%)
- 3+2 mixed: +10%
- 3 same-type: +5%

### MORALE
- Morale Bonus = 1 + (Your Morale - Enemy Morale) / 100
- Losing troops → morale drops → damage drops → cascade
- Warmind Morale Boost card: +6% per PvP win, stacks 5x (invisible in screenshots)
- Windrusher Morale Boost: +5% morale per march distance tier (invisible in screenshots)

### EXCLUSIVE WEAPONS
- Every 3 EW levels = +1 skill level (base max 30, EW max 40)
- EW Level 20 = 7.5% stat boost + skills at level 36 vs opponent at 30
- Low skill damage relative to squad power = likely EW gap

### DECORATIONS (read directly from stat comparison screen — do not ask player)
- God of Judgment (S-tier): HP/ATK/DEF/March Size
- Tower of Victory (S-tier): ATK + Crit Damage
- Multiple red arrows in stat comparison with similar power = decoration gap
- Read the green/red arrows from Screen 4 — they show the gap directly

### TROOP LOSSES
- Lightly Wounded: free recovery, no hospital
- Wounded: hospital, costs resources
- Killed: PERMANENT if hospital + enlistment both full
- High kill count = hospital was full during fight

### OPPONENT IDENTIFICATION (Screen 1)
- The opponent's name is visible on Screen 1 (Outcome + Power Summary) as the other player's name
- The opponent's displayed power is visible on Screen 1
- ALWAYS extract opponent_name from the screenshots. If not legible, use "Unknown"
- ALWAYS extract opponent_power from the screenshots. If not legible, use "not visible"

## YOUR OUTPUT FORMAT
Respond ONLY with a JSON object. No markdown, no preamble. Structure:

{
  "outcome": "Win" | "Loss" | "Pyrrhic Win",
  "report_type": "PvP Solo" | "PvP Rally" | "PvE Zombie" | "PvE Boss",
  "verdict": "Short verdict label (e.g. 'Countered — Type Mismatch')",
  "opponent_name": "The opponent's in-game name from Screen 1, or 'Unknown' if not legible",
  "opponent_power": "The opponent's displayed power from Screen 1, e.g. '42.3M' or 'not visible'",
  "power_differential": {
    "attacker_power": "e.g. 47.2M or 'not visible'",
    "defender_power": "e.g. 51.8M or 'not visible'",
    "gap_pct": "e.g. '-8.7%' or 'not calculable'",
    "assessment": "Within winnable range" | "Significant disadvantage" | "Significant advantage" | "Unknown"
  },
  "troop_breakdown": {
    "your_type_damage_pct": "e.g. '100%' or 'not visible'",
    "enemy_type_damage_pct": "e.g. '34%' or 'not visible'",
    "type_matchup": "Favored" | "Neutral" | "Countered" | "Unknown",
    "counter_explanation": "One sentence explanation of the matchup"
  },
  "stat_comparison": {
    "atk_status": "Advantage" | "Disadvantage" | "Equal" | "Not visible",
    "hp_status": "Advantage" | "Disadvantage" | "Equal" | "Not visible",
    "def_status": "Advantage" | "Disadvantage" | "Equal" | "Not visible",
    "lethality_status": "Advantage" | "Disadvantage" | "Equal" | "Not visible",
    "stat_gap_cause": "Likely decoration gap" | "Likely gear gap" | "Likely research gap" | "Likely EW gap" | "Multiple factors" | "Stats favorable" | "Unknown"
  },
  "hero_performance": {
    "skill_damage_assessment": "Strong" | "Moderate" | "Weak" | "Not visible",
    "ew_gap_suspected": true | false,
    "notes": "One sentence on hero skill performance"
  },
  "formation": {
    "your_formation_bonus": "20%" | "15%" | "10%" | "5%" | "Unknown",
    "formation_issue": true | false,
    "notes": "One sentence on formation"
  },
  "loss_severity": {
    "killed_count": "number or 'not visible'",
    "hospital_overflow_risk": true | false,
    "permanent_loss_warning": true | false
  },
  "root_causes": ["Array of 1-3 root cause strings in plain English"],
  "coaching": ["Array of 3-5 specific actionable coaching items"],
  "rematch_verdict": "Yes — conditions met" | "Not yet — see coaching" | "No — power gap too large" | "N/A — you won",
  "rematch_reasoning": "One sentence on rematch recommendation",
  "invisible_factors_note": "Note on tactics cards reported and how they affected this outcome."
}

## RULES
- Read ALL screenshots as a set. Earlier screens may have data that later screens need.
- If a data field is not visible in any screenshot, use "not visible" — NEVER fabricate numbers.
- ALWAYS attempt to read opponent_name and opponent_power from Screen 1. This is the most important new field.
- Base your counter diagnosis on the troop type breakdown screen, not assumptions.
- If report type is PvE, ignore PvP counter system and use PvE diagnostic path.
- Apply Efficient Unity formation correction if that flag is active above.
- Apply morale card context if Warmind or Windrusher morale flags are active above.
- Read stat gap from Screen 4 red/green arrows — do not guess from power numbers alone.
- Be specific. "Your Aircraft took 100% damage while their Missile took 22%" is better than "you were countered."
- ${playerProfile.beginner_mode ? 'This player is in Beginner Mode. Keep coaching language simple and explain the WHY behind every recommendation.' : 'This is an experienced player. Be direct and technical.'}
- NEVER invent data. If you cannot read a number from the screenshot, say so.`;
}

// ─────────────────────────────────────────────────────────────
// SECTION 15 — QUOTA LIMITS
// ─────────────────────────────────────────────────────────────
export const BATTLE_REPORT_QUOTAS = {
  free: {
    daily_limit: 0,
    gate: 'hard',
    cta: 'Upgrade to Pro to unlock Battle Report Analyzer',
  },
  pro: {
    daily_limit: 3,
    gate: 'soft',
    cost_per_report_usd: 0.043,
    monthly_max_cost_usd: 3.87,
    monthly_revenue_usd: 9.99,
    margin_usd: 6.12,
  },
  elite: {
    daily_limit: 5,
    gate: 'soft',
    cost_per_report_usd: 0.043,
    monthly_max_cost_usd: 6.45,
    monthly_revenue_usd: 19.99,
    margin_usd: 13.54,
  },
  alliance: {
    daily_limit: 5,
    gate: 'soft',
    cost_per_report_usd: 0.043,
    monthly_max_cost_usd: 6.45,
    monthly_revenue_usd: 19.99,
    margin_usd: 13.54,
  },
  founding: {
    daily_limit: 10,
    displayed_as: 'Unlimited',
    gate: 'soft_invisible',
    cost_per_report_usd: 0.043,
    monthly_max_cost_usd: 12.90,
    monthly_revenue_equiv_usd: 2.06,
    note: 'Accept the cost. Founding Members are your advocates. Soft cap at 10/day is invisible.',
  },
};

// ─────────────────────────────────────────────────────────────
// EXPORT SUMMARY
// ─────────────────────────────────────────────────────────────
export function getBattleReportKnowledgeSummary(): string {
  return `
BATTLE REPORT ANALYZER KNOWLEDGE BASE
======================================
Counter Matrix: Aircraft>Tank>Missile>Aircraft. Each matchup = ~40% effective power swing.
Buildings: +25% damage to Aircraft in base defense.
Formation: 5-same = +20% HP/ATK/DEF. 3+2 = +10%. Gap is meaningful.
Efficient Unity card: 4-same gets full +20% — must be captured in intake.
Morale: Losing early = cascade. Warmind Morale Boost stacks 5x invisibly.
EW: Level 20 = 7.5% boost + skills at 36 vs 30. Shows as hero skill damage gap.
Decorations: Read from Screen 4 red/green arrows. God of Judgment + Tower of Victory = S-tier.
Troop Losses: High killed = hospital full = permanent loss.
PvE: Virus resistance gate in Season 1. Purgator card required. AoE heroes for Zombie Siege.
Screens: 6 screens per report. Screen 2 (troop breakdown) is most critical.
Opponent: Name and power extracted from Screen 1. Stored as opponent_name / opponent_power.
Quotas: Free=0, Pro=3/day, Elite=5/day, Founding=10/day (shown as unlimited).
  `.trim();
}