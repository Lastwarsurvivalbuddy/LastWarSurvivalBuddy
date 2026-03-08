'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID

type Submission = {
  id: string
  user_id: string
  server_number: number
  category: string
  claim: string
  scope: string
  status: string
  screenshot_path: string | null
  created_at: string
}

export default function AdminSubmissions() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({})
  const [acting, setActing] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editClaim, setEditClaim] = useState('')
  const [editScope, setEditScope] = useState('')

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/signin'); return }
    if (session.user.id !== ADMIN_USER_ID) { router.push('/dashboard'); return }
    await loadSubmissions()
  }

  async function loadSubmissions() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('/api/admin/submissions', {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    const data = await res.json()
    setSubmissions(data.submissions ?? [])

    const urls: Record<string, string> = {}
    for (const sub of data.submissions ?? []) {
      if (sub.screenshot_path) {
        const { data: urlData } = await supabase.storage
          .from('submission-screenshots')
          .createSignedUrl(sub.screenshot_path, 3600)
        if (urlData?.signedUrl) urls[sub.id] = urlData.signedUrl
      }
    }
    setScreenshotUrls(urls)
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approved' | 'rejected') {
    setActing(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id, status: action })
    })

    setSubmissions(prev => prev.filter(s => s.id !== id))
    setActing(null)
  }

  async function handleSaveEdit(id: string) {
    setActing(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await fetch('/api/admin/submissions', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ id, claim: editClaim, scope: editScope })
    })

    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, claim: editClaim, scope: editScope } : s
    ))
    setEditingId(null)
    setActing(null)
  }

  function startEdit(sub: Submission) {
    setEditingId(sub.id)
    setEditClaim(sub.claim)
    setEditScope(sub.scope)
  }

  const pending = submissions.filter(s => s.status === 'pending')

  if (loading) return (
    <div style={{ background: '#0d0d1a', minHeight: '100vh', color: '#fff', padding: '40px', textAlign: 'center' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ background: '#0d0d1a', minHeight: '100vh', color: '#fff', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#f0c040', fontSize: '20px', marginBottom: '4px' }}>
        🧠 Submission Queue
      </h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>
        {pending.length} pending review
      </p>

      {pending.length === 0 && (
        <div style={{ color: '#555', textAlign: 'center', marginTop: '60px', fontSize: '15px' }}>
          Queue is clear. Buddy is up to date. ✓
        </div>
      )}

      {pending.map(sub => (
        <div key={sub.id} style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#f0c04020',
              color: '#f0c040',
              border: '1px solid #f0c04040',
              borderRadius: '12px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              {sub.category}
            </span>

            {/* Scope — toggleable in edit mode */}
            {editingId === sub.id ? (
              <button
                onClick={() => setEditScope(editScope === 'global' ? 'server_specific' : 'global')}
                style={{
                  background: editScope === 'global' ? '#3b82f620' : '#22c55e20',
                  color: editScope === 'global' ? '#3b82f6' : '#22c55e',
                  border: `1px solid ${editScope === 'global' ? '#3b82f640' : '#22c55e40'}`,
                  borderRadius: '12px',
                  padding: '2px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                {editScope === 'global' ? '🌐 Global' : `🎯 Server ${sub.server_number}`} ⇄
              </button>
            ) : (
              <span style={{
                background: sub.scope === 'global' ? '#3b82f620' : '#22c55e20',
                color: sub.scope === 'global' ? '#3b82f6' : '#22c55e',
                border: `1px solid ${sub.scope === 'global' ? '#3b82f640' : '#22c55e40'}`,
                borderRadius: '12px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {sub.scope === 'global' ? '🌐 Global' : `🎯 Server ${sub.server_number}`}
              </span>
            )}

            <span style={{ color: '#555', fontSize: '11px', marginLeft: 'auto' }}>
              {new Date(sub.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Claim — editable in edit mode */}
          {editingId === sub.id ? (
            <textarea
              value={editClaim}
              onChange={e => setEditClaim(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                background: '#0d0d1a',
                border: '1px solid #f0c04060',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '15px',
                padding: '10px',
                marginBottom: '12px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <p style={{ color: '#fff', fontSize: '15px', margin: '0 0 12px 0', lineHeight: 1.5 }}>
              {sub.claim}
            </p>
          )}

          {screenshotUrls[sub.id] && (
            <img
              src={screenshotUrls[sub.id]}
              alt="Submission screenshot"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
                border: '1px solid #2a2a4a',
                marginBottom: '12px',
                display: 'block'
              }}
            />
          )}

          {editingId === sub.id ? (
            // Edit mode buttons
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleSaveEdit(sub.id)}
                disabled={acting === sub.id}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f0c040',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: acting === sub.id ? 0.5 : 1
                }}
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => setEditingId(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #2a2a4a',
                  background: 'transparent',
                  color: '#888',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            // Normal mode buttons
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleAction(sub.id, 'approved')}
                disabled={acting === sub.id}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#22c55e',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: acting === sub.id ? 0.5 : 1
                }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => startEdit(sub)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #f0c04060',
                  background: 'transparent',
                  color: '#f0c040',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ✎ Edit
              </button>
              <button
                onClick={() => handleAction(sub.id, 'rejected')}
                disabled={acting === sub.id}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: acting === sub.id ? 0.5 : 1
                }}
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}