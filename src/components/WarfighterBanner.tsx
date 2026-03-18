'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WarfighterBanner() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hasFlag = document.cookie.includes('mc_warfighter=1')
    setShow(hasFlag)
  }, [])

  const exitWarfighter = () => {
    document.cookie = 'mc_warfighter=1; path=/; max-age=0'
    setShow(false)
    router.push('/admin')
  }

  if (!show) return null

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#085041',
      padding: '8px 1rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#5DCAA5', flexShrink: 0
        }} />
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#9FE1CB' }}>
          Warfighter mode — viewing as player
        </span>
      </div>
      <button
        onClick={exitWarfighter}
        style={{
          fontSize: '12px', fontWeight: 500, color: '#9FE1CB',
          background: 'transparent', border: '0.5px solid #0F6E56',
          borderRadius: 'var(--border-radius-md)', padding: '4px 12px',
          cursor: 'pointer'
        }}
      >
        ← Return to Mission Control
      </button>
    </div>
  )
}
