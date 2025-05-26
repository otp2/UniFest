import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { code, houseId } = await request.json()
    const supabase = await createServerSupabaseClient()

    const { data: house } = await supabase
      .from('houses')
      .select('access_code')
      .eq('id', houseId)
      .single()

    if (!house) {
      return NextResponse.json({ valid: false, error: 'House not found' }, { status: 404 })
    }

    const isValid = house.access_code === code.toUpperCase()

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Code validation error:', error)
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 })
  }
} 