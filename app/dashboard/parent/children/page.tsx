'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export default function ParentChildrenPage() {
  const { user, client, role } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [childForm, setChildForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    age_group: 'toddler' as 'infant' | 'toddler' | 'preschool',
    allergies: '',
    medical_notes: '',
    emergency_contact: ''
  })

  useEffect(() => {
    if (user && client) {
      fetchChildren()
    }
  }, [user, client])

  const fetchChildren = async () => {
    if (!user || !client) return

    try {
      setLoading(true)
      
      // Fetch children with parent and teacher information
      const { data: childrenData, error } = await client
        .from('children_with_parents')
        .select('*')
        .eq('parent_id', user.id)
        .eq('status', 'active')

      if (error) {
        console.error('Error fetching children:', error)
        return
      }

      // Fetch today's attendance for mood information
      const today = new Date().toISOString().split('T')[0]
      const { data: attendanceData, error: attendanceError } = await client
        .from('attendance')
        .select('child_id, status')
        .eq('date', today)

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError)
      }

      // Fetch today's daily logs for mood information
      const { data: dailyLogsData, error: logsError } = await client
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
  }

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterGroup === 'all' || child.age_group === filterGroup
    
    return matchesSearch && matchesFilter
  })

  const handleAddChild = async () => {
    if (!user || !client) return

    try {
      const { error } = await client
        .from('children')
        .insert({
          first_name: childForm.first_name,
          last_name: childForm.last_name,
          date_of_birth: childForm.date_of_birth,
          age_group: childForm.age_group,
          parent_id: user.id,
          allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
          medical_notes: childForm.medical_notes || null,
          emergency_contact: childForm.emergency_contact || null,
          status: 'active',
          enrollment_date: new Date().toISOString().split('T')[0]
        })

      if (error) {
        console.error('Error adding child:', error)
        return
      }

      setShowAddForm(false)
      setChildForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        age_group: 'toddler',
        allergies: '',
        medical_notes: '',
        emergency_contact: ''
      })
      fetchChildren()
    } catch (error) {
      console.error('Error adding child:', error)
    }
  }

  const handleEditChild = async () => {
    if (!editingChild || !client) return

    try {
      const { error } = await client
        .from('children')
        .update({
          first_name: childForm.first_name,
          last_name: childForm.last_name,
          date_of_birth: childForm.date_of_birth,
          age_group: childForm.age_group,
          allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
          medical_notes: childForm.medical_notes || null,
          emergency_contact: childForm.emergency_contact || null
        })
        .eq('id', editingChild.id)

      if (error) {
        console.error('Error updating child:', error)
        return
      }

      setShowEditForm(false)
      setEditingChild(null)
      setChildForm({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        age_group: 'toddler',
        allergies: '',
        medical_notes: '',
        emergency_contact: ''
      })
      fetchChildren()
    } catch (error) {
      console.error('Error updating child:', error)
    }
  }

  const openEditForm = (child: Child) => {
    setEditingChild(child)
    setChildForm({
      first_name: child.first_name,
      last_name: child.last_name,
      date_of_birth: child.date_of_birth,
      age_group: child.age_group,
      allergies: child.allergies?.join(', ') || '',
      medical_notes: child.medical_notes || '',
      emergency_contact: child.emergency_contact || ''
    })
    setShowEditForm(true)
  }

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
    <RoleGuard path="/dashboard/parent/children">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Children</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Child</Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search children..."
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
                  <Label className="font-semibold">Teacher:</Label>
                  <p className="text-gray-600">
                    {child.teacher_name || 'Not assigned'}
                  </p>
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
                    onClick={() => openEditForm(child)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/dashboard/parent/children/${child.id}`}
                  >
                    View Details
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

      {/* Add Child Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Child</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={childForm.first_name}
                  onChange={(e) => setChildForm({...childForm, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={childForm.last_name}
                  onChange={(e) => setChildForm({...childForm, last_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={childForm.date_of_birth}
                  onChange={(e) => setChildForm({...childForm, date_of_birth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="age_group">Age Group</Label>
                <select
                  id="age_group"
                  value={childForm.age_group}
                  onChange={(e) => setChildForm({...childForm, age_group: e.target.value as 'infant' | 'toddler' | 'preschool'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="infant">Infant</option>
                  <option value="toddler">Toddler</option>
                  <option value="preschool">Preschool</option>
                </select>
              </div>
              <div>
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  value={childForm.allergies}
                  onChange={(e) => setChildForm({...childForm, allergies: e.target.value})}
                  placeholder="peanuts, dairy, eggs"
                />
              </div>
              <div>
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea
                  id="medical_notes"
                  value={childForm.medical_notes}
                  onChange={(e) => setChildForm({...childForm, medical_notes: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={childForm.emergency_contact}
                  onChange={(e) => setChildForm({...childForm, emergency_contact: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddChild} className="flex-1">Add Child</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditForm && editingChild && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Child</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={childForm.first_name}
                  onChange={(e) => setChildForm({...childForm, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={childForm.last_name}
                  onChange={(e) => setChildForm({...childForm, last_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                <Input
                  id="edit_date_of_birth"
                  type="date"
                  value={childForm.date_of_birth}
                  onChange={(e) => setChildForm({...childForm, date_of_birth: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_age_group">Age Group</Label>
                <select
                  id="edit_age_group"
                  value={childForm.age_group}
                  onChange={(e) => setChildForm({...childForm, age_group: e.target.value as 'infant' | 'toddler' | 'preschool'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="infant">Infant</option>
                  <option value="toddler">Toddler</option>
                  <option value="preschool">Preschool</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit_allergies">Allergies (comma-separated)</Label>
                <Input
                  id="edit_allergies"
                  value={childForm.allergies}
                  onChange={(e) => setChildForm({...childForm, allergies: e.target.value})}
                  placeholder="peanuts, dairy, eggs"
                />
              </div>
              <div>
                <Label htmlFor="edit_medical_notes">Medical Notes</Label>
                <Textarea
                  id="edit_medical_notes"
                  value={childForm.medical_notes}
                  onChange={(e) => setChildForm({...childForm, medical_notes: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_emergency_contact">Emergency Contact</Label>
                <Input
                  id="edit_emergency_contact"
                  value={childForm.emergency_contact}
                  onChange={(e) => setChildForm({...childForm, emergency_contact: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditChild} className="flex-1">Update Child</Button>
              <Button variant="outline" onClick={() => setShowEditForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </RoleGuard>
  )
} 