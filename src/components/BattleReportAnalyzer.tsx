'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface IntakeAnswers {
  squad_type: string;
  tactics_cards: string;
  deco_level: string;
  report_type: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
}

interface AnalysisResult {
  outcome: string;
  report_type: string;
  verdict: string;
  power_differential: {
    attacker_power: string;
    defender_power: string;
    gap_pct: string;
    assessment: string;
  };
  troop_breakdown: {
    your_type_damage_pct: string;
    enemy_type_damage_pct: string;
    type_matchup: string;
    counter_explanation: string;
  };
  stat_comparison: {
    atk_status: string;
    hp_status: string;
    def_status: string;
    lethality_status: string;
    stat_gap_cause: string;
  };
  hero_performance: {
    skill_damage_assessment: string;
    ew_gap_suspected: boolean;
    notes: string;
  };
  formation: {
    your_formation_bonus: string;
    formation_issue: boolean;
    notes: string;
  };
  loss_severity: {
    killed_count: string;
    hospital_overflow_risk: boolean;
    permanent_loss_warning: boolean;
  };
  root_causes: string[];
  coaching: string[];
  rematch_verdict: string;
  rematch_reasoning: string;
  invisible_factors_note: string;
}

interface Meta {
  images_analyzed: number;
  reports_used_today: number;
  reports_remaining_today: number | string;
  display_limit: string;
  tier: string;
}

interface HistoryReport {
  id: string;
  created_at: string;
  outcome: string;
  report_type: string;
  verdict: string;
  images_count: number;
}

interface BattleReportAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: string;
  reportsUsedToday: number;
  reportsLimitToday: number;
  onReportComplete?: () => void;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const INTAKE_OPTIONS = {
  squad_type: ['Tank', 'Aircraft', 'Missile', 'Mixed'],
  tactics_cards: ['Yes — PvP cards active', 'Yes — PvE cards active', 'No / Not sure'],
  deco_level: ['None upgraded yet', 'Level 1–2', 'Level 3+', 'Several at Level 5+'],
  report_type: ['PvP — I attacked someone', 'PvP — Someone attacked me', 'PvP — Rally', 'PvE — Zombie / Monster'],
};

const OUTCOME_COLOR: Record<string, string> = {
  Win: 'text-green-400',
  Loss: 'text-red-400',
  'Pyrrhic Win': 'text-yellow-400',
};

const OUTCOME_CHIP: Record<string, string> = {
  Win: 'bg-green-500/20 border-green-500/40 text-green-400',
  Loss: 'bg-red-500/20 border-red-500/40 text-red-400',
  'Pyrrhic Win': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
};

const MATCHUP_COLOR: Record<string, string> = {
  Favored: 'text-green-400',
  Neutral: 'text-yellow-400',
  Countered: 'text-red-400',
  Unknown: 'text-gray-400',
};

const STAT_COLOR: Record<string, string> = {
  Advantage: 'text-green-400',
  Equal: 'text-yellow-400',
  Disadvantage: 'text-red-400',
  'Not visible': 'text-gray-500',
};

const REMATCH_COLOR: Record<string, string> = {
  'Yes — conditions met': 'text-green-400',
  'Not yet — see coaching': 'text-yellow-400',
  'No — power gap too large': 'text-red-400',
  'N/A — you won': 'text-green-400',
};

// ─────────────────────────────────────────────────────────────
// HELPER — file to base64
// ─────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<{ base64: string; mediaType: ImageFile['mediaType'] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      const mediaType = file.type as ImageFile['mediaType'];
      resolve({ base64, mediaType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────
// HELPER — format date
// ─────────────────────────────────────────────────────────────

function formatReportDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffDays < 2) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getReportTypeShort(reportType: string): string {
  if (reportType.toLowerCase().includes('pve') || reportType.toLowerCase().includes('zombie')) return 'PvE';
  if (reportType.toLowerCase().includes('rally')) return 'Rally';
  return 'PvP';
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function BattleReportAnalyzer({
  isOpen,
  onClose,
  userTier,
  reportsUsedToday,
  reportsLimitToday,
  onReportComplete,
}: BattleReportAnalyzerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');
  const [step, setStep] = useState<'upload' | 'intake' | 'analyzing' | 'result'>('upload');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [intake, setIntake] = useState<IntakeAnswers>({
    squad_type: '',
    tactics_cards: '',
    deco_level: '',
    report_type: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  // ── History state ─────────────────────────────────────────
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string>('');
  const [historyFetched, setHistoryFetched] = useState(false);

  // ── Gate check ────────────────────────────────────────────
  const isFree = userTier === 'free';
  const isFounding = userTier === 'founding';
  const isAtLimit = !isFounding && reportsUsedToday >= reportsLimitToday;
  const isLocked = isFree || isAtLimit;

  // ── Fetch history ─────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    if (historyFetched) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');
      const res = await fetch('/api/battle-report', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      setHistory(data.reports ?? []);
      setHistoryFetched(true);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  }, [historyFetched]);

  // Re-fetch history after a new analysis completes
  const handleReportComplete = useCallback(() => {
    setHistoryFetched(false); // invalidate cache so next history view refetches
    onReportComplete?.();
  }, [onReportComplete]);

  // Fetch history when tab switches to history
  useEffect(() => {
    if (activeTab === 'history' && !historyFetched) {
      fetchHistory();
    }
  }, [activeTab, historyFetched, fetchHistory]);

  // ── File handling ─────────────────────────────────────────
  const addFiles = useCallback(async (files: File[]) => {
    const remaining = 6 - images.length;
    const toAdd = files.slice(0, remaining);
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const valid = toAdd.filter(f => imageTypes.includes(f.type));

    const newImages: ImageFile[] = await Promise.all(
      valid.map(async (file) => {
        const preview = URL.createObjectURL(file);
        const { base64, mediaType } = await fileToBase64(file);
        return {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
          base64,
          mediaType,
        };
      })
    );
    setImages(prev => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // ── Drag and drop ─────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // ── Intake ────────────────────────────────────────────────
  const intakeComplete = Object.values(intake).every(v => v !== '');

  // ── Submit ────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!intakeComplete || images.length === 0) return;
    setAnalyzing(true);
    setStep('analyzing');
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const payload = {
        images: images.map(img => ({
          base64: img.base64,
          mediaType: img.mediaType,
        })),
        intake,
      };

      const res = await fetch('/api/battle-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'upgrade_required') {
          router.push('/upgrade');
          return;
        }
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data.analysis as AnalysisResult);
      setMeta(data.meta as Meta);
      setStep('result');
      handleReportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setStep('intake');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setStep('upload');
    setImages([]);
    setIntake({ squad_type: '', tactics_cards: '', deco_level: '', report_type: '' });
    setResult(null);
    setMeta(null);
    setError('');
  };

  // ── Ask Buddy bridge ──────────────────────────────────────
  const handleAskBuddy = () => {
    if (!result) return;
    const summary = `I just ran a Battle Report Analysis. Verdict: ${result.verdict}. Outcome: ${result.outcome}. Root causes: ${result.root_causes.join('; ')}. Can you give me more detail on how to fix this?`;
    sessionStorage.setItem('buddy_prefill', summary);
    router.push('/buddy');
  };

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────
  // LOCKED STATE (free tier or at limit)
  // ─────────────────────────────────────────────────────────
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">⚔️</div>
          <div className="inline-block bg-yellow-500/20 border border-yellow-500/50 rounded px-3 py-1 text-yellow-400 text-xs font-bold tracking-wider mb-4">
            {isFree ? 'PRO FEATURE' : 'DAILY LIMIT REACHED'}
          </div>
          <h2 className="text-xl font-bold text-white mb-3">Battle Report Analyzer</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {isFree
              ? 'Upload your battle report screenshots. Get an expert breakdown of exactly why you won or lost — type matchup, morale cascade, decoration gap, EW analysis, and a rematch verdict.'
              : `You've used all ${reportsLimitToday} analyses today. Resets at midnight UTC.`
            }
          </p>
          {isFree ? (
            <button
              onClick={() => router.push('/upgrade')}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors"
            >
              Unlock with Pro →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Come Back Tomorrow
            </button>
          )}
          <button onClick={onClose} className="mt-3 text-gray-500 text-sm hover:text-gray-300 transition-colors block w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN MODAL
  // ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-lg font-bold text-white">Battle Report Analyzer</h2>
              <p className="text-xs text-gray-400">
                {isFounding
                  ? 'Unlimited · Founding Member'
                  : `${reportsLimitToday - reportsUsedToday} of ${reportsLimitToday} remaining today`
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl">✕</button>
        </div>

        {/* ── Tab Bar — only shown when not analyzing ── */}
        {step !== 'analyzing' && (
          <div className="flex border-b border-gray-700 px-6">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`py-3 px-1 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'analyze'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Analyze
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-1 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              History
              {history.length > 0 && (
                <span className="ml-2 text-xs bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && step !== 'analyzing' && (
          <div className="p-6">
            {historyLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {historyError && (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm mb-3">{historyError}</p>
                <button
                  onClick={() => { setHistoryFetched(false); fetchHistory(); }}
                  className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!historyLoading && !historyError && history.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⚔️</div>
                <p className="text-gray-400 text-sm">No battle reports yet.</p>
                <p className="text-gray-600 text-xs mt-1">Run your first analysis to see it here.</p>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className="mt-4 text-xs text-yellow-400 hover:text-yellow-300 underline"
                >
                  Analyze a report →
                </button>
              </div>
            )}

            {!historyLoading && history.length > 0 && (
              <div className="space-y-2">
                {history.map((report) => {
                  const outcomeChip = OUTCOME_CHIP[report.outcome] ?? 'bg-gray-700 border-gray-600 text-gray-400';
                  const typeShort = getReportTypeShort(report.report_type);
                  return (
                    <div
                      key={report.id}
                      className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3"
                    >
                      {/* Outcome chip */}
                      <span className={`shrink-0 text-xs font-bold border rounded px-2 py-0.5 ${outcomeChip}`}>
                        {report.outcome}
                      </span>

                      {/* Type chip */}
                      <span className="shrink-0 text-xs font-medium bg-gray-700 text-gray-400 border border-gray-600 rounded px-2 py-0.5">
                        {typeShort}
                      </span>

                      {/* Verdict preview */}
                      <p className="flex-1 text-gray-300 text-sm truncate min-w-0">
                        {report.verdict}
                      </p>

                      {/* Date + screenshot count */}
                      <div className="shrink-0 text-right">
                        <div className="text-gray-500 text-xs">{formatReportDate(report.created_at)}</div>
                        <div className="text-gray-600 text-xs">{report.images_count} screens</div>
                      </div>
                    </div>
                  );
                })}

                <p className="text-center text-gray-600 text-xs pt-2">
                  Showing last {history.length} report{history.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYZE TAB CONTENT ── */}
        {(activeTab === 'analyze' || step === 'analyzing') && (
          <>
            {/* ── Step: UPLOAD ── */}
            {step === 'upload' && (
              <div className="p-6 space-y-5">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Upload screenshots of your battle report. More screens = better analysis.
                  Recommended: all 6 tabs in order.
                </p>

                {/* Drop zone */}
                <div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-yellow-400 bg-yellow-400/5'
                      : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-3xl mb-3">📸</div>
                  <p className="text-gray-300 font-medium text-sm">Drop screenshots here or tap to upload</p>
                  <p className="text-gray-500 text-xs mt-1">Up to 6 screenshots · JPG, PNG, WebP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) addFiles(Array.from(e.target.files));
                    }}
                  />
                </div>

                {/* Image previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.preview}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => removeImage(img.id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors text-2xl"
                      >
                        +
                      </button>
                    )}
                  </div>
                )}

                {/* Tip */}
                <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-300 leading-relaxed">
                  <span className="font-semibold">Pro tip:</span> For the most accurate analysis, upload in screen order:
                  Outcome → Troop Breakdown → Hero Skills → Stat Comparison → Gear → Power Up.
                  The Troop Breakdown screen is the most important.
                </div>

                <button
                  onClick={() => setStep('intake')}
                  disabled={images.length === 0}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-xl transition-colors"
                >
                  {images.length === 0 ? 'Upload at least 1 screenshot' : `Continue with ${images.length} screenshot${images.length > 1 ? 's' : ''} →`}
                </button>
              </div>
            )}

            {/* ── Step: INTAKE ── */}
            {step === 'intake' && (
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-gray-300 text-sm mb-1 font-medium">Quick setup <span className="text-gray-500">(30 seconds)</span></p>
                  <p className="text-gray-500 text-xs">These questions capture details that don&apos;t show in screenshots.</p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Q1 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">What&apos;s your main squad&apos;s troop type?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTAKE_OPTIONS.squad_type.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setIntake(prev => ({ ...prev, squad_type: opt }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${
                          intake.squad_type === opt
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">Did you have Tactics Cards active?</label>
                  <div className="space-y-2">
                    {INTAKE_OPTIONS.tactics_cards.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setIntake(prev => ({ ...prev, tactics_cards: opt }))}
                        className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium border text-left transition-colors ${
                          intake.tactics_cards === opt
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">Roughly what level are your best decorations?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTAKE_OPTIONS.deco_level.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setIntake(prev => ({ ...prev, deco_level: opt }))}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors text-left ${
                          intake.deco_level === opt
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q4 */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300 font-medium">What type of report is this?</label>
                  <div className="space-y-2">
                    {INTAKE_OPTIONS.report_type.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setIntake(prev => ({ ...prev, report_type: opt }))}
                        className={`w-full py-2.5 px-3 rounded-xl text-sm font-medium border text-left transition-colors ${
                          intake.report_type === opt
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('upload')}
                    className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={!intakeComplete}
                    className="flex-[2] bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3 rounded-xl transition-colors"
                  >
                    {intakeComplete ? '⚔️ Analyze Report' : 'Answer all questions'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: ANALYZING ── */}
            {step === 'analyzing' && (
              <div className="p-12 text-center space-y-4">
                <div className="text-4xl animate-pulse">⚔️</div>
                <h3 className="text-white font-bold text-lg">Analyzing your battle report...</h3>
                <p className="text-gray-400 text-sm">Reading {images.length} screenshot{images.length > 1 ? 's' : ''}. This takes 10–20 seconds.</p>
                <div className="flex justify-center gap-1 mt-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Step: RESULT ── */}
            {step === 'result' && result && (
              <div className="p-6 space-y-5">

                {/* Outcome + Verdict */}
                <div className="bg-gray-800 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-black ${OUTCOME_COLOR[result.outcome] ?? 'text-white'}`}>
                      {result.outcome?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{meta?.images_analyzed} screenshot{(meta?.images_analyzed ?? 0) > 1 ? 's' : ''} analyzed</span>
                  </div>
                  <div className="text-yellow-300 font-bold text-base">{result.verdict}</div>
                </div>

                {/* Power Differential */}
                {result.power_differential.attacker_power !== 'not visible' && (
                  <Section title="⚡ Power Differential">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Attacker</div>
                        <div className="text-white font-bold">{result.power_differential.attacker_power}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Defender</div>
                        <div className="text-white font-bold">{result.power_differential.defender_power}</div>
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-400">{result.power_differential.gap_pct} gap — </span>
                      <span className="text-xs text-gray-300">{result.power_differential.assessment}</span>
                    </div>
                  </Section>
                )}

                {/* Troop Breakdown */}
                <Section title="🪖 Troop Type Matchup">
                  <div className={`text-sm font-bold mb-1 ${MATCHUP_COLOR[result.troop_breakdown.type_matchup] ?? 'text-gray-300'}`}>
                    {result.troop_breakdown.type_matchup}
                  </div>
                  <p className="text-gray-300 text-sm">{result.troop_breakdown.counter_explanation}</p>
                  {result.troop_breakdown.your_type_damage_pct !== 'not visible' && (
                    <div className="grid grid-cols-2 gap-3 mt-3 text-center text-xs">
                      <div>
                        <div className="text-gray-500 mb-1">Your troops took</div>
                        <div className={`font-bold text-base ${parseInt(result.troop_breakdown.your_type_damage_pct) > 60 ? 'text-red-400' : 'text-green-400'}`}>
                          {result.troop_breakdown.your_type_damage_pct}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Their troops took</div>
                        <div className={`font-bold text-base ${parseInt(result.troop_breakdown.enemy_type_damage_pct) > 60 ? 'text-red-400' : 'text-green-400'}`}>
                          {result.troop_breakdown.enemy_type_damage_pct}
                        </div>
                      </div>
                    </div>
                  )}
                </Section>

                {/* Stat Comparison */}
                <Section title="📊 Stat Comparison">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['ATK', result.stat_comparison.atk_status],
                      ['HP', result.stat_comparison.hp_status],
                      ['DEF', result.stat_comparison.def_status],
                      ['Lethality', result.stat_comparison.lethality_status],
                    ].map(([label, status]) => (
                      <div key={label} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                        <span className="text-gray-400 text-xs">{label}</span>
                        <span className={`text-xs font-bold ${STAT_COLOR[status] ?? 'text-gray-400'}`}>
                          {status === 'Advantage' ? '▲' : status === 'Disadvantage' ? '▼' : status === 'Equal' ? '=' : '—'} {status}
                        </span>
                      </div>
                    ))}
                  </div>
                  {result.stat_comparison.stat_gap_cause !== 'Stats favorable' && result.stat_comparison.stat_gap_cause !== 'Unknown' && (
                    <p className="text-yellow-300 text-xs mt-2 font-medium">{result.stat_comparison.stat_gap_cause}</p>
                  )}
                </Section>

                {/* Hero Performance */}
                <Section title="🦸 Hero Performance">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${
                      result.hero_performance.skill_damage_assessment === 'Strong' ? 'text-green-400' :
                      result.hero_performance.skill_damage_assessment === 'Moderate' ? 'text-yellow-400' :
                      result.hero_performance.skill_damage_assessment === 'Weak' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {result.hero_performance.skill_damage_assessment}
                    </span>
                    {result.hero_performance.ew_gap_suspected && (
                      <span className="text-xs bg-orange-900/50 border border-orange-700/50 text-orange-300 px-2 py-0.5 rounded-full">
                        EW gap suspected
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{result.hero_performance.notes}</p>
                </Section>

                {/* Formation */}
                {result.formation.formation_issue && (
                  <Section title="🔺 Formation Issue">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-300 font-bold text-sm">{result.formation.your_formation_bonus} bonus</span>
                      <span className="text-gray-500 text-xs">(max is +20%)</span>
                    </div>
                    <p className="text-gray-300 text-sm">{result.formation.notes}</p>
                  </Section>
                )}

                {/* Loss Severity */}
                {result.loss_severity.permanent_loss_warning && (
                  <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
                    <div className="text-red-400 font-bold text-sm mb-1">⚠️ Permanent Loss Warning</div>
                    <p className="text-red-300 text-xs">
                      Your hospital may have been full during this fight. High kill counts indicate troops died permanently rather than going to hospital.
                      Upgrade hospital capacity before your next kill event.
                    </p>
                  </div>
                )}

                {/* Root Causes */}
                <Section title="🔍 Root Causes">
                  <ul className="space-y-2">
                    {result.root_causes.map((cause, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-yellow-400 shrink-0">{i + 1}.</span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Coaching */}
                <Section title="🎯 Coaching">
                  <ul className="space-y-3">
                    {result.coaching.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span className="text-yellow-400 shrink-0 mt-0.5">→</span>
                        <span className="text-gray-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Invisible Factors */}
                {result.invisible_factors_note && (
                  <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 text-xs text-blue-300 leading-relaxed">
                    <span className="font-semibold">Tactics Card / EW Note: </span>
                    {result.invisible_factors_note}
                  </div>
                )}

                {/* Rematch Verdict */}
                <Section title="🔁 Rematch?">
                  <div className={`text-base font-bold mb-1 ${REMATCH_COLOR[result.rematch_verdict] ?? 'text-gray-300'}`}>
                    {result.rematch_verdict}
                  </div>
                  <p className="text-gray-300 text-sm">{result.rematch_reasoning}</p>
                </Section>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:border-gray-600 transition-colors"
                  >
                    New Analysis
                  </button>
                  <button
                    onClick={handleAskBuddy}
                    className="flex-[2] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors text-sm"
                  >
                    Ask Buddy More →
                  </button>
                </div>

                <p className="text-center text-xs text-gray-600">
                  {meta?.reports_remaining_today === 'unlimited'
                    ? 'Unlimited analyses · Founding Member'
                    : `${meta?.reports_remaining_today} analyses remaining today`
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase">{title}</h4>
      {children}
    </div>
  );
}
