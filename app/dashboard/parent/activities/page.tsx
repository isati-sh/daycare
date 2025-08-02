'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Activity, 
  Calendar, 
  Clock, 
  Users, 
  Shield,
  BookOpen,
  Music,
  Palette,
  Gamepad2,
  Baby
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PlannedActivity {
  id: string
  title: string
  description: string
  category: 'art' | 'music' | 'reading' | 'games' | 'outdoor' | 'science'
  age_group: 'infant' | 'toddler' | 'preschool' | 'all'
  duration: number // in minutes
  materials: string[]
  learning_objectives: string[]
  date: string
  time: string
  status: 'planned' | 'in_progress' | 'completed'
  children_participating: number
  child_name: string
}

export default function ParentActivitiesPage() {
  const { user, client, role } = useSupabase()
  const [activities, setActivities] = useState<PlannedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedChild, setSelectedChild] = useState<string>('all')

  // Dummy data for testing
  const dummyActivities: PlannedActivity[] = [
    {
      id: '1',
      title: 'Finger Painting Fun',
      description: 'Creative art activity using safe, washable finger paints',
      category: 'art',
      age_group: 'toddler',
      duration: 30,
      materials: ['Washable finger paints', 'Large paper sheets', 'Aprons', 'Wet wipes'],
      learning_objectives: ['Color recognition', 'Fine motor skills', 'Creative expression'],
      date: '2024-03-15',
      time: '09:00',
      status: 'completed',
      children_participating: 8,
      child_name: 'Emma Johnson'
    },
    {
      id: '2',
      title: 'Story Time with Puppets',
      description: 'Interactive reading session with hand puppets',
      category: 'reading',
      age_group: 'preschool',
      duration: 20,
      materials: ['Story books', 'Hand puppets', 'Comfortable seating'],
      learning_objectives: ['Language development', 'Listening skills', 'Imagination'],
      date: '2024-03-15',
      time: '10:30',
      status: 'in_progress',
      children_participating: 6,
      child_name: 'Liam Chen'
    },
    {
      id: '3',
      title: 'Outdoor Nature Walk',
      description: 'Exploration of the playground and garden area',
      category: 'outdoor',
      age_group: 'all',
      duration: 45,
      materials: ['Magnifying glasses', 'Collection bags', 'Nature guide'],
      learning_objectives: ['Observation skills', 'Nature appreciation', 'Physical activity'],
      date: '2024-03-16',
      time: '14:00',
      status: 'planned',
      children_participating: 10,
      child_name: 'Emma Johnson'
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setActivities(dummyActivities)
    setLoading(false)
  }, [])

  const filteredActivities = activities.filter(activity => {
    const matchesDate = activity.date === selectedDate
    const matchesChild = selectedChild === 'all' || activity.child_name === selectedChild
    return matchesDate && matchesChild
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'art': return <Palette className="h-4 w-4" />
      case 'music': return <Music className="h-4 w-4" />
      case 'reading': return <BookOpen className="h-4 w-4" />
      case 'games': return <Gamepad2 className="h-4 w-4" />
      case 'outdoor': return <Activity className="h-4 w-4" />
      case 'science': return <Activity className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'secondary'
      case 'in_progress': return 'default'
      case 'completed': return 'outline'
      default: return 'secondary'
    }
  }

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case 'infant': return 'bg-blue-100 text-blue-800'
      case 'toddler': return 'bg-green-100 text-green-800'
      case 'preschool': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (role !== 'parent') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Parent privileges required.</p>
        </div>
      </div>
    )
  }

  // Get unique children names for filter (fix for Set iteration error)
  const childrenNames = Array.from(new Set(activities.map(a => a.child_name)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            Planned Activities
          </h1>
          <p className="text-gray-600 mt-2">
            View planned activities for your children
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold">{activities.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Today's Activities</p>
                  <p className="text-2xl font-bold">
                    {activities.filter(a => a.date === selectedDate).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {activities.length > 0 
                      ? Math.round(activities.reduce((sum, a) => sum + a.duration, 0) / activities.length)
                      : 0
                    } min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {activities.filter(a => a.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Children</option>
              {childrenNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activities planned for this date</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(activity.category)}
                      <div>
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {activity.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(activity.status) as any}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAgeGroupColor(activity.age_group)}`}>
                        {activity.age_group}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activity.time} ({activity.duration} min)</span>
                    </div>
                    <div className="flex items-center">
                      <Baby className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activity.child_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activity.children_participating} children</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Materials Needed:</h4>
                    <div className="flex flex-wrap gap-1">
                      {activity.materials.map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {activity.learning_objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {activity.status === 'completed' && (
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Completed!</strong> Your child participated in this activity today.
                      </p>
                    </div>
                  )}
                  
                  {activity.status === 'in_progress' && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>In Progress!</strong> Your child is currently participating in this activity.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 