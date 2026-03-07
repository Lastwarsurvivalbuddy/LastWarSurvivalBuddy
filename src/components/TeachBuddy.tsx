'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { value: 'unit', label: '⚔️ Unit' },
  { value: 'event', label: '📅 Event' },
  { value: 'mechanic', label: '⚙️ Mechanic' },
  { value: 'pack', label: '💰 Pack' },
  { value: 'other', label: '🔍 Other' },
]

const SCREENSHOT_LIMITS: Record<string, number> = {
  free: 2,
  pro: 5,
  elite: 5,
  founding: 5,
  alliance: 5
}

export default function TeachBuddy({
  serverNumber,
  tier = 'free'
}: {
  serverNumber: number
  tier?: string
}) {
  const [claim, setClaim] = useState('')
  const [category, setCategory] = useState('mechanic')
  const [scope, setScope] = useState<'server_specific' | 'global'>('server_specific')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [screenshotCount, setScreenshotCount] = useState(0)
  const [countLoaded, setCountLoaded] = useState(false)

  const screenshotLimit = SCREENSHOT_LIMITS[tier] ?? 2
  const screenshotLimitReached = screenshotCount >= screenshotLimit

  useEffect(() => {
    loadScreenshotCount()
  }, [])

  async function loadScreenshotCount() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/submissions', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      setScreenshotCount(data.count ?? 0)
    } catch (err) {
      console.error(err)
    } finally {
      setCountLoaded(true)
    }
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  function removeScreenshot() {
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  async function handleSubmit() {
    if (!claim.trim()) return
    setStatus('submitting')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      let screenshot_path = null

      if (screenshot) {
        const ext = screenshot.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('submission-screenshots')
          .upload(path, screenshot)
        if (uploadError) throw uploadError
        screenshot_path = path
      }

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          claim,
          category,
          scope,
          server_number: serverNumber,
          screenshot_path
        })
      })

      if (!res.ok) {
        const err = await res.json()
        if (res.status === 429) {
          setStatus('error')
          setTimeout(() => setStatus('idle'), 3000)
          return
        }
        throw new Error(err.error)
      }

      if (screenshot_path) setScreenshotCount(c => c + 1)

      setStatus('success')
      setClaim('')
      setScreenshot(null)
      setScreenshotPreview(null)
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

      <div style={{ marginTop: '12px' }}>
        {screenshotPreview ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={screenshotPreview}
              alt="Screenshot preview"
              style={{
                maxWidth: '100%',
                maxHeight: '160px',
                borderRadius: '8px',
                border: '1px solid #2a2a4a'
              }}
            />
            <button
              onClick={removeScreenshot}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: '#0d0d1a',
                border: '1px solid #2a2a4a',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                color: '#888',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '8px',
            border: '1px dashed #2a2a4a',
            color: screenshotLimitReached ? '#555' : '#888',
            fontSize: '13px',
            cursor: screenshotLimitReached ? 'not-allowed' : 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
              disabled={screenshotLimitReached || !countLoaded}
              style={{ display: 'none' }}
            />
            📸 {!countLoaded
              ? 'Loading...'
              : screenshotLimitReached
              ? `Daily screenshot limit reached (${screenshotLimit}/day)`
              : `Attach a screenshot (optional) · ${screenshotCount}/${screenshotLimit} today`}
          </label>
        )}
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
          background: status === 'success' ? '#22c55e' : status === 'error' ? '#ef4444' : '#f0c040',
          color: status === 'error' ? '#fff' : '#0d0d1a',
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
