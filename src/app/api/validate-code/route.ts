import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { code, houseId } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

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