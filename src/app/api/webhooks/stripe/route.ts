import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'
import QRCode from 'qrcode'

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
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = await createServerSupabaseClient()

    try {
      // Generate QR code
      const ticketId = crypto.randomUUID()
      const qrCodeData = JSON.stringify({
        ticketId,
        houseId: session.metadata?.house_id,
        eventId: 'unifest2024'
      })
      const qrCode = await QRCode.toString(qrCodeData)

      // Save ticket
      await supabase.from('tickets').insert({
        id: ticketId,
        house_id: session.metadata?.house_id,
        buyer_email: session.customer_email,
        price_paid: session.amount_total,
        qr_code: qrCode,
        stripe_session_id: session.id
      })

      // Update house counter
      await supabase.rpc('increment_tickets_sold', {
        house_id: session.metadata?.house_id
      })

      console.log('Ticket created successfully for session:', session.id)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
} 