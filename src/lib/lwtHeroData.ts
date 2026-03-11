// src/lib/lwtHeroData.ts
// Hero system knowledge for Buddy — priority order, skill focus, playstyle fit, promotion strategy

export interface HeroEntry {
  name: string;
  rarity: 'UR' | 'SSR' | 'SR';
  type: 'combat' | 'development' | 'both';
  playstyle: ('fighter' | 'developer' | 'commander' | 'scout')[];
  hqUnlock?: number; // approximate HQ level where hero becomes relevant
  priority: 'core' | 'high' | 'medium' | 'low';
  notes: string;
  skillFocus?: string; // which skill(s) to max first
  exclusiveWeapon?: boolean;
}

export const HEROES: HeroEntry[] = [
  // ── Combat UR Heroes ──────────────────────────────────────────────
  {
    name: 'Lucius',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 20,
    priority: 'core',
    notes: 'Top-tier combat hero. Best in slot for Aircraft squads. High march power and rally leadership. Priority for Exclusive Weapon (S4 W1).',
    skillFocus: 'Skill 1 (Attack) first, then Skill 3 (March)',
    exclusiveWeapon: true,
  },
  {
    name: 'Adam',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 22,
    priority: 'core',
    notes: 'Core fighter hero. Strong infantry buff and kill count multiplier. Essential for Kill Events. Exclusive Weapon (S4 W3) meaningfully increases kill ceiling.',
    skillFocus: 'Skill 2 (Infantry ATK) first',
    exclusiveWeapon: true,
  },
  {
    name: 'Williams',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 25,
    priority: 'core',
    notes: 'High-power combat hero, especially strong for Tank squads. Exclusive Weapon (S4 W6) adds significant ATK bonuses. Good secondary rally leader.',
    skillFocus: 'Skill 1 (ATK) first, Skill 4 (Troop HP) second',
    exclusiveWeapon: true,
  },
  {
    name: 'Mason',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 18,
    priority: 'high',
    notes: 'Versatile combat hero available across all seasons. Strong general-purpose march power. Good choice before season-specific heroes unlock.',
    skillFocus: 'Skill 1 (ATK) first',
    exclusiveWeapon: false,
  },
  {
    name: 'Scarlett',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 18,
    priority: 'high',
    notes: 'Female combat UR available across all seasons. Solid march stats, good for early-season roster building.',
    skillFocus: 'Skill 2 (Troop ATK) first',
    exclusiveWeapon: false,
  },
  {
    name: 'Venom',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 25,
    priority: 'high',
    notes: 'S5 combat hero (W3 D1 promo — do on Thursday for Duel VS bonus). Strong in Wild West meta. Good pairing with Fiona.',
    skillFocus: 'Skill 1 (ATK) first',
    exclusiveWeapon: false,
  },
  {
    name: 'Fiona',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 25,
    priority: 'high',
    notes: 'S5 Exclusive Weapon hero (W1). Wild West specialist. Pair with Venom for full S5 combat roster.',
    skillFocus: 'Skill 1 (ATK) first',
    exclusiveWeapon: true,
  },
  {
    name: 'Stetmann',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'developer', 'commander'],
    hqUnlock: 25,
    priority: 'medium',
    notes: 'S5 Exclusive Weapon hero (W3). Hybrid combat/development utility. Useful for Arms Race scoring on development days.',
    skillFocus: 'Skill 2 (mixed) first',
    exclusiveWeapon: true,
  },
  {
    name: 'Morrison',
    rarity: 'UR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    hqUnlock: 25,
    priority: 'medium',
    notes: 'S5 Exclusive Weapon hero (W6). Late-season specialist. Build after Fiona and Stetmann.',
    skillFocus: 'Skill 1 (ATK) first',
    exclusiveWeapon: true,
  },

  // ── Development UR Heroes ──────────────────────────────────────────
  {
    name: 'Violet',
    rarity: 'UR',
    type: 'development',
    playstyle: ['developer', 'scout', 'commander'],
    hqUnlock: 15,
    priority: 'core',
    notes: 'Best construction speed hero in the game. Must-have for all players regardless of playstyle. Available across all seasons. Level this early — construction time savings compound forever.',
    skillFocus: 'Skill 1 (Construction Speed) first — always',
    exclusiveWeapon: false,
  },
  {
    name: 'Sarah',
    rarity: 'UR',
    type: 'development',
    playstyle: ['developer', 'scout', 'commander'],
    hqUnlock: 15,
    priority: 'core',
    notes: 'Top research speed hero. Pairs with Violet to cover both construction and research. S4 W3 D1 promo. Available in all seasons. Level right after Violet.',
    skillFocus: 'Skill 1 (Research Speed) first — always',
    exclusiveWeapon: false,
  },
  {
    name: 'Shirley',
    rarity: 'SSR',
    type: 'development',
    playstyle: ['developer', 'scout', 'commander'],
    hqUnlock: 8, // unlocked via VIP 8
    priority: 'core',
    notes: 'Unlocked at VIP 8. Construction speed hero. Level immediately when unlocked — she is your construction lead until Violet. Skill 1 first, always.',
    skillFocus: 'Skill 1 (Construction Speed) first',
    exclusiveWeapon: false,
  },

  // ── SSR Heroes ────────────────────────────────────────────────────
  {
    name: 'General SSR Combat Heroes',
    rarity: 'SSR',
    type: 'combat',
    playstyle: ['fighter', 'commander'],
    priority: 'medium',
    notes: 'SSR combat heroes fill march slots before UR unlocks. Promote to UR if medals allow — 100% medal refund makes this safe. Do not spend heavily on SSR skill medals if UR promotion is near.',
    skillFocus: 'Skill 1 (ATK) only until UR promotion',
    exclusiveWeapon: false,
  },
];

// ── Hero Priority by Player Stage ──────────────────────────────────

export const HERO_PRIORITY_BY_STAGE = {
  early: {
    label: 'Early Game (HQ 1–20, Under T10)',
    order: ['Shirley (construction)', 'Violet (construction)', 'Sarah (research)', 'Any UR combat available'],
    rule: 'Development heroes first. Always. Construction and research speed compound daily — every hour saved is permanent. Do not neglect Shirley at VIP 8.',
  },
  mid: {
    label: 'Mid Game (HQ 20–30, T10)',
    order: ['Violet (construction)', 'Sarah (research)', 'Lucius or Mason (combat)', 'Adam (Kill Events)', 'Scarlett (fill march slots)'],
    rule: 'Balance development with combat. Lucius or Mason should be your lead combat hero. Keep leveling Violet and Sarah — research trees get longer.',
  },
  late: {
    label: 'Late Game (HQ 31–35, T11)',
    order: ['Lucius (EW priority)', 'Adam (EW priority)', 'Williams (EW priority)', 'Violet/Sarah (keep maxing)', 'Season hero (Venom/Fiona for S5)'],
    rule: 'Exclusive Weapons change the ceiling. Lucius EW first (S4 W1), then Adam (S4 W3). Violet and Sarah stay permanently relevant — never stop leveling them.',
  },
};

// ── Skill Medal Priority Rules ──────────────────────────────────────

export const HERO_SKILL_RULES = [
  'Always level Skill 1 first on development heroes (Violet, Sarah, Shirley) — construction and research speed are the most valuable stats in the game.',
  'For combat heroes, Skill 1 (ATK) first, then the skill that buffs your troop type.',
  'Do NOT spread medals thin across many heroes — max one skill per hero before moving to the next.',
  'SSR heroes: only invest Skill 1 if UR promotion is more than 60 days away. The 100% medal refund on promotion makes early investment safe, but opportunity cost matters.',
  'UR heroes with Exclusive Weapons: skills L31–40 require the EW to unlock. Do not wait for EW to start leveling — reach L30 first, then add EW when available.',
  'Medal priority order: Violet Skill 1 > Sarah Skill 1 > Lead combat hero Skill 1 > Everything else.',
];

// ── Promotion Strategy ──────────────────────────────────────────────

export const HERO_PROMOTION_NOTES = [
  'Promoting an SSR or SR hero to UR gives a 100% medal refund — all medals spent on that hero come back. This means early SSR investment is never wasted.',
  'Do not promote heroes to UR just for the refund — only promote when you have the fragments and it makes roster sense.',
  'Violet and Sarah should be promoted to UR as soon as fragments allow — their development bonuses scale with rarity.',
  'Combat UR promotion priority: Lucius > Adam > Williams > Mason/Scarlett.',
];

// ── Playstyle Hero Fit ──────────────────────────────────────────────

export const HERO_BY_PLAYSTYLE = {
  fighter: {
    label: 'Fighter (PVP)',
    core: ['Lucius', 'Adam', 'Williams'],
    secondary: ['Mason', 'Scarlett', 'Venom', 'Fiona'],
    note: 'Maximize combat hero levels before development. Kill Event performance scales directly with hero power.',
  },
  developer: {
    label: 'Developer (PVE)',
    core: ['Violet', 'Sarah', 'Shirley'],
    secondary: ['Stetmann', 'Any available combat UR for march slots'],
    note: 'Development heroes are your primary investment. Combat heroes only need enough levels to participate in events — do not sacrifice Violet/Sarah progression.',
  },
  commander: {
    label: 'Commander (50/50)',
    core: ['Violet', 'Sarah', 'Lucius'],
    secondary: ['Adam', 'Shirley', 'Mason'],
    note: 'Even split — level Violet/Sarah first, then Lucius. This is the optimal order for players who do both PVP and development.',
  },
  scout: {
    label: 'Scout (Still Figuring It Out)',
    core: ['Shirley', 'Violet', 'Sarah'],
    secondary: ['Any available UR combat hero'],
    note: 'Start with Shirley (VIP 8), then Violet, then Sarah. Development heroes give you more value per medal at this stage than any combat hero.',
  },
};

// ── Exclusive Weapon Reference ──────────────────────────────────────

export const EXCLUSIVE_WEAPONS = [
  { hero: 'Lucius', season: 4, week: 1, note: 'First EW available in S4. Highest priority.' },
  { hero: 'Adam', season: 4, week: 3, note: 'Second S4 EW. Core Kill Event hero.' },
  { hero: 'Williams', season: 4, week: 6, note: 'Third S4 EW. Strong for Tank players.' },
  { hero: 'Fiona', season: 5, week: 1, note: 'First S5 EW. Wild West specialist.' },
  { hero: 'Stetmann', season: 5, week: 3, note: 'Second S5 EW. Hybrid utility.' },
  { hero: 'Morrison', season: 5, week: 6, note: 'Third S5 EW. Late S5 specialist.' },
];

// ── Summary for Buddy system prompt ────────────────────────────────

export function getHeroDataSummary(): string {
  const coreHeroes = HEROES.filter(h => h.priority === 'core');
  const ewHeroes = EXCLUSIVE_WEAPONS;

  return `## Hero System

### Development Heroes — Always First
${coreHeroes
  .filter(h => h.type === 'development')
  .map(h => `- **${h.name}** (${h.rarity}): ${h.notes} Skill focus: ${h.skillFocus}`)
  .join('\n')}

### Combat Hero Priority (Core)
${coreHeroes
  .filter(h => h.type === 'combat')
  .map(h => `- **${h.name}** (${h.rarity}): ${h.notes} Skill focus: ${h.skillFocus}`)
  .join('\n')}

### Hero Priority by Stage
- **Early (HQ 1–20):** ${HERO_PRIORITY_BY_STAGE.early.rule}
- **Mid (HQ 20–30):** ${HERO_PRIORITY_BY_STAGE.mid.rule}
- **Late (HQ 31–35, T11):** ${HERO_PRIORITY_BY_STAGE.late.rule}

### Skill Medal Rules
${HERO_SKILL_RULES.map(r => `- ${r}`).join('\n')}

### Promotion Strategy
${HERO_PROMOTION_NOTES.map(n => `- ${n}`).join('\n')}

### Exclusive Weapons (unlock hero skill levels 31–40)
${ewHeroes.map(ew => `- **${ew.hero}**: Season ${ew.season} Week ${ew.week} — ${ew.note}`).join('\n')}

### Hero Priority by Playstyle
- **Fighter:** Core = ${HERO_BY_PLAYSTYLE.fighter.core.join(', ')}. ${HERO_BY_PLAYSTYLE.fighter.note}
- **Developer:** Core = ${HERO_BY_PLAYSTYLE.developer.core.join(', ')}. ${HERO_BY_PLAYSTYLE.developer.note}
- **Commander:** Core = ${HERO_BY_PLAYSTYLE.commander.core.join(', ')}. ${HERO_BY_PLAYSTYLE.commander.note}
- **Scout:** Core = ${HERO_BY_PLAYSTYLE.scout.core.join(', ')}. ${HERO_BY_PLAYSTYLE.scout.note}`;
}