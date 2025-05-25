import { notFound } from 'next/navigation'
import CodeEntry from '@/components/CodeEntry'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function HouseCodePage({ params }: { params: Promise<{ house: string }> }) {
  const supabase = createServerComponentClient({ cookies })
  const { house: houseName } = await params
  
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