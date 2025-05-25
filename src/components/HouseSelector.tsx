'use client'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const HOUSE_CATEGORIES = {
  fraternities: [
    { name: 'SAE', display: 'Sigma Alpha Epsilon' },
    { name: 'SigEp', display: 'Sigma Phi Epsilon' },
    { name: 'PiKapp', display: 'Pi Kappa Alpha' },
    { name: 'DeltaChi', display: 'Delta Chi' },
  ],
  sororities: [
    { name: 'AEPhi', display: 'Alpha Epsilon Phi' },
    { name: 'DG', display: 'Delta Gamma' },
    { name: 'KD', display: 'Kappa Delta' },
    { name: 'ChiO', display: 'Chi Omega' },
  ]
}

export default function HouseSelector() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <Card className="bg-black/20 border-purple-500">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Fraternities</h2>
          <div className="grid grid-cols-2 gap-4">
            {HOUSE_CATEGORIES.fraternities.map((house) => (
              <Button
                key={house.name}
                variant="outline"
                className="h-16 text-left justify-start"
                onClick={() => router.push(`/${house.name.toLowerCase()}`)}
              >
                <div>
                  <div className="font-bold">{house.name}</div>
                  <div className="text-sm opacity-70">{house.display}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-purple-500">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Sororities</h2>
          <div className="grid grid-cols-2 gap-4">
            {HOUSE_CATEGORIES.sororities.map((house) => (
              <Button
                key={house.name}
                variant="outline"
                className="h-16 text-left justify-start"
                onClick={() => router.push(`/${house.name.toLowerCase()}`)}
              >
                <div>
                  <div className="font-bold">{house.name}</div>
                  <div className="text-sm opacity-70">{house.display}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 