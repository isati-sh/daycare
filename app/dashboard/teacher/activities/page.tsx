'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Activity, 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Shield,
  Edit,
  Trash2,
  BookOpen,
  Music,
  Palette,
  Gamepad2
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
}

export default function TeacherActivitiesPage() {
  const { user, client, role } = useSupabase()
  const [activities, setActivities] = useState<PlannedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

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
      children_participating: 8
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
      children_participating: 6
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
      children_participating: 10
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setActivities(dummyActivities)
    setLoading(false)
  }, [])

  const filteredActivities = activities.filter(activity => 
    activity.date === selectedDate
  )

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

  const handleStatusChange = async (activityId: string, newStatus: string) => {
    try {
      // Update activity status in database
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, status: newStatus as any }
          : activity
      ))

      toast.success('Activity status updated')
    } catch (error) {
      toast.error('Failed to update activity status')
    }
  }

  const handleDeleteActivity = async (activityId: string, activityTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${activityTitle}"?`)) {
      return
    }

    try {
      // Delete activity from database
      setActivities(prev => prev.filter(activity => activity.id !== activityId))
      toast.success('Activity deleted successfully')
    } catch (error) {
      toast.error('Failed to delete activity')
    }
  }

  if (role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Teacher privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="h-8 w-8 mr-3" />
            Plan Activities
          </h1>
          <p className="text-gray-600 mt-2">
            Plan and manage educational activities for your students
          </p>
        </div>

        {/* Date Selector and Add Button */}
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
          <div className="flex items-end">
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Add Activity Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Activity</CardTitle>
              <CardDescription>
                Plan a new educational activity for your students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Title
                  </label>
                  <Input placeholder="Enter activity title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="art">Art & Crafts</option>
                    <option value="music">Music & Movement</option>
                    <option value="reading">Reading & Language</option>
                    <option value="games">Games & Play</option>
                    <option value="outdoor">Outdoor Activities</option>
                    <option value="science">Science & Discovery</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea placeholder="Describe the activity..." rows={3} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="all">All Ages</option>
                    <option value="infant">Infants</option>
                    <option value="toddler">Toddlers</option>
                    <option value="preschool">Preschool</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <Input type="number" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <Input type="time" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>Save Activity</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
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
                      <Badge variant="outline">
                        {activity.age_group}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{activity.time} ({activity.duration} min)</span>
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
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(activity.id, 'in_progress')}
                      disabled={activity.status === 'in_progress'}
                    >
                      Start Activity
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(activity.id, 'completed')}
                      disabled={activity.status === 'completed'}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit activity */}}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteActivity(activity.id, activity.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 