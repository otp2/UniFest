import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase'
import TicketPurchase from '@/components/TicketPurchase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function TicketPurchasePage({ params }: { params: Promise<{ promo_code: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { promo_code } = await params
  
  const { data: house } = await supabase
    .from('houses')
    .select('*')
    .eq('promo_code', promo_code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!house) notFound()

  // Get pricing configuration
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <TicketPurchase 
        house={house} 
        price={price} 
        isEarlyBird={isEarlyBird}
      />
    </div>
  )
} 