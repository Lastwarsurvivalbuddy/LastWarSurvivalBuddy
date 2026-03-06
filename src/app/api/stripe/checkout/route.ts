import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const PRICE_MAP: Record<string, string> = {
  pro:      process.env.STRIPE_PRICE_PRO!,
  elite:    process.env.STRIPE_PRICE_ELITE!,
  founding: process.env.STRIPE_PRICE_FOUNDING!,
  alliance: process.env.STRIPE_PRICE_ALLIANCE!,
}

const MODE_MAP: Record<string, 'subscription' | 'payment'> = {
  pro:      'subscription',
  elite:    'subscription',
  founding: 'payment',
  alliance: 'subscription',
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await req.json()
    if (!tier || !PRICE_MAP[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lwsb.vercel.app'

    const session = await stripe.checkout.sessions.create({
      mode: MODE_MAP[tier],
      line_items: [{ price: PRICE_MAP[tier], quantity: 1 }],
      success_url: `${appUrl}/upgrade/success?tier=${tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/upgrade`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        tier,
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}