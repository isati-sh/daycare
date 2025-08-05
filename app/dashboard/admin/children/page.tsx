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

type Child = Database['public']['Tables']['children']['Row'] & {
  parent_name: string | null
  parent_email: string
  parent_phone: string | null
  teacher_name: string | null
  enrollment_date: string
  status: 'active' | 'inactive' | 'waitlist'
  emergency_contact: string | null
}

export default function AdminChildrenPage() {
  const { user, client, isAdmin } = useSupabase()
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
    parent_name: '',
    parent_email: '',
    teacher_name: '',
    allergies: '',
    medical_notes: '',
    emergency_contact: '',
    status: 'active' as 'active' | 'inactive' | 'waitlist'
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
      
      // Fetch all children with parent and teacher information
      const { data: childrenData, error } = await client
        .from('children_with_parents')
        .select('*')

      if (error) {
        console.error('Error fetching children:', error)
        return
      }

      // Transform the data to match our interface
      const transformedChildren = childrenData?.map(child => ({
        ...child,
        id: child.child_id,
        enrollment_date: child.enrollment_date,
        status: child.status,
        emergency_contact: child.emergency_contact
      })) || []

      setChildren(transformedChildren)
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (child.parent_name && child.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (child.teacher_name && child.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterGroup === 'all' || child.age_group === filterGroup
    
    return matchesSearch && matchesFilter
  })

  const handleAddChild = async () => {
    if (!user || !client) return

    try {
      // First, find or create the parent profile
      let parentId = null
      
      if (childForm.parent_email) {
        const { data: existingParent } = await client
          .from('profiles')
          .select('id')
          .eq('email', childForm.parent_email)
          .single()

        if (existingParent) {
          parentId = existingParent.id
        } else {
          // Create new parent profile
          const { data: newParent, error: parentError } = await client
            .from('profiles')
            .insert({
              email: childForm.parent_email,
              full_name: childForm.parent_name,
              site_role: 'parent'
            })
            .select('id')
            .single()

          if (parentError) {
            console.error('Error creating parent:', parentError)
            return
          }
          parentId = newParent.id
        }
      }

      // Find teacher by name
      let teacherId = null
      if (childForm.teacher_name) {
        const { data: teacher } = await client
          .from('profiles')
          .select('id')
          .eq('full_name', childForm.teacher_name)
          .eq('site_role', 'teacher')
          .single()

        if (teacher) {
          teacherId = teacher.id
        }
      }

      // Create the child
      const { error } = await client
        .from('children')
        .insert({
          first_name: childForm.first_name,
          last_name: childForm.last_name,
          date_of_birth: childForm.date_of_birth,
          age_group: childForm.age_group,
          parent_id: parentId,
          teacher_id: teacherId,
          allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
          medical_notes: childForm.medical_notes || null,
          emergency_contact: childForm.emergency_contact || null,
          status: childForm.status,
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
        parent_name: '',
        parent_email: '',
        teacher_name: '',
        allergies: '',
        medical_notes: '',
        emergency_contact: '',
        status: 'active'
      })
      fetchChildren()
    } catch (error) {
      console.error('Error adding child:', error)
    }
  }

  const handleEditChild = async () => {
    if (!editingChild || !client) return

    try {
      // Find teacher by name
      let teacherId = null
      if (childForm.teacher_name) {
        const { data: teacher } = await client
          .from('profiles')
          .select('id')
          .eq('full_name', childForm.teacher_name)
          .eq('site_role', 'teacher')
          .single()

        if (teacher) {
          teacherId = teacher.id
        }
      }

      const { error } = await client
        .from('children')
        .update({
          first_name: childForm.first_name,
          last_name: childForm.last_name,
          date_of_birth: childForm.date_of_birth,
          age_group: childForm.age_group,
          teacher_id: teacherId,
          allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
          medical_notes: childForm.medical_notes || null,
          emergency_contact: childForm.emergency_contact || null,
          status: childForm.status
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
        parent_name: '',
        parent_email: '',
        teacher_name: '',
        allergies: '',
        medical_notes: '',
        emergency_contact: '',
        status: 'active'
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
      parent_name: child.parent_name || '',
      parent_email: child.parent_email,
      teacher_name: child.teacher_name || '',
      allergies: child.allergies?.join(', ') || '',
      medical_notes: child.medical_notes || '',
      emergency_contact: child.emergency_contact || '',
      status: child.status
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'waitlist': return 'bg-yellow-100 text-yellow-800'
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Children</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Child</Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search children, parents, or teachers..."
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
                  <Badge className={getStatusColor(child.status)}>
                    {child.status}
                  </Badge>
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
                  <Label className="font-semibold">Teacher:</Label>
                  <p className="text-gray-600">
                    {child.teacher_name || 'Not assigned'}
                  </p>
                </div>

                <div>
                  <Label className="font-semibold">Enrollment Date:</Label>
                  <p className="text-gray-600">
                    {new Date(child.enrollment_date).toLocaleDateString()}
                  </p>
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
                    onClick={() => window.location.href = `/dashboard/admin/children/${child.id}`}
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
                <Label htmlFor="parent_name">Parent Name</Label>
                <Input
                  id="parent_name"
                  value={childForm.parent_name}
                  onChange={(e) => setChildForm({...childForm, parent_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={childForm.parent_email}
                  onChange={(e) => setChildForm({...childForm, parent_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="teacher_name">Teacher Name</Label>
                <Input
                  id="teacher_name"
                  value={childForm.teacher_name}
                  onChange={(e) => setChildForm({...childForm, teacher_name: e.target.value})}
                />
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
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={childForm.status}
                  onChange={(e) => setChildForm({...childForm, status: e.target.value as 'active' | 'inactive' | 'waitlist'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="waitlist">Waitlist</option>
                </select>
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
                <Label htmlFor="edit_teacher_name">Teacher Name</Label>
                <Input
                  id="edit_teacher_name"
                  value={childForm.teacher_name}
                  onChange={(e) => setChildForm({...childForm, teacher_name: e.target.value})}
                />
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
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <select
                  id="edit_status"
                  value={childForm.status}
                  onChange={(e) => setChildForm({...childForm, status: e.target.value as 'active' | 'inactive' | 'waitlist'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="waitlist">Waitlist</option>
                </select>
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
  )
} 