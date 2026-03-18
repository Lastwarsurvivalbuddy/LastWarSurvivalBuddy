'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface StatsData {
  totalUsers: number
  signupsThisWeek: number
  mrr: number
  foundingLtm: number
  todayDau: number
  apiCostThisMonth: number
  tierCounts: Record<string, number>
  signupSeries: { date: string; count: number }[]
  dauSeries: { date: string; count: number }[]
  apiUsage: { questions: number; screenshots: number; battleReports: number }
  submissions: Submission[]
  modQueue: ModItem[]
}

interface Submission {
  id: string
  created_at: string
  user_id: string
  content: string
  category?: string
  status?: string
}

interface ModItem {
  id: string
  created_at: string
  submission_id?: string
  content: string
  status?: string
  reviewer_note?: string
}

export default function MissionControlPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [statsError, setStatsError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions'>('overview')
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/signin'); return }
      setAuthorized(true)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    if (res.status === 403) {
      router.replace('/dashboard')
      return
    }
    if (!res.ok) {
      setStatsError('Failed to load stats.')
      return
    }
    const data = await res.json()
    setStats(data)
  }, [router])

  useEffect(() => {
    if (authorized) fetchStats()
  }, [authorized, fetchStats])

  const handleSubmissionAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id)
    await supabase
      .from('community_submissions')
      .update({ status: action === 'approve' ? 'approved' : 'rejected' })
      .eq('id', id)
    await fetchStats()
    setActionLoading(null)
  }

  const enterWarfighter = () => {
    document.cookie = 'mc_warfighter=1; path=/; max-age=3600'
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading Mission Control…</p>
      </div>
    )
  }

  if (!authorized) return null

  const tierConfig = [
    { key: 'free', label: 'Free', color: '#B4B2A9', mrr: 0 },
    { key: 'pro', label: 'Buddy Pro', color: '#378ADD', mrr: 9.99 },
    { key: 'elite', label: 'Buddy Elite', color: '#BA7517', mrr: 19.99 },
    { key: 'alliance', label: 'Alliance Premium', color: '#1D9E75', mrr: 19.99 },
    { key: 'founding', label: 'Founding Member', color: '#533AB7', mrr: 0 },
  ]

  const maxTierCount = Math.max(...tierConfig.map(t => stats?.tierCounts?.[t.key] || 0), 1)
  const maxDau = Math.max(...(stats?.dauSeries.map(d => d.count) || [1]), 1)
  const maxSignup = Math.max(...(stats?.signupSeries.map(s => s.count) || [1]), 1)

  const pendingSubmissions = (stats?.submissions || []).filter(s =>
    submissionFilter === 'all' ? true : (s.status || 'pending') === submissionFilter
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: 'var(--border-radius-md)',
            background: '#085041', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#9FE1CB', fontSize: '13px', fontWeight: 500 }}>MC</span>
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 500, margin: 0 }}>Mission Control</h1>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>Boyd · Commander in Chief</p>
          </div>
        </div>
        <button
          onClick={enterWarfighter}
          style={{
            padding: '8px 16px', borderRadius: 'var(--border-radius-md)',
            border: '0.5px solid var(--color-border-secondary)',
            background: 'var(--color-background-secondary)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            color: 'var(--color-text-primary)'
          }}
        >
          Enter Warfighter mode →
        </button>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '1.5rem',
        borderBottom: '0.5px solid var(--color-border-tertiary)', paddingBottom: '0'
      }}>
        {(['overview', 'submissions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', border: 'none', background: 'transparent',
              cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === tab ? '2px solid #1D9E75' : '2px solid transparent',
              marginBottom: '-1px'
            }}
          >
            {tab === 'overview' ? 'Overview' : `Submissions ${stats ? `(${(stats.submissions || []).filter(s => !s.status || s.status === 'pending').length})` : ''}`}
          </button>
        ))}
      </div>

      {statsError && (
        <p style={{ color: 'var(--color-text-danger)', fontSize: '13px', marginBottom: '1rem' }}>{statsError}</p>
      )}

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total users', value: stats.totalUsers.toLocaleString(), delta: `+${stats.signupsThisWeek} this week`, up: true },
              { label: 'MRR', value: `$${stats.mrr.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, delta: `+$${stats.foundingLtm} founding LTM`, up: true },
              { label: 'DAU today', value: stats.todayDau.toLocaleString(), delta: `${stats.totalUsers ? Math.round(stats.todayDau / stats.totalUsers * 100) : 0}% of base`, up: true },
              { label: 'API spend (mo)', value: `$${stats.apiCostThisMonth.toFixed(2)}`, delta: `est. from usage`, up: false },
            ].map(card => (
              <div key={card.label} style={{
                background: 'var(--color-background-secondary)',
                borderRadius: 'var(--border-radius-md)', padding: '14px 16px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{card.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: '11px', marginTop: '5px', color: card.up ? '#0F6E56' : 'var(--color-text-secondary)' }}>{card.delta}</div>
              </div>
            ))}
          </div>

          {/* Signups chart */}
          <div style={{
            background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)', padding: '1rem 1.25rem', marginBottom: '12px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Signups — last 30 days</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Daily new users</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
              {stats.signupSeries.map((s, i) => (
                <div
                  key={i}
                  title={`${s.date}: ${s.count}`}
                  style={{
                    flex: 1, background: '#1D9E75',
                    height: `${Math.max(2, Math.round((s.count / maxSignup) * 80))}px`,
                    borderRadius: '2px 2px 0 0', opacity: 0.7,
                    transition: 'opacity 0.15s'
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>30 days ago</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>today</span>
            </div>
          </div>

          {/* DAU + Revenue row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>

            {/* DAU chart */}
            <div style={{
              background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)', padding: '1rem 1.25rem'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>DAU — last 7 days</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Unique active users</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
                {(stats.dauSeries.length > 0 ? stats.dauSeries : Array(7).fill({ date: '', count: 0 })).map((d, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      title={`${d.date}: ${d.count}`}
                      style={{
                        width: '100%', background: '#378ADD',
                        height: `${Math.max(2, Math.round((d.count / maxDau) * 64))}px`,
                        borderRadius: '2px 2px 0 0'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--color-text-tertiary)' }}>
                      {d.date ? new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by tier */}
            <div style={{
              background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)', padding: '1rem 1.25rem'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Revenue by tier</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Subscribers + MRR</div>
              {tierConfig.map(tier => {
                const count = stats.tierCounts?.[tier.key] || 0
                const rev = tier.key === 'founding' ? `$${count * 99} LTM` : `$${(count * tier.mrr).toFixed(0)}/mo`
                const barPct = Math.round((count / maxTierCount) * 100)
                return (
                  <div key={tier.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', minWidth: '120px', color: 'var(--color-text-primary)' }}>{tier.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', minWidth: '28px' }}>{count}</span>
                    <div style={{ flex: 1, height: '4px', background: 'var(--color-background-secondary)', borderRadius: '2px', margin: '0 10px' }}>
                      <div style={{ width: `${barPct}%`, height: '4px', background: tier.color, borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 500, minWidth: '60px', textAlign: 'right', color: 'var(--color-text-primary)' }}>{rev}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* API usage */}
          <div style={{
            background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 'var(--border-radius-lg)', padding: '1rem 1.25rem'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>API usage — this month</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Calls by route + estimated cost</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
              {[
                { label: 'Buddy AI questions', calls: stats.apiUsage.questions, cost: (stats.apiUsage.questions * 0.008).toFixed(2) },
                { label: 'Battle Report analyses', calls: stats.apiUsage.battleReports, cost: (stats.apiUsage.battleReports * 0.012).toFixed(2) },
                { label: 'Screenshot scans', calls: stats.apiUsage.screenshots, cost: (stats.apiUsage.screenshots * 0.015).toFixed(2) },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'var(--color-background-secondary)',
                  borderRadius: 'var(--border-radius-md)', padding: '12px 14px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 500 }}>{item.calls.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>est. ${item.cost}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── SUBMISSIONS TAB ── */}
      {activeTab === 'submissions' && stats && (
        <>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSubmissionFilter(f)}
                style={{
                  padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
                  border: '0.5px solid var(--color-border-secondary)',
                  background: submissionFilter === f ? 'var(--color-background-secondary)' : 'transparent',
                  fontSize: '12px', fontWeight: submissionFilter === f ? 500 : 400,
                  color: submissionFilter === f ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {pendingSubmissions.length === 0 && (
            <div style={{
              background: 'var(--color-background-secondary)', borderRadius: 'var(--border-radius-lg)',
              padding: '2rem', textAlign: 'center'
            }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>No submissions in this category.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingSubmissions.map(sub => {
              const status = sub.status || 'pending'
              const statusColor = status === 'approved' ? '#0F6E56' : status === 'rejected' ? '#993C1D' : 'var(--color-text-secondary)'
              return (
                <div key={sub.id} style={{
                  background: 'var(--color-background-primary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  borderRadius: 'var(--border-radius-lg)', padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      {sub.category && (
                        <span style={{
                          display: 'inline-block', fontSize: '10px', fontWeight: 500,
                          padding: '2px 8px', borderRadius: 'var(--border-radius-md)',
                          background: 'var(--color-background-secondary)',
                          color: 'var(--color-text-secondary)', marginBottom: '6px'
                        }}>
                          {sub.category}
                        </span>
                      )}
                      <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: 'var(--color-text-primary)' }}>
                        {sub.content}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>
                        {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        <span style={{ color: statusColor, fontWeight: 500 }}>{status}</span>
                      </p>
                    </div>
                    {status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          disabled={actionLoading === sub.id}
                          onClick={() => handleSubmissionAction(sub.id, 'approve')}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--border-radius-md)',
                            border: '0.5px solid #0F6E56', background: 'transparent',
                            color: '#0F6E56', fontSize: '12px', fontWeight: 500, cursor: 'pointer'
                          }}
                        >
                          {actionLoading === sub.id ? '…' : 'Approve'}
                        </button>
                        <button
                          disabled={actionLoading === sub.id}
                          onClick={() => handleSubmissionAction(sub.id, 'reject')}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--border-radius-md)',
                            border: '0.5px solid var(--color-border-secondary)', background: 'transparent',
                            color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
