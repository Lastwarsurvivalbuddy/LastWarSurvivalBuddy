  'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Handle Supabase email confirmation — token lands on root URL
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    if (hash || params.get('code') || params.get('token_hash')) {
      // Let Supabase process the session from the URL
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push('/dashboard');
        } else {
          // Try to exchange the token
          supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              router.push('/dashboard');
            }
          });
        }
      });
    } else {
      // No auth token — redirect to signin
      router.push('/signin');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#07080a] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bold text-4xl text-[#e8a020] tracking-widest uppercase mb-4">
          Last War: Survival Buddy
        </h1>
        <p className="text-[#8090a0] text-sm tracking-[0.2em] uppercase">
          Loading...
        </p>
      </div>
    </main>
  );
}

