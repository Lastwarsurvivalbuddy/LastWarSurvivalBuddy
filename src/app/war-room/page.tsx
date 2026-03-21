'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DS_ROLES, DS_STAGES, type DSRole } from '@/lib/lwtDesertStormPlanData';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface RoleAssignments {
  [roleId: string]: string;
}

type WarRoomTab = 'ds' | 'wz';

// ─── WARZONE DUEL DATA ───────────────────────────────────────────────────────

const WZ_TIPS = [
  'Bare your walls before entering the contaminated zone',
  'Deploy Tactical Cards & Banners before you port',
  'Bigs port in first — fold in immediately behind them',
  'Constant sending to Capitol — never stop the pressure',
  'Ash bases with a single blue hero to clear ruins fast',
  'Cannons auto-fire on the enemy Capitol — hold them at all costs',
  'Shields CANNOT be activated inside the contaminated zone',
  'Out of troops? Take up space. Scout. You\'re still in the fight.',
  'Keep comms short, clear, and actionable',
  'Non-stop movement — never let the enemy settle',
];

const WZ_ORDERS_PLACEHOLDER = `-10 min: Leaders drop anchor markers
-6 min: Bigs port to position
-Fold in immediately behind
-If enemy moves early: ALL IN — fill fast
Hold until cap shows 100%`;

// ─── SHARED SAVE UTILITY ─────────────────────────────────────────────────────

async function saveCardAsImage(
  element: HTMLElement,
  filename: string,
  bgColor = '#ffffff',
  fixedWidth = 600
) {
  const html2canvas = (await import('html2canvas')).default;

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${fixedWidth}px;
    overflow: visible;
    font-family: system-ui, -apple-system, sans-serif;
    background: ${bgColor};
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    z-index: -1;
  `;
  document.body.appendChild(clone);
  await new Promise(resolve => setTimeout(resolve, 100));
  const captureHeight = clone.scrollHeight;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canvas = await html2canvas(clone, {
    useCORS: true,
    logging: false,
    width: fixedWidth,
    height: captureHeight,
  } as any);

  document.body.removeChild(clone);
  const url = canvas.toDataURL('image/png');

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0a;z-index:9999;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;align-items:center;padding:20px;';
    const msg = document.createElement('p');
    msg.innerText = 'Press and hold image → Save to Photos';
    msg.style.cssText = 'color:#e8a020;font-size:15px;font-family:sans-serif;margin-top:16px;margin-bottom:16px;text-align:center;flex-shrink:0;';
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'width:100%;border-radius:12px;display:block;';
    const btn = document.createElement('button');
    btn.innerText = '✕ Close';
    btn.style.cssText = 'margin-top:16px;margin-bottom:32px;background:#333;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;flex-shrink:0;';
    btn.onclick = () => document.body.removeChild(overlay);
    overlay.appendChild(msg);
    overlay.appendChild(img);
    overlay.appendChild(btn);
    document.body.appendChild(overlay);
  } else {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function WarRoomPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<WarRoomTab>('ds');

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <div className="text-sm font-medium text-white">War Room</div>
            <div className="text-xs text-gray-500">Battle plan generator</div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('ds')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
              activeTab === 'ds'
                ? 'bg-white text-gray-950'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🏜️ Desert Storm
          </button>
          <button
            onClick={() => setActiveTab('wz')}
            className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
              activeTab === 'wz'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            ⚔️ Warzone Duel
          </button>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'ds' ? <DesertStormTool /> : <WarzoneDuelTool />}

    </div>
  );
}

// ─── DESERT STORM TOOL (unchanged logic) ─────────────────────────────────────

function DesertStormTool() {
  const [allianceName, setAllianceName] = useState('');
  const [taskForce, setTaskForce] = useState<'A' | 'B' | 'A & B'>('A');
  const [roles, setRoles] = useState<RoleAssignments>({});
  const [commanderNote, setCommanderNote] = useState('');
  const [planGenerated, setPlanGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const planCardRef = useRef<HTMLDivElement>(null);

  function parseNames(raw: string): string[] {
    return raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  }

  function handleGenerate() {
    setPlanGenerated(true);
    setTimeout(() => {
      planCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleSave() {
    if (!planCardRef.current || saving) return;
    setSaving(true);
    try {
      const safeName = (allianceName || 'Alliance').replace(/[^a-zA-Z0-9]/g, '-');
      await saveCardAsImage(planCardRef.current, `DS-BattlePlan-${safeName}.png`, '#ffffff', 600);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const displayName = allianceName.trim() || 'My Alliance';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Intro */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          Assign roles for your Desert Storm battle. Generate a shareable plan card — save it and post straight to alliance chat.
        </p>
      </div>

      {/* Alliance name */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Alliance name</label>
        <input
          type="text"
          value={allianceName}
          onChange={e => setAllianceName(e.target.value)}
          placeholder="e.g. Death Squad"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* Task Force */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Task force</label>
        <div className="flex gap-2">
          {(['A', 'B', 'A & B'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTaskForce(tf)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                taskForce === tf
                  ? 'bg-white text-gray-950 border-white font-medium'
                  : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'
              }`}
            >
              {tf === 'A & B' ? 'Both' : `Task Force ${tf}`}
            </button>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Assign roles — comma or line separated</label>
        <div className="grid grid-cols-2 gap-3">
          {DS_ROLES.map((role: DSRole) => (
            <div
              key={role.id}
              className={`bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2 ${role.fullWidth ? 'col-span-2' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }} />
                <span className="text-xs font-medium text-gray-300">{role.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{role.hint}</p>
              <textarea
                rows={2}
                value={roles[role.id] ?? ''}
                onChange={e => setRoles(prev => ({ ...prev, [role.id]: e.target.value }))}
                placeholder={role.placeholder}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none font-sans"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Commander note */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Commander note <span className="text-gray-600">(optional)</span></label>
        <input
          type="text"
          value={commanderNote}
          onChange={e => setCommanderNote(e.target.value)}
          placeholder="e.g. Nobody breaks hospital early. Roamers call the Silo push."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors"
      >
        Generate battle plan
      </button>

      {/* Output card */}
      {planGenerated && (
        <div className="space-y-3">
          <div
            ref={planCardRef}
            data-capture="plan-card"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {/* Card header */}
            <div style={{ background: '#030712', padding: '16px 20px', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '15px', lineHeight: '1.3' }}>
                    {displayName}
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '11px', marginTop: '3px' }}>
                    Desert Storm War Room · Task Force {taskForce}
                  </div>
                </div>
                <svg width="48" height="48" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                  <circle cx="24" cy="24" r="22" fill="none" stroke="#374151" strokeWidth="1"/>
                  <circle cx="24" cy="24" r="2.5" fill="#6B7280"/>
                  <polygon points="24,5 21.5,24 24,20 26.5,24" fill="#E24B4A"/>
                  <polygon points="24,43 21.5,24 24,28 26.5,24" fill="#4B5563"/>
                  <text x="24" y="4" textAnchor="middle" fontSize="8" fontWeight="600" fill="#E24B4A" fontFamily="system-ui">N</text>
                  <text x="24" y="47" textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="system-ui">S</text>
                  <text x="45" y="27" textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="system-ui">E</text>
                  <text x="3" y="27" textAnchor="middle" fontSize="8" fill="#9CA3AF" fontFamily="system-ui">W</text>
                </svg>
              </div>
            </div>

            {/* Stage timeline */}
            <div style={{ background: '#f3f4f6', padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {DS_STAGES.map((s, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                  {s.stage}
                </div>
              ))}
            </div>

            {/* Role rows */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {DS_ROLES.map((role: DSRole) => {
                const names = parseNames(roles[role.id] ?? '');
                return (
                  <div key={role.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      flexShrink: 0,
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      marginTop: '1px',
                      backgroundColor: role.badgeBg,
                      color: role.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {role.label}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>{role.stageAdvice}</div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                        {names.length
                          ? `→ ${names.join(', ')}`
                          : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Unassigned</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commander note */}
            {commanderNote.trim() && (
              <div style={{ margin: '0 20px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px' }}>
                <p style={{ fontSize: '11px', color: '#92400e', fontStyle: 'italic', margin: 0 }}>
                  📋 {commanderNote}
                </p>
              </div>
            )}

            {/* Footer */}
            <div style={{ background: '#030712', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0 0 16px 16px' }}>
              <div>
                <div style={{ color: '#ffffff', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>
                  LastWarSurvivalBuddy.com
                </div>
                <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '1px' }}>
                  AI coaching for Last War: Survival
                </div>
              </div>
              <div style={{ color: '#4b5563', fontSize: '10px', textAlign: 'right' }}>
                Desert Storm<br />Battle Plan
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-white text-gray-950 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : '⬇ Save plan as image'}
          </button>

          <button
            onClick={() => { setPlanGenerated(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full py-2.5 bg-transparent border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            Edit plan
          </button>
        </div>
      )}
    </div>
  );
}

// ─── WARZONE DUEL TOOL ────────────────────────────────────────────────────────

function WarzoneDuelTool() {
  const [attacker, setAttacker] = useState('');
  const [defender, setDefender] = useState('');
  const [assignments, setAssignments] = useState({
    north: '', west: '', capitol: '', east: '', south: '',
  });
  const [orders, setOrders] = useState('');
  const [planGenerated, setPlanGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleGenerate() {
    setPlanGenerated(true);
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  async function handleSave() {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const filename = `WZ-WarPlan-${attacker || 'server'}-vs-${defender || 'server'}.png`;
      await saveCardAsImage(cardRef.current, filename, '#0a0a14', 600);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const BUILDINGS = [
    { id: 'north', label: 'N CANNON', icon: '🔫' },
    { id: 'west',  label: 'W CANNON', icon: '🔫' },
    { id: 'capitol', label: 'CAPITOL', icon: '🏛️', isCapitol: true },
    { id: 'east',  label: 'E CANNON', icon: '🔫' },
    { id: 'south', label: 'S CANNON', icon: '🔫' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Intro */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          Assign alliances to each building, write your commander's orders, and generate a shareable war plan — post it to server email, Discord, or alliance chat.
        </p>
      </div>

      {/* VS row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-blue-400 font-semibold tracking-widest">ATTACKER</label>
          <input
            type="text"
            value={attacker}
            onChange={e => setAttacker(e.target.value)}
            placeholder="#1032"
            className="w-full bg-blue-950/30 border border-blue-800/50 rounded-lg px-3 py-2 text-lg font-bold text-blue-300 text-center placeholder-blue-900 focus:outline-none focus:border-blue-500 tracking-widest"
          />
        </div>
        <div className="text-2xl font-bold text-red-500 pb-2 flex-shrink-0" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
          VS
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-red-400 font-semibold tracking-widest text-right block">DEFENDER</label>
          <input
            type="text"
            value={defender}
            onChange={e => setDefender(e.target.value)}
            placeholder="#1000"
            className="w-full bg-red-950/30 border border-red-800/50 rounded-lg px-3 py-2 text-lg font-bold text-red-400 text-center placeholder-red-900 focus:outline-none focus:border-red-500 tracking-widest"
          />
        </div>
      </div>

      {/* Battle Map */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Battle map — assign alliances to each building</label>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">

          {/* North */}
          <div className="flex justify-center">
            <BuildingInput id="north" label="N CANNON" icon="🔫"
              value={assignments.north}
              onChange={v => setAssignments(p => ({ ...p, north: v }))}
              placeholder="e.g. [DOG] — Attack"
            />
          </div>

          {/* Middle row */}
          <div className="flex items-center gap-3">
            <BuildingInput id="west" label="W CANNON" icon="🔫"
              value={assignments.west}
              onChange={v => setAssignments(p => ({ ...p, west: v }))}
              placeholder="e.g. [PMkr] — Hold"
            />
            {/* Compass */}
            <div className="flex-shrink-0">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="24" fill="none" stroke="#374151" strokeWidth="1"/>
                <line x1="26" y1="2" x2="26" y2="50" stroke="#374151" strokeWidth="1" strokeDasharray="3,3"/>
                <line x1="2" y1="26" x2="50" y2="26" stroke="#374151" strokeWidth="1" strokeDasharray="3,3"/>
                <circle cx="26" cy="26" r="3" fill="#1f2937"/>
                <polygon points="26,6 23.5,26 26,21 28.5,26" fill="#e63946"/>
                <polygon points="26,46 23.5,26 26,31 28.5,26" fill="#4b5563"/>
                <text x="26" y="5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#e63946" fontFamily="system-ui">N</text>
                <text x="26" y="51" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">S</text>
                <text x="49" y="29" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">E</text>
                <text x="3" y="29" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">W</text>
              </svg>
            </div>
            <BuildingInput id="east" label="E CANNON" icon="🔫"
              value={assignments.east}
              onChange={v => setAssignments(p => ({ ...p, east: v }))}
              placeholder="e.g. [TW] — Attack"
            />
          </div>

          {/* South */}
          <div className="flex justify-center">
            <BuildingInput id="south" label="S CANNON" icon="🔫"
              value={assignments.south}
              onChange={v => setAssignments(p => ({ ...p, south: v }))}
              placeholder="e.g. [BTU] — Hold"
            />
          </div>

          {/* Capitol */}
          <div className="border-t border-gray-800 pt-3">
            <BuildingInput id="capitol" label="🏛️ CAPITOL — PRIMARY OBJECTIVE" icon=""
              value={assignments.capitol}
              onChange={v => setAssignments(p => ({ ...p, capitol: v }))}
              placeholder="e.g. Top 3 alliances — main rally here"
              isCapitol
            />
          </div>
        </div>
      </div>

      {/* Commander's Orders */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Commander's orders</label>
        <textarea
          value={orders}
          onChange={e => setOrders(e.target.value)}
          placeholder={WZ_ORDERS_PLACEHOLDER}
          rows={6}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none leading-relaxed"
        />
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors"
      >
        Generate war plan
      </button>

      {/* Output card */}
      {planGenerated && (
        <div className="space-y-3">
          <div
            ref={cardRef}
            style={{
              background: '#0a0a14',
              borderRadius: '16px',
              border: '1px solid #e63946',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              overflow: 'hidden',
            }}
          >
            {/* Card header */}
            <div style={{ background: '#0f0f1f', padding: '16px 20px', borderBottom: '1px solid #1a1a2e' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#e63946', fontSize: '10px', fontWeight: 700, letterSpacing: '4px', marginBottom: '4px' }}>
                    WARZONE DUEL WAR ROOM
                  </div>
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>
                    #{attacker || '????'} <span style={{ color: '#e63946' }}>VS</span> #{defender || '????'}
                  </div>
                </div>
                <svg width="44" height="44" viewBox="0 0 52 52">
                  <circle cx="26" cy="26" r="24" fill="none" stroke="#374151" strokeWidth="1.5"/>
                  <line x1="26" y1="2" x2="26" y2="50" stroke="#2a2a3a" strokeWidth="1"/>
                  <line x1="2" y1="26" x2="50" y2="26" stroke="#2a2a3a" strokeWidth="1"/>
                  <polygon points="26,6 23.5,26 26,21 28.5,26" fill="#e63946"/>
                  <polygon points="26,46 23.5,26 26,31 28.5,26" fill="#4b5563"/>
                  <text x="26" y="5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#e63946" fontFamily="system-ui">N</text>
                  <text x="26" y="51" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">S</text>
                  <text x="49" y="29" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">E</text>
                  <text x="3" y="29" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="system-ui">W</text>
                </svg>
              </div>
            </div>

            {/* Building assignments */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: '9px', color: '#555', letterSpacing: '4px', fontWeight: 600, marginBottom: '12px' }}>
                BUILDING ASSIGNMENTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'north', label: 'N CANNON', icon: '🔫', color: '#f4a261' },
                  { id: 'west',  label: 'W CANNON', icon: '🔫', color: '#f4a261' },
                  { id: 'east',  label: 'E CANNON', icon: '🔫', color: '#f4a261' },
                  { id: 'south', label: 'S CANNON', icon: '🔫', color: '#f4a261' },
                  { id: 'capitol', label: 'CAPITOL', icon: '🏛️', color: '#e63946' },
                ].map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 700, color: b.color,
                      letterSpacing: '2px', minWidth: '72px', flexShrink: 0,
                    }}>{b.icon} {b.label}</span>
                    <span style={{ fontSize: '12px', color: assignments[b.id as keyof typeof assignments] ? '#e0e0e0' : '#444', fontStyle: assignments[b.id as keyof typeof assignments] ? 'normal' : 'italic' }}>
                      {assignments[b.id as keyof typeof assignments] || 'Unassigned'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Commander's orders */}
            {orders.trim() && (
              <div style={{ margin: '0 20px 16px', background: 'rgba(230,57,70,0.06)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '9px', color: '#e63946', letterSpacing: '3px', fontWeight: 700, marginBottom: '8px' }}>
                  COMMANDER'S ORDERS
                </div>
                <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {orders}
                </div>
              </div>
            )}

            {/* Tips */}
            <div style={{ margin: '0 20px 16px' }}>
              <div style={{ fontSize: '9px', color: '#555', letterSpacing: '4px', fontWeight: 600, marginBottom: '10px' }}>
                COMMANDER'S DOCTRINE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {WZ_TIPS.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '3px', height: '3px', background: '#e63946', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }} />
                    <div style={{ fontSize: '11px', color: '#888', lineHeight: '1.5' }}>{tip}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#060610', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1a1a2e' }}>
              <div style={{ color: '#e63946', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                LastWarSurvivalBuddy.com
              </div>
              <div style={{ color: '#444', fontSize: '10px', textAlign: 'right' }}>
                Warzone Duel<br />War Room
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : '⬇ Save plan as image'}
          </button>

          <button
            onClick={() => { setPlanGenerated(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-full py-2.5 bg-transparent border border-gray-700 text-gray-400 text-sm rounded-xl hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            Edit plan
          </button>
        </div>
      )}

      {/* Tips (always visible below form) */}
      {!planGenerated && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="text-xs text-gray-500 tracking-widest font-semibold">COMMANDER'S DOCTRINE</div>
          {WZ_TIPS.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="w-1 h-1 rounded-full bg-red-600 mt-2 flex-shrink-0" />
              <div className="text-xs text-gray-400 leading-relaxed">{tip}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// ─── BUILDING INPUT COMPONENT ─────────────────────────────────────────────────

function BuildingInput({
  id, label, icon, value, onChange, placeholder, isCapitol = false
}: {
  id: string;
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isCapitol?: boolean;
}) {
  return (
    <div className={`space-y-1 ${isCapitol ? 'w-full' : 'w-36'}`}>
      <div className={`text-xs font-bold tracking-widest ${isCapitol ? 'text-red-500' : 'text-orange-400'}`}>
        {icon} {label}
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 ${
          isCapitol ? 'border-red-900/50 focus:border-red-600' : 'border-gray-700'
        }`}
      />
    </div>
  );
}
