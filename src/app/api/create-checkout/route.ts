import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Initialize Stripe only when needed
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  })
}

export async function POST(request: Request) {
  try {
    const { promoCode, buyerEmail } = await request.json()
    const supabase = await createServerSupabaseClient()

    // Get house data
    const { data: house } = await supabase
      .from('houses')
      .select('*')
      .eq('promo_code', promoCode)
      .single()

    if (!house || house.tickets_sold >= house.ticket_cap) {
      return NextResponse.json({ error: 'No tickets available' }, { status: 400 })
    }

    // Get pricing
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pricing_config')
      .single()

    const pricingConfig = settings?.value || {
      early_bird_deadline: "2024-08-15T23:59:59Z",
      prices: {
        fraternity_early: 12000,
        fraternity_late: 14000,
        sorority_early: 7500,
        sorority_late: 10000
      }
    }

    const isEarlyBird = new Date() < new Date(pricingConfig.early_bird_deadline)
    const priceKey = `${house.house_type}_${isEarlyBird ? 'early' : 'late'}`
    const price = pricingConfig.prices[priceKey]

    // Create Stripe session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `UniFest 2024 - ${house.display_name}`,
          },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/tickets/${promoCode}`,
      customer_email: buyerEmail,
      metadata: {
        house_id: house.id,
        promo_code: promoCode,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
} 