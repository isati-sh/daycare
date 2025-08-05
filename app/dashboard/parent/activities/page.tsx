'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Database } from '@/types/database'
import RoleGuard from '@/components/guards/roleGuard'

type PlannedActivity = Database['public']['Tables']['planned_activities']['Row'] & {
  children_participating: number
  child_name: string
}

export default function ParentActivitiesPage() {
  const { user, client, role } = useSupabase()
  const [activities, setActivities] = useState<PlannedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedChild, setSelectedChild] = useState<string>('all')

  useEffect(() => {
    if (user && client) {
      fetchActivities()
    }
  }, [user, client, selectedDate])

  const fetchActivities = async () => {
    if (!user || !client) return

    try {
      setLoading(true)
      
      // Fetch planned activities for the selected date
      const { data: activitiesData, error } = await client
        .from('planned_activities')
        .select('*')
        .eq('date', selectedDate)
        .order('start_time')

      if (error) {
        console.error('Error fetching activities:', error)
        return
      }

      // Fetch children for this parent to get participation info
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('id, first_name, last_name, age_group')
        .eq('parent_id', user.id)
        .eq('status', 'active')

      if (childrenError) {
        console.error('Error fetching children:', childrenError)
      }

      // Transform activities to include child participation info
      const activitiesWithParticipation = activitiesData?.map(activity => {
        // Check if any of the parent's children can participate in this activity
        const eligibleChildren = childrenData?.filter(child => 
          activity.age_groups.includes(child.age_group)
        ) || []

        return {
          ...activity,
          children_participating: eligibleChildren.length,
          child_name: eligibleChildren.length > 0 
            ? eligibleChildren.map(c => `${c.first_name} ${c.last_name}`).join(', ')
            : 'No eligible children'
        }
      }) || []

      setActivities(activitiesWithParticipation)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    if (selectedChild === 'all') return true
    
    // Filter by child participation
    return activity.children_participating > 0
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'art': return 'bg-pink-100 text-pink-800'
      case 'music': return 'bg-purple-100 text-purple-800'
      case 'outdoor': return 'bg-green-100 text-green-800'
      case 'learning': return 'bg-blue-100 text-blue-800'
      case 'sensory': return 'bg-yellow-100 text-yellow-800'
      case 'physical': return 'bg-orange-100 text-orange-800'
      case 'dramatic_play': return 'bg-indigo-100 text-indigo-800'
      case 'science': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading activities...</div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/parent/activities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Daily Activities</h1>
            <div className="text-sm text-gray-600">
              {activities.length} activities planned
            </div>
          </div>

          {/* Date and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md w-48"
              >
                <option value="all">All Activities</option>
                <option value="participating">
                  My Children Can Participate
                </option>
              </select>
            </div>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => (
              <Card
                key={activity.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{activity.name}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">
                        {formatTime(activity.start_time)} -{' '}
                        {formatTime(activity.end_time)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(activity.category)}>
                        {activity.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-sm">Age Groups:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activity.age_groups.map((ageGroup, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {ageGroup}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {activity.materials_needed &&
                      activity.materials_needed.length > 0 && (
                        <div>
                          <span className="font-semibold text-sm">
                            Materials:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.materials_needed.map(
                              (material, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {material}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {activity.learning_objectives &&
                      activity.learning_objectives.length > 0 && (
                        <div>
                          <span className="font-semibold text-sm">
                            Learning Objectives:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.learning_objectives.map(
                              (objective, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {objective}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div>
                      <span className="font-semibold text-sm">
                        Your Children:
                      </span>
                      <p className="text-gray-600 text-sm mt-1">
                        {activity.child_name}
                      </p>
                    </div>

                    {activity.weather_dependent && (
                      <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                        <p className="text-yellow-800 text-sm">
                          ⚠️ Weather dependent activity
                        </p>
                      </div>
                    )}

                    {activity.teacher_notes && (
                      <div>
                        <span className="font-semibold text-sm">
                          Teacher Notes:
                        </span>
                        <p className="text-gray-600 text-sm mt-1">
                          {activity.teacher_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No activities found for this date.
              </p>
              <p className="text-gray-400 mt-2">
                Try selecting a different date or check back later for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
} 