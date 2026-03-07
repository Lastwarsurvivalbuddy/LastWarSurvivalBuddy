/**
 * resourceNotes.ts
 * Last War: Survival — Resource Context Notes
 *
 * Purpose: Captures important late-game resource facts that don't belong
 * to a single system module (gear, buildings, VIP, etc.) but are critical
 * for Buddy to give accurate strategic advice.
 *
 * Add to this file as new resource-related context is confirmed.
 */

// ============================================================
// OIL
// ============================================================

export const OIL_NOTES = {
  summary: 'Oil is a critical late-game resource in Last War: Survival.',
  keyFacts: [
    'Oil becomes the primary bottleneck resource at HQ 25+.',
    'Oil is required for major building upgrades on the path to HQ 31-35.',
    'Oil plays a significant role in T11 (Tier 11) troop progression.',
    'Prioritize Oil Refinery upgrades early to stockpile for late-game pushes.',
    'Oil production should be planned well in advance of HQ 30+ upgrade windows.',
  ],
  // ⚠️ Exact per-upgrade oil costs for HQ 31-35 and T11 are PENDING confirmation.
  // Source: dracgon.tech or guardian-outfitter.com — to be scraped.
  pendingData: [
    'Exact oil cost per HQ level (31-35)',
    'Oil requirements for each T11 troop type',
    'Oil Refinery production rates by level',
  ],
} as const;

// ============================================================
// BUDDY SUMMARY
// ============================================================

export function getResourceNotesSummary(): string {
  return `
RESOURCE NOTES:

Oil:
${OIL_NOTES.keyFacts.map(f => `- ${f}`).join('\n')}
⚠️ Exact oil costs for HQ 31-35 and T11 are not yet confirmed — advise players to stockpile aggressively and check back.
`.trim();
}