'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Music, 
  Palette, 
  TreePine, 
  Gamepad2,
  Star,
  Activity,
  Utensils,
  Bed,
  Smile,
  Info
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  parent_id: string
}

interface PlannedActivity {
  id: string
  name: string
  description: string
  category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical'
  start_time: string
  end_time: string
  age_groups: string[]
  materials_needed: string[]
  learning_objectives: string[]
  teacher_notes: string | null
  date: string
}

interface DailySchedule {
  id: string
  date: string
  age_group: string
  activities: PlannedActivity[]
  meals: {
    breakfast_time: string
    lunch_time: string
    snack_time: string
  }
  naps: {
    morning_start: string
    morning_end: string
    afternoon_start: string
    afternoon_end: string
  }
}

export default function ActivitiesPage() {
  const { user, client: supabase } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null)
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchChildren()
    }
  }, [user])

  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchDailySchedule()
      fetchPlannedActivities()
    }
  }, [selectedChild, selectedDate])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id)

      if (error) throw error
      setChildren(data || [])
      if (data && data.length > 0) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Failed to load children information')
    } finally {
      setLoading(false)
    }
  }

  const fetchDailySchedule = async () => {
    if (!selectedChild || !selectedDate) return

    try {
      const { data, error } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('date', selectedDate)
        .eq('age_group', selectedChild.age_group)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDailySchedule(data)
    } catch (error) {
      console.error('Error fetching daily schedule:', error)
      // Don't show error for missing schedule
    }
  }

  const fetchPlannedActivities = async () => {
    if (!selectedChild || !selectedDate) return

    try {
      const { data, error } = await supabase
        .from('planned_activities')
        .select('*')
        .eq('date', selectedDate)
        .contains('age_groups', [selectedChild.age_group])
        .order('start_time')

      if (error) throw error
      setPlannedActivities(data || [])
    } catch (error) {
      console.error('Error fetching planned activities:', error)
      toast.error('Failed to load planned activities')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'art':
        return <Palette className="h-5 w-5 text-purple-500" />
      case 'music':
        return <Music className="h-5 w-5 text-pink-500" />
      case 'outdoor':
        return <TreePine className="h-5 w-5 text-green-500" />
      case 'learning':
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case 'sensory':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'physical':
        return <Activity className="h-5 w-5 text-red-500" />
      default:
        return <Gamepad2 className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'art':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'music':
        return 'bg-pink-50 border-pink-200 text-pink-700'
      case 'outdoor':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'learning':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'sensory':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'physical':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading activities...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Activities</h1>
          <p className="text-gray-600 mt-2">
            View planned activities and daily schedule for your child
          </p>
        </div>

        {/* Child and Date Selector */}
        <div className="mb-8 space-y-4">
          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild?.id === child.id ? 'default' : 'outline'}
                    onClick={() => setSelectedChild(child)}
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>{child.first_name} {child.last_name}</span>
                    <Badge variant="secondary">{child.age_group}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {selectedChild ? (
          <div className="space-y-8">
            {/* Daily Schedule Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Daily Schedule - {formatDate(selectedDate)}
                </CardTitle>
                <CardDescription>
                  {selectedChild.first_name}'s daily routine and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailySchedule ? (
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Meals */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Utensils className="h-4 w-4 mr-2" />
                        Meals
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Breakfast:</span>
                          <span className="font-medium">{formatTime(dailySchedule.meals.breakfast_time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lunch:</span>
                          <span className="font-medium">{formatTime(dailySchedule.meals.lunch_time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Snack:</span>
                          <span className="font-medium">{formatTime(dailySchedule.meals.snack_time)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Naps */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Bed className="h-4 w-4 mr-2" />
                        Naps
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Morning:</span>
                          <div className="font-medium">
                            {formatTime(dailySchedule.naps.morning_start)} - {formatTime(dailySchedule.naps.morning_end)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Afternoon:</span>
                          <div className="font-medium">
                            {formatTime(dailySchedule.naps.afternoon_start)} - {formatTime(dailySchedule.naps.afternoon_end)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Today's Highlights
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Activities:</span>
                          <span className="font-medium">{plannedActivities.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Age Group:</span>
                          <Badge variant="outline">{selectedChild.age_group}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No schedule available for this date</p>
                    <p className="text-sm text-gray-500 mt-2">
                      The daily schedule will be posted by teachers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Planned Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Planned Activities
                </CardTitle>
                <CardDescription>
                  Activities planned for {selectedChild.first_name} on {formatDate(selectedDate)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plannedActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No activities planned for this date</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Teachers will add activities to the schedule
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {plannedActivities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(activity.category)}
                            <div>
                              <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getCategoryColor(activity.category)}>
                                  {activity.category}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3">{activity.description}</p>

                        {/* Learning Objectives */}
                        {activity.learning_objectives && activity.learning_objectives.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                            <div className="flex flex-wrap gap-1">
                              {activity.learning_objectives.map((objective, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {objective}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Materials Needed */}
                        {activity.materials_needed && activity.materials_needed.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Materials:</h5>
                            <div className="flex flex-wrap gap-1">
                              {activity.materials_needed.map((material, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Teacher Notes */}
                        {activity.teacher_notes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-700 mb-1">Teacher Notes:</h5>
                            <p className="text-sm text-blue-600">{activity.teacher_notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Categories Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Activity Categories
                </CardTitle>
                <CardDescription>
                  Overview of activity types planned for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {['art', 'music', 'outdoor', 'learning', 'sensory', 'physical'].map((category) => {
                    const categoryActivities = plannedActivities.filter(a => a.category === category)
                    return (
                      <div key={category} className="text-center p-4 border rounded-lg">
                        <div className="flex items-center justify-center mb-2">
                          {getCategoryIcon(category)}
                        </div>
                        <h4 className="font-semibold text-gray-900 capitalize mb-1">{category}</h4>
                        <p className="text-sm text-gray-600">{categoryActivities.length} activities</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tips for Parents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Tips for Today
                </CardTitle>
                <CardDescription>
                  Helpful information for parents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">What to Bring</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Comfortable clothes for outdoor play</li>
                      <li>• Extra set of clothes</li>
                      <li>• Water bottle</li>
                      <li>• Any comfort items</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Today's Focus</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Creative expression through art</li>
                      <li>• Social skills development</li>
                      <li>• Physical activity and movement</li>
                      <li>• Learning through play</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
              <p className="text-gray-600 mb-4">
                Enroll your child to view their daily activities
              </p>
              <Button asChild>
                <a href="/dashboard/enroll">Enroll Child</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 