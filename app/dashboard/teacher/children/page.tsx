'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Baby, 
  Search, 
  Calendar, 
  Users, 
  Shield,
  Edit,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAge } from '@/lib/utils'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  parent_name: string
  parent_email: string
  parent_phone: string
  allergies: string[] | null
  medical_notes: string | null
  emergency_contact: string | null
  attendance_today: boolean
  mood_today: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | null
}

export default function TeacherChildrenPage() {
  const { user, client, role } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')

  // Dummy data for testing
  const dummyChildren: Child[] = [
    {
      id: '1',
      first_name: 'Emma',
      last_name: 'Johnson',
      date_of_birth: '2021-03-15',
      age_group: 'toddler',
      parent_name: 'John Smith',
      parent_email: 'parent1@example.com',
      parent_phone: '+1 (555) 111-2222',
      allergies: ['peanuts', 'dairy'],
      medical_notes: 'Asthma - uses inhaler as needed',
      emergency_contact: '+1 (555) 999-8888',
      attendance_today: true,
      mood_today: 'happy'
    },
    {
      id: '2',
      first_name: 'Liam',
      last_name: 'Chen',
      date_of_birth: '2020-08-22',
      age_group: 'preschool',
      parent_name: 'Maria Garcia',
      parent_email: 'parent2@example.com',
      parent_phone: '+1 (555) 222-3333',
      allergies: null,
      medical_notes: null,
      emergency_contact: '+1 (555) 888-7777',
      attendance_today: true,
      mood_today: 'energetic'
    },
    {
      id: '3',
      first_name: 'Sophia',
      last_name: 'Wilson',
      date_of_birth: '2022-01-10',
      age_group: 'infant',
      parent_name: 'David Wilson',
      parent_email: 'parent3@example.com',
      parent_phone: '+1 (555) 333-4444',
      allergies: ['eggs'],
      medical_notes: 'Premature birth - special monitoring',
      emergency_contact: '+1 (555) 777-6666',
      attendance_today: false,
      mood_today: null
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setChildren(dummyChildren)
    setLoading(false)
  }, [])

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGroup = filterGroup === 'all' || child.age_group === filterGroup
    
    return matchesSearch && matchesGroup
  })

  const handleAttendanceToggle = async (childId: string) => {
    try {
      // Update attendance in database
      const child = children.find(c => c.id === childId)
      if (!child) return

      const newAttendance = !child.attendance_today
      
      // Update local state
      setChildren(prev => prev.map(c => 
        c.id === childId 
          ? { ...c, attendance_today: newAttendance }
          : c
      ))

      toast.success(`${child.first_name} marked as ${newAttendance ? 'present' : 'absent'}`)
    } catch (error) {
      toast.error('Failed to update attendance')
    }
  }

  const handleMoodUpdate = async (childId: string, mood: string) => {
    try {
      // Update mood in database
      setChildren(prev => prev.map(c => 
        c.id === childId 
          ? { ...c, mood_today: mood as any }
          : c
      ))

      toast.success('Mood updated successfully')
    } catch (error) {
      toast.error('Failed to update mood')
    }
  }

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return null
    
    switch (mood) {
      case 'happy':
        return <span className="text-green-500">😊</span>
      case 'sad':
        return <span className="text-blue-500">😢</span>
      case 'tired':
        return <span className="text-gray-500">😴</span>
      case 'energetic':
        return <span className="text-yellow-500">⚡</span>
      default:
        return <span className="text-gray-400">😐</span>
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
            <Baby className="h-8 w-8 mr-3" />
            My Students
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your assigned children and their daily information
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{children.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Present Today</p>
                  <p className="text-2xl font-bold">{children.filter(c => c.attendance_today).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Age</p>
                  <p className="text-2xl font-bold">
                    {children.length > 0 
                      ? Math.round(children.reduce((sum, c) => sum + getAge(c.date_of_birth), 0) / children.length)
                      : 0
                    } years
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">With Allergies</p>
                  <p className="text-2xl font-bold">
                    {children.filter(c => c.allergies && c.allergies.length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Age Groups</option>
            <option value="infant">Infants</option>
            <option value="toddler">Toddlers</option>
            <option value="preschool">Preschool</option>
          </select>
        </div>

        {/* Children List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No students found</p>
            </div>
          ) : (
            filteredChildren.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{child.first_name} {child.last_name}</CardTitle>
                      <CardDescription className="mt-1">
                        Parent: {child.parent_name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={child.attendance_today ? "default" : "secondary"}>
                        {child.attendance_today ? 'Present' : 'Absent'}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAgeGroupColor(child.age_group)}`}>
                        {child.age_group}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Age: {getAge(child.date_of_birth)} years old</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{child.parent_email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{child.parent_phone}</span>
                  </div>
                  
                  {child.allergies && child.allergies.length > 0 && (
                    <div className="flex items-start text-sm">
                      <AlertTriangle className="h-4 w-4 mr-2 text-red-500 mt-0.5" />
                      <span>Allergies: {child.allergies.join(', ')}</span>
                    </div>
                  )}
                  
                  {child.medical_notes && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                      <strong>Medical Notes:</strong> {child.medical_notes}
                    </div>
                  )}
                  
                  {/* Attendance and Mood Controls */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Attendance:</span>
                      <Button
                        size="sm"
                        variant={child.attendance_today ? "default" : "outline"}
                        onClick={() => handleAttendanceToggle(child.id)}
                      >
                        {child.attendance_today ? 'Present' : 'Absent'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mood:</span>
                      <div className="flex gap-1">
                        {['happy', 'sad', 'tired', 'energetic', 'neutral'].map((mood) => (
                          <button
                            key={mood}
                            onClick={() => handleMoodUpdate(child.id, mood)}
                            className={`p-1 rounded ${
                              child.mood_today === mood 
                                ? 'bg-primary-100 text-primary-800' 
                                : 'hover:bg-gray-100'
                            }`}
                            title={mood}
                          >
                            {getMoodIcon(mood)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* View child details */}}
                    >
                      <Edit className="h-3 w-3" />
                      View Details
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