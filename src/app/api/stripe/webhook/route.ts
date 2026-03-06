import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tier = session.metadata?.tier
        if (!userId || !tier) break
        if (session.mode === 'payment') {
          await upsertSubscription(userId, tier, 'active', null, session.id)
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        // In newer Stripe SDK, parent contains subscription info
        const subscriptionId = (invoice as any).subscription
          ?? (invoice as any).parent?.subscription_details?.subscription
        if (!subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata?.user_id
        const tier = subscription.metadata?.tier

        if (!userId) {
          const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : (subscription.customer as Stripe.Customer)?.id
          if (customerId) {
            const { data: profile } = await supabaseAdmin
              .from('subscriptions')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .single()
            if (profile) {
              await upsertSubscription(profile.user_id, tier || 'pro', 'active', subscriptionId)
            }
          }
          break
        }

        await upsertSubscription(userId, tier || 'pro', 'active', subscriptionId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        if (sub) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ tier: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('user_id', sub.user_id)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
        if (sub) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: subscription.status, updated_at: new Date().toISOString() })
            .eq('user_id', sub.user_id)
        }
        break
      }

      default:
        break
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}

async function upsertSubscription(
  userId: string,
  tier: string,
  status: string,
  stripeSubscriptionId: string | null,
  stripeSessionId?: string
) {
  const payload: Record<string, unknown> = {
    user_id: userId,
    tier,
    status,
    updated_at: new Date().toISOString(),
  }
  if (stripeSubscriptionId) payload.stripe_subscription_id = stripeSubscriptionId
  if (stripeSessionId) payload.stripe_session_id = stripeSessionId

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(payload, { onConflict: 'user_id' })

  if (error) {
    console.error('Supabase upsert error:', error)
    throw error
  }
}