// src/lib/lwtDesertStormPlanData.ts
// Desert Storm War Room — role definitions, building data, strategy notes

export interface DSRole {
  id: string;
  label: string;
  color: string;
  badgeBg: string;
  hint: string;
  stageAdvice: string;
  fullWidth: boolean;
  placeholder: string;
}

export const DS_ROLES: DSRole[] = [
  {
    id: 'roamers',
    label: 'Roamers',
    color: '#E24B4A',
    badgeBg: 'rgba(226,75,74,0.12)',
    hint: 'Your 4–6 strongest fighters. Help east/west flanks at Stage 1, then flood the center when Stage 2 opens. Primary job: eliminate enemies.',
    stageAdvice: 'Stage 1: Support east/west flanks. Stage 2 (10 min): Converge on Nuclear Silo. Go where the fight is.',
    fullWidth: true,
    placeholder: 'Your top fighters — they go where needed',
  },
  {
    id: 'west',
    label: 'West flank',
    color: '#378ADD',
    badgeBg: 'rgba(55,138,221,0.12)',
    hint: '3 players. Rush west at the horn.',
    stageAdvice: 'Stage 1: Take west Oil Refinery immediately, then lock Info Center (+10% points on every building we hold).',
    fullWidth: false,
    placeholder: '~3 players',
  },
  {
    id: 'east',
    label: 'East flank',
    color: '#639922',
    badgeBg: 'rgba(99,153,34,0.12)',
    hint: '3 players. Rush east at the horn.',
    stageAdvice: 'Stage 1: Take east Oil Refinery, hold Science Hub (cuts enemy teleport cooldown from 2 min to 1 min).',
    fullWidth: false,
    placeholder: '~3 players',
  },
  {
    id: 'hospitals',
    label: 'Hospital guards',
    color: '#EF9F27',
    badgeBg: 'rgba(239,159,39,0.12)',
    hint: 'Hold all 4 Field Hospitals. Without healing, we lose the war of attrition. Do NOT roam. Add E or W after each name to assign east/west hospitals (e.g. PlayerName-E).',
    stageAdvice: 'Hold all Field Hospitals the entire battle. Each one heals 15 troops every 10 seconds. Lose these and we can\'t fight back.',
    fullWidth: true,
    placeholder: 'Dependable players who will hold position',
  },
  {
    id: 'silo',
    label: 'Nuclear Silo',
    color: '#7F77DD',
    badgeBg: 'rgba(127,119,221,0.12)',
    hint: 'Stage 2 only — do NOT move early. Rush Silo the moment it opens at 10 min.',
    stageAdvice: 'Stage 2 (10 min mark): Rush Nuclear Silo immediately when it unlocks. Highest point yield in the game. Roamers join here.',
    fullWidth: true,
    placeholder: 'Silo assault team — roamers flood in at Stage 2',
  },
];

export interface DSBuilding {
  name: string;
  bfPoints: number;
  indPoints: number;
  availableAt: string;
  boost?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export const DS_BUILDINGS: DSBuilding[] = [
  {
    name: 'Nuclear Silo',
    bfPoints: 80,
    indPoints: 40,
    availableAt: 'Stage 2 (10 min)',
    priority: 'critical',
  },
  {
    name: 'Oil Refinery (x2)',
    bfPoints: 50,
    indPoints: 25,
    availableAt: 'Stage 1 (start)',
    priority: 'high',
  },
  {
    name: 'Field Hospital (x4)',
    bfPoints: 30,
    indPoints: 15,
    availableAt: 'Stage 1 (start)',
    boost: 'Heals 15 troops / 10 sec per hospital',
    priority: 'critical',
  },
  {
    name: 'Info Center',
    bfPoints: 10,
    indPoints: 5,
    availableAt: 'Stage 1 (start)',
    boost: '+10% points from all held buildings',
    priority: 'high',
  },
  {
    name: 'Science Hub',
    bfPoints: 10,
    indPoints: 5,
    availableAt: 'Stage 1 (start)',
    boost: 'Cuts teleport cooldown from 2 min to 1 min',
    priority: 'medium',
  },
  {
    name: 'Arsenal',
    bfPoints: 10,
    indPoints: 5,
    availableAt: 'Stage 2 (10 min)',
    boost: '+15% Hero ATK / DEF / HP',
    priority: 'medium',
  },
  {
    name: 'Mercenary Factory',
    bfPoints: 10,
    indPoints: 5,
    availableAt: 'Stage 2 (10 min)',
    boost: '-15% enemy Hero ATK / DEF / HP',
    priority: 'medium',
  },
  {
    name: 'Oil Wells',
    bfPoints: 5,
    indPoints: 2,
    availableAt: 'Stage 3 (13 min)',
    boost: 'Last resort for individual points',
    priority: 'low',
  },
];

export const DS_STAGES = [
  {
    stage: 'Prep (0–5 min)',
    description: 'Enter battlefield. Set squads. Do NOT engage. Confirm roles.',
  },
  {
    stage: 'Stage 1 (0–10 min)',
    description: 'Flanks rush Oil Refineries. Secure Info Center. Hospital guards hold. Roamers support.',
  },
  {
    stage: 'Stage 2 (10 min+)',
    description: 'Nuclear Silo unlocks. Silo team + roamers rush immediately. Hold everything. Keep healing.',
  },
];

export const DS_STRATEGY_NOTES = {
  hospitals: 'Field Hospitals are the most strategically important buildings in Desert Storm. Holding all 4 means 60 troops healed every 10 seconds across the battle. Lose them and you cannot sustain the fight.',
  infoCenter: 'Info Center gives +10% points on every building you hold. Capture it early — it compounds across the entire 30-minute battle.',
  roamers: 'Roamers are your swing players. They assist flanks at Stage 1, then pivot to the Silo at Stage 2. They should be your highest-power fighters.',
  pointBoxes: 'When buildings change ownership, Point Supply Boxes scatter nearby. Roamers should collect these — they convert plundered points directly into alliance score.',
  taskForce: 'Task Force A and B are time slots only — not strength tiers. Each can have up to 20 starting players and 10 substitutes.',
};

export function buildDSPlanSummary(
  allianceName: string,
  taskForce: string,
  roles: Record<string, string[]>,
  commanderNote?: string
): string {
  const lines: string[] = [
    `${allianceName} — Desert Storm War Room`,
    `Task Force ${taskForce}`,
    '',
  ];

  DS_ROLES.forEach(role => {
    const names = roles[role.id] ?? [];
    const nameStr = names.length ? names.join(', ') : 'Unassigned';
    lines.push(`[${role.label}] ${nameStr}`);
    lines.push(`  → ${role.stageAdvice}`);
    lines.push('');
  });

  if (commanderNote) {
    lines.push(`Commander note: ${commanderNote}`);
    lines.push('');
  }

  lines.push('LastWarSurvivalBuddy.com — AI coaching for Last War: Survival');

  return lines.join('\n');
}