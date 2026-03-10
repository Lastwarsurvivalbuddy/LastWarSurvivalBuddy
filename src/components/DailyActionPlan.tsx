'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateDailyPlan, DailyAction, ActionPriority, CommanderProfile } from '@/lib/actionPlan'

interface Props {
  profile: CommanderProfile & { commander_name?: string }
}

const priorityConfig: Record<ActionPriority, { label: string; color: string; bar: string }> = {
  critical: { label: 'CRITICAL', color: 'text-red-400', bar: 'bg-red-500' },
  high:     { label: 'HIGH',     color: 'text-amber-400', bar: 'bg-amber-500' },
  medium:   { label: 'MED',      color: 'text-sky-400',  bar: 'bg-sky-500' },
  low:      { label: 'LOW',      color: 'text-zinc-400', bar: 'bg-zinc-500' },
}

function ActionCard({ action, index }: { action: DailyAction; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState(false)
  const router = useRouter()
  const cfg = priorityConfig[action.priority]

  return (
    <div
      className={`
        relative border rounded-lg overflow-hidden transition-all duration-200
        ${checked
          ? 'border-zinc-700 bg-zinc-900/30 opacity-60'
          : 'border-zinc-700/80 bg-zinc-900/60 hover:border-zinc-500'
        }
      `}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Priority bar — left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />

      <div className="pl-4 pr-3 py-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => setChecked(!checked)}
            className={`
              mt-0.5 flex-shrink-0 w-5 h-5 rounded border transition-all duration-150
              ${checked
                ? 'bg-green-600 border-green-600 flex items-center justify-center'
                : 'border-zinc-600 hover:border-zinc-400'
              }
            `}
          >
            {checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold tracking-widest ${cfg.color} font-mono`}>
                {cfg.label}
              </span>
              {action.points && (
                <span className="text-[10px] text-zinc-500 font-mono tracking-wide">
                  · {action.points}
                </span>
              )}
              {action.timeRequired && (
                <span className="text-[10px] text-zinc-600 font-mono">
                  · ⏱ {action.timeRequired}
                </span>
              )}
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-left mt-0.5 w-full"
            >
              <h3 className={`text-sm font-semibold leading-snug transition-colors ${checked ? 'text-zinc-500 line-through' : 'text-zinc-100 hover:text-white'}`}>
                {action.title}
              </h3>
            </button>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-1"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 16 16"
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-3 ml-8 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              {action.description}
            </p>
            {action.buddyPrompt && (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('buddy_prefill', action.buddyPrompt!)
                  }
                  router.push('/buddy')
                }}
                className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                    <path d="M6 1a5 5 0 110 10A5 5 0 016 1zm0 2.5v3l2 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </span>
                Ask Buddy to go deeper →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DailyActionPlan({ profile }: Props) {
  const plan = generateDailyPlan(profile)
  const criticalCount = plan.actions.filter(a => a.priority === 'critical').length

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mb-1">
              Daily Intel
            </p>
            <h2 className="text-lg font-bold text-white leading-tight">
              {plan.greeting}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {plan.dutyReport}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-white font-mono">
              {plan.actions.length}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Actions
            </div>
          </div>
        </div>

        {/* Critical count badge */}
        {criticalCount > 0 && (
          <div className="mt-3 flex items-center gap-2 bg-red-950/40 border border-red-900/50 rounded-md px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-xs text-red-400 font-medium">
              {criticalCount} critical action{criticalCount > 1 ? 's' : ''} require your attention today
            </span>
          </div>
        )}

        {/* Strategic insight */}
        {plan.insight && (
          <div className="mt-2 flex items-start gap-2 bg-amber-950/30 border border-amber-900/40 rounded-md px-3 py-2">
            <span className="text-amber-500 flex-shrink-0 mt-0.5">💡</span>
            <span className="text-xs text-amber-200/80 leading-relaxed">
              {plan.insight}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Today's Orders
        </span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Action cards */}
      <div className="space-y-2">
        {plan.actions.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] text-zinc-700 font-mono">
          Updates at next Duel reset - 2am UCT
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors font-mono flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
            <path d="M10 6A4 4 0 112 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 3v3H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  )
}
