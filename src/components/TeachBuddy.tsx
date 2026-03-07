'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'unit', label: '⚔️ Unit' },
  { value: 'event', label: '📅 Event' },
  { value: 'mechanic', label: '⚙️ Mechanic' },
  { value: 'pack', label: '💰 Pack' },
  { value: 'other', label: '🔍 Other' },
]

export default function TeachBuddy({ serverNumber }: { serverNumber: number }) {
  const [claim, setClaim] = useState('')
  const [category, setCategory] = useState('mechanic')
  const [scope, setScope] = useState<'server_specific' | 'global'>('server_specific')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  async function handleSubmit() {
    if (!claim.trim()) return
    setStatus('submitting')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ claim, category, scope, server_number: serverNumber })
      })

      if (!res.ok) throw new Error('Failed to submit')

      setStatus('success')
      setClaim('')
      setTimeout(() => setStatus('idle'), 3000)

    } catch (err) {
      console.error(err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid #2a2a4a',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '16px'
    }}>
      <h3 style={{ color: '#f0c040', margin: '0 0 4px 0', fontSize: '16px' }}>
        🧠 Teach Buddy Something New
      </h3>
      <p style={{ color: '#888', fontSize: '13px', margin: '0 0 16px 0' }}>
        Discovered something? Help Buddy get smarter for your server.
      </p>

      <textarea
        value={claim}
        onChange={e => setClaim(e.target.value)}
        placeholder="What did you discover? Be specific — the more detail the better."
        rows={3}
        style={{
          width: '100%',
          background: '#0d0d1a',
          border: '1px solid #2a2a4a',
          borderRadius: '8px',
          color: '#fff',
          padding: '10px',
          fontSize: '14px',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
      />

      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: category === cat.value ? '#f0c040' : '#2a2a4a',
              background: category === cat.value ? '#f0c04020' : 'transparent',
              color: category === cat.value ? '#f0c040' : '#888',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
        <span style={{ color: '#888', fontSize: '13px' }}>Scope:</span>
        <button
          onClick={() => setScope('server_specific')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: scope === 'server_specific' ? '#f0c040' : '#2a2a4a',
            background: scope === 'server_specific' ? '#f0c04020' : 'transparent',
            color: scope === 'server_specific' ? '#f0c040' : '#888',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          🎯 My Server
        </button>
        <button
          onClick={() => setScope('global')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid',
            borderColor: scope === 'global' ? '#f0c040' : '#2a2a4a',
            background: scope === 'global' ? '#f0c04020' : 'transparent',
            color: scope === 'global' ? '#f0c040' : '#888',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          🌐 Game-Wide
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!claim.trim() || status === 'submitting'}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          background: status === 'success' ? '#22c55e' : '#f0c040',
          color: '#0d0d1a',
          fontWeight: 700,
          fontSize: '14px',
          cursor: claim.trim() ? 'pointer' : 'not-allowed',
          opacity: !claim.trim() || status === 'submitting' ? 0.5 : 1
        }}
      >
        {status === 'submitting' ? 'Submitting...' :
         status === 'success' ? '✓ Submitted — Thanks Commander!' :
         status === 'error' ? 'Something went wrong — try again' :
         'Submit to Buddy'}
      </button>
    </div>
  )
}