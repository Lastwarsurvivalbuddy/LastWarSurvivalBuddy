// src/lib/lwtBuildingData.ts
// Building priority strategy for Buddy — upgrade order, HQ gates, playstyle fit
// Complements buildingData.ts (registry) and buildingCostData.ts (costs)
// This file answers: "what should I upgrade next and why"

export interface BuildingPriorityEntry {
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  playstyle: ('fighter' | 'developer' | 'commander' | 'scout' | 'all')[];
  hqGate?: number;       // minimum HQ level before this matters
  hqCap?: number;        // HQ level after which this is no longer a focus
  notes: string;
  upgradeWhen: string;   // plain-English rule for when to upgrade this
}

export const BUILDING_PRIORITIES: BuildingPriorityEntry[] = [
  {
    name: 'HQ (Headquarters)',
    priority: 'critical',
    playstyle: ['all'],
    notes: 'HQ gates everything. Every other building has a max level tied to HQ level. Upgrading HQ unlocks new buildings, higher troop tiers, and research branches. Always the first upgrade when prerequisites are met.',
    upgradeWhen: 'Upgrade HQ the moment all prerequisite buildings are at the required level. Never sit on a ready HQ upgrade.',
  },
  {
    name: 'Barracks',
    priority: 'critical',
    playstyle: ['all'],
    notes: 'Barracks level gates troop tier unlock. T10 requires HQ 16 + Barracks at required level. T11 requires HQ 31+. Higher Barracks = faster troop training queue and higher tier access. Always keep Barracks at max for your HQ level.',
    upgradeWhen: 'Keep at max level for your current HQ. Never let Barracks fall behind — it is on the critical path to T10 and T11.',
  },
  {
    name: 'Research Institute',
    priority: 'critical',
    playstyle: ['all'],
    notes: 'Research Institute level gates which research branches are available. Higher level = access to deeper military and development trees. On the HQ upgrade critical path.',
    upgradeWhen: 'Keep at max for your HQ level. Research trees get longer and more valuable the further you progress.',
  },
  {
    name: 'War Factory',
    priority: 'critical',
    playstyle: ['fighter', 'commander', 'all'],
    notes: 'War Factory level directly increases march power and troop attack stats. One of the highest-impact combat buildings. Also gates advanced military research branches.',
    upgradeWhen: 'Prioritize alongside Barracks. Fighter and Commander players should never let War Factory fall behind HQ cap.',
  },
  {
    name: 'Hero Hall',
    priority: 'high',
    playstyle: ['all'],
    notes: 'Hero Hall level gates hero level cap and the number of heroes you can field. Higher Hero Hall = higher hero level ceiling, which directly increases march power. Essential for all playstyles.',
    upgradeWhen: 'Upgrade whenever HQ allows. Hero power compounds — every level of Hero Hall unlocks more hero XP ceiling.',
  },
  {
    name: 'Alliance Center',
    priority: 'high',
    playstyle: ['all'],
    notes: 'Alliance Center level gates alliance tech contribution limits, rally capacity, and alliance help speed. Higher level = more alliance help received per day, which directly reduces construction and research time.',
    upgradeWhen: 'Keep near max. Alliance help is free construction speed — do not leave it on the table.',
  },
  {
    name: 'Hospital',
    priority: 'high',
    playstyle: ['fighter', 'commander'],
    hqGate: 16,
    notes: 'Hospital capacity determines how many troops are saved vs. killed after combat. Troops in hospital are recoverable — dead troops are gone. Higher Hospital level = more troops saved per battle. Critical for fighters who take losses regularly.',
    upgradeWhen: 'Fighter/Commander: upgrade Hospital before increasing march size. Sending more troops than your Hospital can hold after a loss = permanent troop death.',
  },
  {
    name: 'Gear Factory',
    priority: 'high',
    playstyle: ['all'],
    hqGate: 16,
    notes: 'Gear Factory level gates gear rarity upgrades and star promotions. Level 20 is required for star promotion (0★→1★ and beyond). Gear is permanent power — Gear Factory is on the long-term critical path.',
    upgradeWhen: 'Push to Level 20 as a medium-term goal. Star promotions require it and gear is permanent power.',
  },
  {
    name: 'Drone Factory',
    priority: 'high',
    playstyle: ['all'],
    hqGate: 20,
    notes: 'Drone Factory level gates drone upgrade level cap. Drone upgrades affect all squads simultaneously — one of the best power-per-resource investments at mid/late game.',
    upgradeWhen: 'Keep at max for your HQ level once unlocked. Drone upgrades are permanent squad-wide power.',
  },
  {
    name: 'Resource Buildings (Farm, Oil Rig, Iron Mine, etc.)',
    priority: 'medium',
    playstyle: ['developer', 'scout'],
    notes: 'Resource buildings generate passive income. Diminishing returns at high levels — the cost-to-output ratio gets worse. F2P and developers should keep these upgraded; fighters and whales often deprioritize in favor of combat buildings.',
    upgradeWhen: 'F2P/Developer: upgrade when resources allow, not at the expense of Barracks or War Factory. Fighter/Whale: low priority — packs and rallies outpace farm income.',
  },
  {
    name: 'Watchtower',
    priority: 'medium',
    playstyle: ['all'],
    notes: 'Watchtower level increases scouting range and intel quality on incoming attacks. Higher level = more warning time before an attack lands.',
    upgradeWhen: 'Upgrade opportunistically. Not on the critical path but useful for fighters who want attack early warning.',
  },
  {
    name: 'Decoration Buildings',
    priority: 'low',
    playstyle: ['all'],
    notes: 'Decoration buildings provide Attack/Defense/HP stat bonuses. 7 levels each. Max (L7): +6,500 Atk/Def, +122K HP, +5% Crit Dmg. Cost pattern escalates heavily — 150 → 72,900 deco points per level. Do not prioritize over core combat or development buildings.',
    upgradeWhen: 'Upgrade decorations after core buildings are at HQ cap. They are a power sink for players with excess deco points, not a primary upgrade path.',
  },
];

// ── Building Priority by HQ Stage ──────────────────────────────────

export const BUILDING_PRIORITY_BY_STAGE = {
  early: {
    label: 'Early Game (HQ 1–20)',
    order: ['HQ', 'Barracks', 'Research Institute', 'War Factory', 'Hero Hall', 'Alliance Center'],
    rule: 'Follow the HQ upgrade path. Every building has a level requirement before HQ can advance — check what is blocking your next HQ upgrade and do that first. Keep Barracks and Research Institute at max for your HQ level at all times.',
  },
  mid: {
    label: 'Mid Game (HQ 20–30, T10)',
    order: ['HQ', 'Barracks (T10 path)', 'War Factory', 'Hero Hall', 'Gear Factory (→ L20)', 'Hospital', 'Drone Factory'],
    rule: 'T10 unlock is the primary goal. Check exact Barracks and Research Institute level requirements for T10 on your server day. Gear Factory to L20 is a medium-term milestone — star promotions unlock there. Keep Hospital capacity above your max march size.',
  },
  late: {
    label: 'Late Game (HQ 31–35, T11)',
    order: ['HQ (31→35)', 'War Factory', 'Barracks (T11 path)', 'Drone Factory', 'Gear Factory (star promotions)', 'Hero Hall'],
    rule: 'T11 requires HQ 31+. At HQ 35 all buildings are at max — the upgrade game shifts to research, armament, and drone levels. Hospital capacity should comfortably exceed your march size by this stage.',
  },
};

// ── Building Upgrade Rules (general) ───────────────────────────────

export const BUILDING_UPGRADE_RULES = [
  'Always check what is blocking your next HQ upgrade first. Upgrade those buildings before anything else.',
  'Barracks and Research Institute are always on the critical path — never let them fall below HQ cap.',
  'Hospital capacity should always exceed your total march size. If it does not, you are permanently losing troops on every loss.',
  'Gear Factory to Level 20 is a milestone, not an afterthought — star promotions are permanent power.',
  'Resource buildings have diminishing returns at high levels. F2P players should keep them upgraded; heavy spenders can deprioritize.',
  'Alliance Center is free construction speed. Higher level = more alliance helps per day. Keep it near max.',
  'Drone Factory upgrades affect all squads simultaneously — high value per upgrade, keep at HQ cap.',
  'Do not upgrade decoration buildings before core combat and development buildings are at HQ cap.',
];

// ── F2P vs Spender Priority Difference ─────────────────────────────

export const BUILDING_SPEND_NOTES = {
  f2p: 'F2P players: resource buildings matter more — passive income fills the gap where packs cannot. Keep Farm, Iron Mine, and Oil Rig upgraded. Every speedup saved on a resource purchase is a win.',
  budget: 'Budget spenders: same as F2P but you can afford to slightly deprioritize resource buildings in favor of combat upgrades once you have reliable pack access for resources.',
  moderate: 'Moderate spenders: focus on combat building critical path. Resource buildings are secondary — your pack budget covers resource gaps.',
  investor: 'Investor/Whale: resource buildings are noise. Focus 100% on combat critical path — War Factory, Barracks, Hero Hall, Drone Factory. Pack calendar covers all resource needs.',
};

// ── Summary for Buddy system prompt ────────────────────────────────

export function getBuildingPrioritySummary(): string {
  const critical = BUILDING_PRIORITIES.filter(b => b.priority === 'critical');
  const high = BUILDING_PRIORITIES.filter(b => b.priority === 'high');

  return `## Building Upgrade Priority

### Critical Path Buildings (always max for your HQ level)
${critical.map(b => `- **${b.name}:** ${b.upgradeWhen}`).join('\n')}

### High Priority Buildings
${high.map(b => `- **${b.name}:** ${b.upgradeWhen}`).join('\n')}

### Priority by Stage
- **Early (HQ 1–20):** ${BUILDING_PRIORITY_BY_STAGE.early.rule}
- **Mid (HQ 20–30, T10):** ${BUILDING_PRIORITY_BY_STAGE.mid.rule}
- **Late (HQ 31–35, T11):** ${BUILDING_PRIORITY_BY_STAGE.late.rule}

### General Rules
${BUILDING_UPGRADE_RULES.map(r => `- ${r}`).join('\n')}

### Spend Style Notes
- **F2P:** ${BUILDING_SPEND_NOTES.f2p}
- **Investor/Whale:** ${BUILDING_SPEND_NOTES.investor}`;
}