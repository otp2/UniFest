import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: houses } = await supabase
    .from('houses')
    .select('*')
    .order('name')

  const { data: totalTickets } = await supabase
    .from('tickets')
    .select('id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          UniFest 2024 - Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/20 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Total Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">
                {totalTickets?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Active Houses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">
                {houses?.filter(h => h.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white">Total Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300">
                {houses?.reduce((sum, h) => sum + h.ticket_cap, 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/20 border-purple-500">
          <CardHeader>
            <CardTitle className="text-white">House Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-purple-500">
                    <th className="text-left p-2">House</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Tickets Sold</th>
                    <th className="text-left p-2">Capacity</th>
                    <th className="text-left p-2">Bus Route</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {houses?.map((house) => (
                    <tr key={house.id} className="border-b border-purple-500/30">
                      <td className="p-2">
                        <div>
                          <div className="font-bold">{house.name}</div>
                          <div className="text-sm text-purple-300">{house.display_name}</div>
                        </div>
                      </td>
                      <td className="p-2 capitalize">{house.house_type}</td>
                      <td className="p-2">{house.tickets_sold}</td>
                      <td className="p-2">{house.ticket_cap}</td>
                      <td className="p-2">{house.bus_route}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          house.is_active 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {house.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 