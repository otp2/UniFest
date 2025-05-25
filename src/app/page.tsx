import HouseSelector from '@/components/HouseSelector'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <div className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">UniFest 2024</h1>
          <p className="text-xl text-purple-200">Select your house to get started</p>
        </div>
        <HouseSelector />
      </div>
    </div>
  )
}
