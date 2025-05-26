import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function WelcomePage({ params }: { params: Promise<{ house: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { house: houseName } = await params
  
  const { data: house } = await supabase
    .from('houses')
    .select('*')
    .eq('name', houseName.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!house) notFound()

  const ticketsRemaining = house.ticket_cap - house.tickets_sold

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/20 border-purple-500">
        <CardHeader>
          <CardTitle className="text-center text-white text-2xl">
            Welcome to {house.display_name}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-purple-200">
            <p className="mb-2">🚌 Bus Route: <span className="font-bold text-white">{house.bus_route}</span></p>
            <p className="mb-2">🎫 Tickets Available: <span className="font-bold text-white">{ticketsRemaining}</span></p>
            <p>🏠 House Type: <span className="font-bold text-white capitalize">{house.house_type}</span></p>
          </div>
          
          {ticketsRemaining > 0 ? (
            <Link href={`/tickets/${house.promo_code}`}>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Purchase Tickets
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full">
              Sold Out
            </Button>
          )}
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to House Selection
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 