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
  Activity,
  Utensils,
  Bed,
  Star,
  BookOpen,
  Music,
  Palette,
  TreePine
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

interface DailySchedule {
  id: string
  date: string
  age_group: string
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

interface Announcement {
  id: string
  title: string
  content: string
  type: 'general' | 'event' | 'reminder' | 'emergency'
  target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
  age_group: string | null
  created_at: string
}

export default function SchedulePage() {
  const { user, client: supabase } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null)
  const [plannedActivities, setPlannedActivities] = useState<PlannedActivity[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchChildren()
    }
  }, [user])

  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchScheduleData()
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

  const fetchScheduleData = async () => {
    if (!selectedChild || !selectedDate) return

    try {
      // Fetch daily schedule
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('date', selectedDate)
        .eq('age_group', selectedChild.age_group)
        .single()

      if (scheduleError && scheduleError.code !== 'PGRST116') throw scheduleError
      setDailySchedule(scheduleData)

      // Fetch planned activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('planned_activities')
        .select('*')
        .eq('date', selectedDate)
        .contains('age_groups', [selectedChild.age_group])
        .order('start_time')

      if (activitiesError) throw activitiesError
      setPlannedActivities(activitiesData || [])

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .or(`target_audience.eq.all,target_audience.eq.parents,target_audience.eq.specific_age_group.and.age_group.eq.${selectedChild.age_group}`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (announcementsError) throw announcementsError
      setAnnouncements(announcementsData || [])
    } catch (error) {
      console.error('Error fetching schedule data:', error)
      toast.error('Failed to load schedule data')
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
        return <Activity className="h-5 w-5 text-gray-500" />
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
  //         <p className="mt-4 text-gray-600">Loading schedule...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Schedule</h1>
          <p className="text-gray-600 mt-2">
            View your child's daily routine and activities
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
            {/* Daily Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Daily Schedule - {formatDate(selectedDate)}
                </CardTitle>
                <CardDescription>
                  {selectedChild.first_name}'s daily routine
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dailySchedule ? (
                  <div className="grid md:grid-cols-2 gap-6">
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

            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Announcements
                </CardTitle>
                <CardDescription>
                  Important updates and reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No announcements</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Check back for important updates
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div key={announcement.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                          <Badge variant="outline" className="capitalize">
                            {announcement.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{announcement.content}</p>
                        <div className="text-xs text-gray-500">
                          {formatDate(announcement.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
              <p className="text-gray-600 mb-4">
                Enroll your child to view their schedule
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