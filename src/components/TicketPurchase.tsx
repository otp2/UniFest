'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loadStripe } from '@stripe/stripe-js'

interface House {
  id: string
  name: string
  display_name: string
  house_type: string
  promo_code: string
  ticket_cap: number
  tickets_sold: number
  bus_route: string
}

interface TicketPurchaseProps {
  house: House
  price: number
  isEarlyBird: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function TicketPurchase({ house, price, isEarlyBird }: TicketPurchaseProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promoCode: house.promo_code,
          buyerEmail: email
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ticketsRemaining = house.ticket_cap - house.tickets_sold
  const priceInDollars = (price / 100).toFixed(2)

  return (
    <Card className="w-full max-w-md bg-black/20 border-purple-500">
      <CardHeader>
        <CardTitle className="text-center text-white text-2xl">
          {house.display_name}
        </CardTitle>
        <div className="text-center text-purple-200">
          <p className="mb-2">🚌 Bus Route: <span className="font-bold text-white">{house.bus_route}</span></p>
          <p className="mb-2">🎫 Tickets Available: <span className="font-bold text-white">{ticketsRemaining}</span></p>
          <div className="text-lg font-bold text-white">
            ${priceInDollars} {isEarlyBird && <span className="text-green-400">(Early Bird)</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {ticketsRemaining > 0 ? (
          <form onSubmit={handlePurchase} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              disabled={!email || loading}
            >
              {loading ? 'Processing...' : `Purchase Ticket - $${priceInDollars}`}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-red-400 text-lg font-bold mb-4">Sold Out</p>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 