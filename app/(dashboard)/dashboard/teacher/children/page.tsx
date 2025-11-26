'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database } from '@/types/database'
import RoleGuard from '@/components/guards/roleGuard'

type Child = Database['public']['Tables']['children']['Row'] & {
  parent_name: string | null
  parent_email: string
  parent_phone: string | null
  teacher_name: string | null
  attendance_today: boolean
  mood_today: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited' | null
}

export default function TeacherChildrenPage() {
  const { user, role } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')

  const fetchChildren = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch children assigned to this teacher
      const { data: childrenData, error } = await supabase
        .from('children_with_parents')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching children:', error)
        setLoading(false)
        return
      }

      // Fetch today's attendance for mood information
      const today = new Date().toISOString().split('T')[0]
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('child_id, status')
        .eq('date', today)

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError)
      }

      // Fetch today's daily logs for mood information
      const { data: dailyLogsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('child_id, mood')
        .eq('date', today)

      if (logsError) {
        console.error('Error fetching daily logs:', logsError)
      }

      // Combine the data
      const childrenWithAttendance = childrenData?.map(child => {
        const attendance = attendanceData?.find(a => a.child_id === child.child_id)
        const dailyLog = dailyLogsData?.find(d => d.child_id === child.child_id)
        
        return {
          ...child,
          id: child.child_id,
          attendance_today: attendance?.status === 'present',
          mood_today: dailyLog?.mood || null
        }
      }) || []

      setChildren(childrenWithAttendance)
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchChildren()
    }
  }, [user, fetchChildren])

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.parent_name && child.parent_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterGroup === 'all' || child.age_group === filterGroup
    
    return matchesSearch && matchesFilter
  })

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case 'infant': return 'bg-blue-100 text-blue-800'
      case 'toddler': return 'bg-green-100 text-green-800'
      case 'preschool': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'happy': return 'bg-green-100 text-green-800'
      case 'sad': return 'bg-blue-100 text-blue-800'
      case 'tired': return 'bg-yellow-100 text-yellow-800'
      case 'energetic': return 'bg-orange-100 text-orange-800'
      case 'fussy': return 'bg-red-100 text-red-800'
      case 'excited': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading children...</div>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/teacher/children">
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Children</h1>
        <div className="text-sm text-gray-600">
          {children.length} children assigned
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search children or parents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Ages</option>
          <option value="infant">Infant</option>
          <option value="toddler">Toddler</option>
          <option value="preschool">Preschool</option>
        </select>
      </div>

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChildren.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    {child.first_name} {child.last_name}
                  </CardTitle>
                  <p className="text-gray-600">
                    Age: {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} years old
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getAgeGroupColor(child.age_group)}>
                    {child.age_group}
                  </Badge>
                  {child.mood_today && (
                    <Badge className={getMoodColor(child.mood_today)}>
                      {child.mood_today}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="font-semibold">Parent:</Label>
                  <p className="text-gray-600">
                    {child.parent_name || 'Unknown'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {child.parent_email}
                  </p>
                  {child.parent_phone && (
                    <p className="text-gray-500 text-sm">
                      {child.parent_phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label className="font-semibold">Today's Status:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${child.attendance_today ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={child.attendance_today ? 'text-green-600' : 'text-gray-500'}>
                      {child.attendance_today ? 'Present' : 'Not checked in'}
                    </span>
                  </div>
                </div>

                {child.allergies && child.allergies.length > 0 && (
                  <div>
                    <Label className="font-semibold">Allergies:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {child.allergies.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {child.medical_notes && (
                  <div>
                    <Label className="font-semibold">Medical Notes:</Label>
                    <p className="text-gray-600 text-sm mt-1">{child.medical_notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/teacher/children/${child.id}`}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/teacher/daily-reports?child=${child.id}`}
                  >
                    Daily Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChildren.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No children found.</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
          )}
        </div>
      )}
      </div>
    </RoleGuard>
  )
} 