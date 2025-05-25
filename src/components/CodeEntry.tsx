'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface House {
  id: string
  name: string
  display_name: string
  house_type: string
  access_code: string
  promo_code: string
  ticket_cap: number
  tickets_sold: number
  bus_route: string
  is_active: boolean
}

interface CodeEntryProps {
  house: House
}

export default function CodeEntry({ house }: CodeEntryProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, houseId: house.id })
      })

      const data = await response.json()

      if (data.valid) {
        router.push(`/${house.name.toLowerCase()}/welcome`)
      } else {
        setError('Invalid access code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-black/20 border-purple-500">
      <CardHeader>
        <CardTitle className="text-center text-white">
          {house.display_name}
        </CardTitle>
        <p className="text-center text-purple-200">Enter your access code</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ACCESS CODE"
            className="text-center text-lg font-mono"
            disabled={loading}
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!code || loading}
          >
            {loading ? 'Validating...' : 'Enter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 