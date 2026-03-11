// src/lib/lwtT11Data.ts
// T11 Troops — full unlock system, Armament Institute, resources, star bonuses
// Source: ldshop.gg/blog/last-war-survival/t11-troops-guide.html

// ─── OVERVIEW ────────────────────────────────────────────────────────────────

export const T11_OVERVIEW = {
  description:
    'T11 troops are the endgame troop tier, unlocked in Season 4 off-season. Unlike T1–T10 which are split by type (Aircraft/Tank/Infantry/Missile), T11 comes in two variants — Armored Trooper (defensive) and Assault Raider (offensive) — and you can swap between them every 72 hours.',
  unlockSeason: 'Season 4 off-season (after Season 4 main content completes)',
  swapCooldown: '72 hours between Armored Trooper ↔ Assault Raider switches',
};

// ─── PREREQUISITES ───────────────────────────────────────────────────────────

export const T11_PREREQUISITES = [
  {
    requirement: 'Server Progress',
    detail: 'Season 4 off-season must be reached',
  },
  {
    requirement: 'HQ Level',
    detail: 'HQ 27 minimum',
  },
  {
    requirement: 'Existing Troops',
    detail: 'T10 must already be unlocked',
  },
  {
    requirement: 'Building',
    detail: 'Armament Institute must be constructed',
  },
  {
    requirement: 'Barracks',
    detail: 'Level 35 required to train T11 after unlock. START THIS EARLY — it takes a long time and enormous resources. Run it parallel with research.',
  },
];

// ─── STAT COMPARISON T10 vs T11 ──────────────────────────────────────────────

export const T11_STAT_COMPARISON = {
  power:     { t10: 1647, t11: 1840 },
  morale:    { t10: 750,  t11: 800  },
  squadLoad: { t10: 2200, t11: 2400 },
  unitAttack:{ t10: 45.14, t11: 51.7 },
  summary: 'Roughly 5–10% boost across the board plus special abilities. Not incremental — a meaningful step up.',
};

// ─── TROOP VARIANTS ───────────────────────────────────────────────────────────

export const T11_VARIANTS = [
  {
    name: 'Armored Trooper',
    focus: 'Defensive',
    primarySkill: 'Battle Protection — 5% less severe wounds',
    bestFor: 'Defense, conserving heals, surviving major attacks',
    defaultChoice: false,
  },
  {
    name: 'Assault Raider',
    focus: 'Offensive',
    primarySkill: 'Iron Will — 10% less capacity penalty when not at full strength',
    bestFor: 'Attack events, rallies, Kill Event, Enemy Buster Day 6',
    defaultChoice: true,
    defaultNote: 'Default choice for general play. Switch to Armored Trooper before major defensive wars.',
  },
];

// ─── ARMAMENT RESOURCES ───────────────────────────────────────────────────────

export const T11_RESOURCES = {
  armamentMaterials: {
    name: 'Armament Materials',
    rarity: 'Common',
    description: 'Primary research resource for the Armament Institute. Needed in large quantities throughout all four branches.',
    finalUnlockCost: 120000,
    sources: [
      { source: 'Restricted Area Training (passive)', free: true, notes: 'Drops in background every 30 seconds. Collect multiple times daily — cap is 3 stored sessions.' },
      { source: 'Restricted Area Bosses', free: true, notes: 'Guaranteed materials + cores. Only challenge bosses when your Troop Power exceeds theirs.' },
      { source: 'Alliance Store', free: true, notes: '20,000 materials per week. Buy every week without fail.' },
      { source: 'VIP Store', free: true, notes: '30,000 materials + 5 cores per week. High priority purchase.' },
      { source: 'Weekly Packs', free: false, notes: '180,000 materials included. Good value for spenders.' },
    ],
  },
  armamentCores: {
    name: 'Armament Cores',
    rarity: 'Rare — primary bottleneck',
    description: 'Rare resource required at specific research intervals. The real gating resource for T11 unlock — treat like drone gold bottle caps.',
    finalUnlockCost: 200,
    sources: [
      { source: 'Restricted Area Training (passive)', free: true, notes: 'Rare drops. Collect passively every day.' },
      { source: 'Restricted Area Bosses', free: true, notes: 'Guaranteed cores on boss kill. Priority activity.' },
      { source: 'VIP Store', free: true, notes: '5 cores per week. Buy every week.' },
      { source: 'Glittering Market', free: true, notes: '10 cores for 40 Glittering Coins. Solid value — prioritize cores here.' },
      { source: 'Black Market discount tab', free: false, notes: '5 cores for 150 cash. BUY IMMEDIATELY if you see this. Limited appearance.' },
      { source: 'Weekly Packs', free: false, notes: '100 cores included. Best paid source.' },
    ],
  },
};

// ─── RESEARCH BRANCHES ────────────────────────────────────────────────────────

export const T11_RESEARCH_BRANCHES = [
  {
    order: 1,
    name: 'Helmet',
    coreFrequency: 'Cores required every 5th level',
    notes: 'First branch. Complete before unlocking Body Armor.',
  },
  {
    order: 2,
    name: 'Body Armor',
    coreFrequency: 'Cores required every 5th level',
    notes: 'Second branch. Must complete Helmet first.',
  },
  {
    order: 3,
    name: 'Protective Gear',
    coreFrequency: 'Cores required every 5th level',
    notes: 'Third branch. Must complete Body Armor first.',
  },
  {
    order: 4,
    name: 'Weapon',
    coreFrequency: 'Cores required every 2nd–3rd level',
    notes: 'Final branch and biggest resource hog. Cores required far more frequently. Save cores for this stage.',
  },
];

// ─── FINAL UNLOCK COST ────────────────────────────────────────────────────────

export const T11_FINAL_UNLOCK = {
  armamentMaterials: 120000,
  armamentCores: 200,
  oil: 1200000,
  note: 'This is the FINAL unlock cost on top of all research costs. Start hoarding all three resources from the moment Armament Institute is built.',
};

// ─── STAR BONUSES ────────────────────────────────────────────────────────────

export const T11_STAR_BONUSES = {
  rule: 'Star bonuses ONLY activate when ALL FOUR research branches reach the same star level. You cannot get 1-star bonus from just one branch at 1-star.',
  priority: 'Rush 1-star across all four branches first — massive PvP advantage.',
  stars: [
    {
      level: 1,
      armoredTrooperBonus: 'Ignore part of enemy Reduce Damage Taken',
      assaultRaiderBonus: 'Ignore part of enemy Reduce Damage Taken',
      priority: 'HIGHEST — rush this first. Applies to both variants.',
    },
    {
      level: 2,
      armoredTrooperBonus: 'Counterattack on battle loss',
      assaultRaiderBonus: 'Restore lightly wounded troops on battle success',
      priority: 'HIGH',
    },
    {
      level: 3,
      armoredTrooperBonus: 'Increase lethality rate',
      assaultRaiderBonus: 'Increase lethality rate',
      priority: 'MEDIUM',
    },
    {
      level: 4,
      armoredTrooperBonus: 'Further reduce severe wound rate',
      assaultRaiderBonus: 'Further reduce capacity penalty',
      priority: 'MEDIUM — playstyle-dependent',
    },
  ],
};

// ─── RESTRICTED AREA TRAINING ─────────────────────────────────────────────────

export const RESTRICTED_AREA_GUIDE = {
  description:
    'Replaces the old Honor Campaign. The primary passive farming system for Armament Materials and Cores. 10 levels with 50 campaigns each.',
  powerGating: 'Your Troop Power determines how far you progress. Only challenge bosses when your Troop Power exceeds the boss — no RNG carry possible.',
  passiveDrops: 'Runs in background. Drops loot every 30 seconds. Sessions cap at 3 — collect multiple times daily or lose drops.',
  virtueLoop: 'Every research level completed boosts Troop Power → lets you beat harder bosses → drops more resources. Snowball system.',
  tips: [
    'Collect passive rewards multiple times per day — do not let the session cap sit at 3',
    'Only challenge bosses when your power exceeds theirs',
    'Watch for Event Record tasks in the bottom-right notepad — bonus resources',
    'Every research node you complete today makes tomorrow\'s farming faster',
  ],
};

// ─── TIMELINE ────────────────────────────────────────────────────────────────

export const T11_TIMELINE = [
  { spendTier: 'Whale / Heavy Investor', timeToUnlock: '1–2 months', notes: 'Buying weekly packs and Black Market cores.' },
  { spendTier: 'Low Spender', timeToUnlock: '2–3 months', notes: 'Weekly passes + smart Glittering coin spending on cores.' },
  { spendTier: 'F2P', timeToUnlock: '4–5 months', notes: 'Requires consistent daily Restricted Area farming + every free store purchase.' },
];

// ─── STRATEGY TIPS ────────────────────────────────────────────────────────────

export const T11_TIPS = [
  {
    category: 'Barracks',
    tip: 'Start Barracks 35 upgrade immediately. Run it in parallel with research — do NOT wait until research is done or you will delay training by weeks.',
  },
  {
    category: 'Cores',
    tip: 'Armament Cores are the real bottleneck. Every weekly store reset, buy cores first before anything else — VIP Store (5 cores) and Glittering Market (10 cores for 40 coins).',
  },
  {
    category: 'Cores',
    tip: 'Black Market discount tab: 5 cores for 150 cash. Buy immediately every time you see it. Do not wait.',
  },
  {
    category: 'Restricted Area',
    tip: 'Treat Restricted Area passive farming as a daily habit. Do not let sessions sit capped at 3 — you are losing free materials.',
  },
  {
    category: 'Research Order',
    tip: 'Complete branches in order: Helmet → Body Armor → Protective Gear → Weapon. Cannot skip. Save extra cores for the Weapon branch — it costs cores every 2nd–3rd level.',
  },
  {
    category: 'Alliance Duel',
    tip: 'Tuesday\'s Duel VS day (Base Expansion / consume resources) — dump Armament Materials into research to double-dip Arms Race and Duel points.',
  },
  {
    category: 'Troop Choice',
    tip: 'Default to Assault Raiders (offensive) for general play. Switch to Armored Troopers before major defensive wars. 72-hour cooldown on swaps — plan ahead.',
  },
  {
    category: 'Star Priority',
    tip: 'After unlock, rush 1-star across all four branches before going for 2-star on any single branch. All branches must match for bonus to activate.',
  },
  {
    category: 'Oil',
    tip: 'Final unlock costs 1.2M oil on top of research. HQ 25+ players already know oil is scarce. Start stockpiling early.',
  },
];

// ─── SUMMARY FUNCTION ────────────────────────────────────────────────────────

export function getT11DataSummary(): string {
  const prereqs = T11_PREREQUISITES.map(
    (p) => `  - ${p.requirement}: ${p.detail}`
  ).join('\n');

  const variants = T11_VARIANTS.map(
    (v) =>
      `  [${v.name} — ${v.focus}]\n` +
      `  Skill: ${v.primarySkill}\n` +
      `  Best For: ${v.bestFor}` +
      (v.defaultNote ? `\n  NOTE: ${v.defaultNote}` : '')
  ).join('\n\n');

  const branches = T11_RESEARCH_BRANCHES.map(
    (b) => `  ${b.order}. ${b.name} — ${b.coreFrequency}. ${b.notes}`
  ).join('\n');

  const materialSources = T11_RESOURCES.armamentMaterials.sources.map(
    (s) => `  - ${s.source} [${s.free ? 'FREE' : 'PAID'}]: ${s.notes}`
  ).join('\n');

  const coreSources = T11_RESOURCES.armamentCores.sources.map(
    (s) => `  - ${s.source} [${s.free ? 'FREE' : 'PAID'}]: ${s.notes}`
  ).join('\n');

  const starBonuses = T11_STAR_BONUSES.stars.map(
    (s) =>
      `  ${s.level}★ [${s.priority}]: Assault Raider — ${s.assaultRaiderBonus} | Armored Trooper — ${s.armoredTrooperBonus}`
  ).join('\n');

  const timeline = T11_TIMELINE.map(
    (t) => `  [${t.spendTier}]: ${t.timeToUnlock} — ${t.notes}`
  ).join('\n');

  const tips = T11_TIPS.map(
    (t) => `  [${t.category}] ${t.tip}`
  ).join('\n');

  return `## T11 Troops System

${T11_OVERVIEW.description}
Swap cooldown: ${T11_OVERVIEW.swapCooldown}

### Prerequisites
${prereqs}

### T10 → T11 Stat Increase
Power: ${T11_STAT_COMPARISON.power.t10} → ${T11_STAT_COMPARISON.power.t11} | Morale: ${T11_STAT_COMPARISON.morale.t10} → ${T11_STAT_COMPARISON.morale.t11} | Squad Load: ${T11_STAT_COMPARISON.squadLoad.t10} → ${T11_STAT_COMPARISON.squadLoad.t11} | Unit Attack: ${T11_STAT_COMPARISON.unitAttack.t10} → ${T11_STAT_COMPARISON.unitAttack.t11}
${T11_STAT_COMPARISON.summary}

### T11 Variants (swappable every 72 hours)
${variants}

### Research Branches (must complete in order)
${branches}

### Final Unlock Cost
${T11_FINAL_UNLOCK.armamentMaterials.toLocaleString()} Armament Materials + ${T11_FINAL_UNLOCK.armamentCores} Armament Cores + ${T11_FINAL_UNLOCK.oil.toLocaleString()} Oil
${T11_FINAL_UNLOCK.note}

### Armament Materials — Sources
${materialSources}

### Armament Cores — Sources (primary bottleneck)
${coreSources}

### Restricted Area Training
${RESTRICTED_AREA_GUIDE.description}
- ${RESTRICTED_AREA_GUIDE.passiveDrops}
- ${RESTRICTED_AREA_GUIDE.powerGating}
- ${RESTRICTED_AREA_GUIDE.virtueLoop}

### Star Bonuses (all 4 branches must match star level)
${T11_STAR_BONUSES.rule}
${starBonuses}

### Timeline to Unlock
${timeline}

### Strategy Tips
${tips}
`;
}