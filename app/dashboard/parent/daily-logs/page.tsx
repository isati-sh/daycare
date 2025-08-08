'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileText,
  Baby,
  Calendar,
  Utensils,
  Coffee,
  Bed,
  Activity,
  Heart,
  Camera,
  User,
  Download
} from 'lucide-react'
import { Database } from '@/types/database'
import RoleGuard from '@/components/guards/roleGuard'
import toast from 'react-hot-toast'

type Child = Database['public']['Tables']['children']['Row']
type DailyLog = Database['public']['Tables']['daily_logs']['Row'] & {
  child: Pick<Child, 'first_name' | 'last_name'>
  teacher: { full_name: string }
}

export default function ParentDailyLogsPage() {
  const { user, client } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [showPhotos, setShowPhotos] = useState<string | null>(null)

  useEffect(() => {
    if (user && client) {
      fetchData()
    }
  }, [user, client, selectedDate])

  const fetchData = async () => {
    if (!user || !client) return

    try {
      setLoading(true)

      // Fetch children
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('*')
        .eq('parent_id', user.id)
        .eq('status', 'active')

      if (childrenError) throw childrenError
      setChildren(childrenData || [])

      const childIds = childrenData?.map(c => c.id) || []
      if (childIds.length === 0) {
        setDailyLogs([])
        return
      }

      // Fetch daily logs
      const { data: logsData, error: logsError } = await client
        .from('daily_logs')
        .select(`
          *,
          child:children!daily_logs_child_id_fkey(first_name, last_name),
          teacher:profiles!daily_logs_teacher_id_fkey(full_name)
        `)
        .in('child_id', childIds)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
        .order('date', { ascending: false })

      if (logsError) throw logsError
      setDailyLogs(logsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load daily logs')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = dailyLogs.filter(log => {
    const dateMatch = !selectedDate || log.date === selectedDate
    const childMatch = selectedChild === 'all' || log.child_id === selectedChild
    return dateMatch && childMatch
  })

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'tired': return '😴'
      case 'energetic': return '⚡'
      case 'fussy': return '😤'
      case 'excited': return '🤩'
      default: return '😐'
    }
  }

  const downloadReport = async (log: DailyLog) => {
    // Generate and download a PDF report
    toast.success('Downloading daily report...')
    // Implementation would go here
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading daily logs...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/parent/daily-logs">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
            <p className="text-gray-600">View your child's daily activities and updates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.first_name} {child.last_name}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => setSelectedDate('')}>
            Show All Dates
          </Button>
        </div>

        {/* Daily Logs */}
        <div className="space-y-6">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Baby className="h-6 w-6 text-blue-500" />
                      <div>
                        <CardTitle className="text-xl">
                          {log.child?.first_name} {log.child?.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4">
                          <span>{new Date(log.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Teacher: {log.teacher?.full_name}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="flex items-center space-x-2 text-lg">
                        <span>{getMoodIcon(log.mood)}</span>
                        <span className="capitalize">{log.mood}</span>
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => downloadReport(log)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Utensils className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Meals</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{log.meals?.length || 0}</p>
                      <p className="text-sm text-orange-600">meals today</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Coffee className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">Drinks</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{log.drinks?.length || 0}</p>
                      <p className="text-sm text-blue-600">drinks today</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bed className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Naps</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {[log.naps?.morning_start, log.naps?.afternoon_start].filter(Boolean).length}
                      </p>
                      <p className="text-sm text-purple-600">nap sessions</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Activities</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{log.activities?.length || 0}</p>
                      <p className="text-sm text-green-600">activities</p>
                    </div>
                  </div>

                  {/* Detailed Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Meals */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Utensils className="h-5 w-5 mr-2 text-orange-500" />
                        Meals & Snacks
                      </h3>
                      <div className="space-y-3">
                        {log.meals && log.meals.length > 0 ? (
                          log.meals.map((meal, index) => (
                            <div key={index} className="border rounded p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium capitalize">{meal.type}</span>
                                <span className="text-sm text-gray-500">{meal.time}</span>
                              </div>
                              <p className="text-gray-700">{meal.food}</p>
                              <p className="text-sm text-gray-500">{meal.quantity} {meal.unit}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No meals recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Drinks */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Coffee className="h-5 w-5 mr-2 text-blue-500" />
                        Drinks
                      </h3>
                      <div className="space-y-3">
                        {log.drinks && log.drinks.length > 0 ? (
                          log.drinks.map((drink, index) => (
                            <div key={index} className="border rounded p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium capitalize">{drink.type}</span>
                                <span className="text-sm text-gray-500">{drink.time}</span>
                              </div>
                              <p className="text-sm text-gray-500">{drink.quantity} {drink.unit}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">No drinks recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Naps */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Bed className="h-5 w-5 mr-2 text-purple-500" />
                        Nap Times
                      </h3>
                      <div className="space-y-3">
                        {log.naps?.morning_start && (
                          <div className="border rounded p-3 bg-gray-50">
                            <span className="font-medium">Morning Nap</span>
                            <p className="text-sm text-gray-700">
                              {log.naps.morning_start} - {log.naps.morning_end}
                            </p>
                          </div>
                        )}
                        {log.naps?.afternoon_start && (
                          <div className="border rounded p-3 bg-gray-50">
                            <span className="font-medium">Afternoon Nap</span>
                            <p className="text-sm text-gray-700">
                              {log.naps.afternoon_start} - {log.naps.afternoon_end}
                            </p>
                          </div>
                        )}
                        {!log.naps?.morning_start && !log.naps?.afternoon_start && (
                          <p className="text-gray-500">No naps recorded</p>
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-green-500" />
                        Activities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {log.activities && log.activities.length > 0 ? (
                          log.activities.map((activity, index) => (
                            <Badge key={index} variant="secondary">
                              {activity}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">No activities recorded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Care Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {Array.isArray(log.bathroom_visits) ? log.bathroom_visits.length : (log.bathroom_visits || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Bathroom Visits</p>
                    </div>
                    {log.diaper_changes && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{log.diaper_changes}</p>
                        <p className="text-sm text-gray-600">Diaper Changes</p>
                      </div>
                    )}
                    {log.behavior && (
                      <div className="text-center">
                        <Badge className="text-lg px-3 py-1 capitalize">{log.behavior}</Badge>
                        <p className="text-sm text-gray-600">Behavior</p>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {log.photos && log.photos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Camera className="h-5 w-5 mr-2 text-pink-500" />
                        Photos ({log.photos.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {log.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt="Daily activity"
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setShowPhotos(photo)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teacher Notes */}
                  {log.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2 flex items-center text-yellow-800">
                        <User className="h-5 w-5 mr-2" />
                        Teacher's Notes
                      </h3>
                      <p className="text-gray-700">{log.notes}</p>
                    </div>
                  )}

                  {/* Health Information */}
                  {(log.sickness || log.medications) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2 flex items-center text-red-800">
                        <Heart className="h-5 w-5 mr-2" />
                        Health Information
                      </h3>
                      {log.sickness && (
                        <div className="mb-2">
                          <span className="font-medium">Symptoms: </span>
                          <span className="text-gray-700">{log.sickness}</span>
                        </div>
                      )}
                      {log.medications && (
                        <div>
                          <span className="font-medium">Medications: </span>
                          <span className="text-gray-700">{log.medications}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Daily Logs</h3>
                <p className="text-gray-500">
                  {selectedDate 
                    ? `No daily logs found for ${new Date(selectedDate).toLocaleDateString()}`
                    : 'No daily logs found for your children'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Photo Modal */}
        {showPhotos && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPhotos(null)}
          >
            <img 
              src={showPhotos} 
              alt="Daily activity" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </RoleGuard>
  )
}
