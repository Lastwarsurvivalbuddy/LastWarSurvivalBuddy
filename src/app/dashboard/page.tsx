'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signin')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-[#07080a] flex items-center justify-center">
      <div className="bg-[#0e1014] border border-[#2a3040] rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-[#e8a020] font-bold text-2xl tracking-widest uppercase mb-4">
          Welcome, Commander
        </h1>
        <p className="text-[#8090a0] text-sm mb-8">{user.email}</p>
        <button
          onClick={handleSignOut}
          className="bg-[#1a2030] border border-[#2a3040] text-[#8090a0] font-bold py-3 px-8 rounded-lg uppercase tracking-widest hover:border-[#e8a020] hover:text-[#e8a020] transition-all"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}