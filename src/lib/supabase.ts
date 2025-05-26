import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      'https://verbdhevzrtblphzbosr.supabase.co'
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmJkaGV2enJ0YmxwaHpib3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDk1ODksImV4cCI6MjA2Mzc4NTU4OX0.JV7CXCMWNBYRKfARk3yoodHad5a5QTKi1lu_xCwNNHQ'
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export async function createServerSupabaseClient() {
  // Try multiple ways to get the environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                      process.env.SUPABASE_URL ||
                      'https://verbdhevzrtblphzbosr.supabase.co'
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          process.env.SUPABASE_ANON_KEY ||
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcmJkaGV2enJ0YmxwaHpib3NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMDk1ODksImV4cCI6MjA2Mzc4NTU4OX0.JV7CXCMWNBYRKfARk3yoodHad5a5QTKi1lu_xCwNNHQ'
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Environment variables debug:', {
      supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
      supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
      nodeEnv: process.env.NODE_ENV
    })
    throw new Error('Missing Supabase environment variables')
  }
  
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
} 