'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#07080a] flex items-center justify-center">
      <div className="bg-[#0e1014] border border-[#2a3040] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-[#e8a020] font-bold text-2xl tracking-widest uppercase text-center mb-8">
          Sign In
        </h1>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#07080a] border border-[#2a3040] rounded-lg px-4 py-3 text-white placeholder-[#606878] mb-4 outline-none focus:border-[#e8a020]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#07080a] border border-[#2a3040] rounded-lg px-4 py-3 text-white placeholder-[#606878] mb-6 outline-none focus:border-[#e8a020]"
        />
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#c0281a] to-[#e8a020] text-white font-bold py-3 rounded-lg uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {message && (
          <p className="text-center mt-4 text-sm text-red-400">{message}</p>
        )}
        <p className="text-center mt-6 text-sm text-[#606878]">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#e8a020] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  )
}