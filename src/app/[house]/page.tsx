import { notFound } from 'next/navigation'
import CodeEntry from '@/components/CodeEntry'
import { createServerSupabaseClient } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HouseCodePage({ params }: { params: { house: string } }) {
  const supabase = await createServerSupabaseClient()
  const { house: houseName } = params
  
  const { data: house } = await supabase
    .from('houses')
    .select('*')
    .eq('name', houseName.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!house) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <CodeEntry house={house} />
    </div>
  )
} 