'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase =
  typeof window !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

// ─── THEME ────────────────────────────────────────────────────────────────────
const theme = {
  bg: '#0a0c10',
  surface: '#111318',
  surfaceHover: '#16191f',
  border: '#1e2229',
  borderActive: '#c9a84c',
  gold: '#c9a84c',
  goldLight: '#e8c96a',
  goldDim: '#7a6030',
  text: '#e8e6e0',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  red: '#ef4444',
  green: '#22c55e',
};