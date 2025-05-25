import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <Card className="w-full max-w-md bg-black/20 border-purple-500">
        <CardHeader>
          <CardTitle className="text-center text-white text-2xl">
            🎉 Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-purple-200">
            <p className="mb-4">
              Your ticket has been purchased successfully! You will receive an email with your QR code ticket shortly.
            </p>
            <p className="text-sm">
              Please save the QR code and bring it to the event for entry.
            </p>
          </div>
          
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 