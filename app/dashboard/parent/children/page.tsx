'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Baby, 
  Calendar, 
  Users, 
  Shield,
  Edit,
  AlertTriangle,
  Phone,
  Mail,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getAge } from '@/lib/utils'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  teacher_name: string | null
  allergies: string[] | null
  medical_notes: string | null
  enrollment_date: string
  status: 'active' | 'inactive' | 'waitlist'
  emergency_contact: string | null
  last_daily_log: string | null
  attendance_this_week: number
  total_attendance_days: number
}

export default function ParentChildrenPage() {
  const { user, client, role } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  // Dummy data for testing
  const dummyChildren: Child[] = [
    {
      id: '1',
      first_name: 'Emma',
      last_name: 'Johnson',
      date_of_birth: '2021-03-15',
      age_group: 'toddler',
      teacher_name: 'Sarah Johnson',
      allergies: ['peanuts', 'dairy'],
      medical_notes: 'Asthma - uses inhaler as needed',
      enrollment_date: '2024-01-15',
      status: 'active',
      emergency_contact: '+1 (555) 999-8888',
      last_daily_log: '2024-03-15T16:30:00Z',
      attendance_this_week: 5,
      total_attendance_days: 45
    },
    {
      id: '2',
      first_name: 'Liam',
      last_name: 'Chen',
      date_of_birth: '2020-08-22',
      age_group: 'preschool',
      teacher_name: 'Michael Chen',
      allergies: null,
      medical_notes: null,
      enrollment_date: '2024-02-01',
      status: 'active',
      emergency_contact: '+1 (555) 888-7777',
      last_daily_log: '2024-03-15T16:45:00Z',
      attendance_this_week: 4,
      total_attendance_days: 32
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setChildren(dummyChildren)
    setLoading(false)
  }, [])

  const handleEnrollChild = () => {
    // Navigate to enrollment form
    window.location.href = '/dashboard/enroll'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'waitlist': return 'destructive'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Baby className="h-8 w-8 mr-3" />
            My Children
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your children's information and enrollment
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Enrolled Children</p>
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
                  <p className="text-sm text-gray-600">Active Children</p>
                  <p className="text-2xl font-bold">{children.filter(c => c.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold">
                    {children.length > 0 
                      ? Math.round(children.reduce((sum, c) => sum + c.attendance_this_week, 0) / children.length)
                      : 0
                    } days/week
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

        {/* Add Child Button */}
        <div className="mb-6">
          <Button onClick={handleEnrollChild}>
            <Plus className="h-4 w-4 mr-2" />
            Enroll New Child
          </Button>
        </div>

        {/* Children List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading children...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No children enrolled yet</p>
              <Button className="mt-4" onClick={handleEnrollChild}>
                <Plus className="h-4 w-4 mr-2" />
                Enroll Your First Child
              </Button>
            </div>
          ) : (
            children.map((child) => (
              <Card key={child.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{child.first_name} {child.last_name}</CardTitle>
                      <CardDescription className="mt-1">
                        Teacher: {child.teacher_name || 'Unassigned'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={getStatusColor(child.status) as any}>
                        {child.status}
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
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Attendance: {child.attendance_this_week}/5 days this week</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Enrolled: {new Date(child.enrollment_date).toLocaleDateString()}</span>
                  </div>
                  
                  {child.last_daily_log && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Last update: {new Date(child.last_daily_log).toLocaleDateString()}</span>
                    </div>
                  )}
                  
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
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/portfolio?child=${child.id}`}
                    >
                      View Portfolio
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/dashboard/reports?child=${child.id}`}
                    >
                      View Reports
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit child info */}}
                    >
                      <Edit className="h-3 w-3" />
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