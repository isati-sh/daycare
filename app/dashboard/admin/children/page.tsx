'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Baby, 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Shield,
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle,
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
  teacher_name: string | null
  allergies: string[] | null
  medical_notes: string | null
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
      teacher_name: 'Sarah Johnson',
      allergies: ['peanuts', 'dairy'],
      medical_notes: 'Asthma - uses inhaler as needed',
      enrollment_date: '2024-01-15',
      status: 'active',
      emergency_contact: '+1 (555) 999-8888'
    },
    {
      id: '2',
      first_name: 'Liam',
      last_name: 'Chen',
      date_of_birth: '2020-08-22',
      age_group: 'preschool',
      parent_name: 'Maria Garcia',
      parent_email: 'parent2@example.com',
      teacher_name: 'Michael Chen',
      allergies: null,
      medical_notes: null,
      enrollment_date: '2024-02-01',
      status: 'active',
      emergency_contact: '+1 (555) 888-7777'
    },
    {
      id: '3',
      first_name: 'Sophia',
      last_name: 'Wilson',
      date_of_birth: '2022-01-10',
      age_group: 'infant',
      parent_name: 'David Wilson',
      parent_email: 'parent3@example.com',
      teacher_name: 'Emily Davis',
      allergies: ['eggs'],
      medical_notes: 'Premature birth - special monitoring',
      enrollment_date: '2024-01-25',
      status: 'active',
      emergency_contact: '+1 (555) 777-6666'
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setChildren(dummyChildren)
    setLoading(false)
  }, [])

  const resetForm = () => {
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
  }

  const handleAddChild = () => {
    if (!childForm.first_name || !childForm.last_name || !childForm.parent_email) {
      toast.error('Please fill in required fields')
      return
    }

    const newChild: Child = {
      id: Date.now().toString(),
      first_name: childForm.first_name,
      last_name: childForm.last_name,
      date_of_birth: childForm.date_of_birth,
      age_group: childForm.age_group,
      parent_name: childForm.parent_name,
      parent_email: childForm.parent_email,
      teacher_name: childForm.teacher_name || null,
      allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
      medical_notes: childForm.medical_notes || null,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: childForm.status,
      emergency_contact: childForm.emergency_contact || null
    }

    setChildren([...children, newChild])
    resetForm()
    setShowAddForm(false)
    toast.success('Child added successfully!')
  }

  const handleEditChild = (child: Child) => {
    setEditingChild(child)
    setChildForm({
      first_name: child.first_name,
      last_name: child.last_name,
      date_of_birth: child.date_of_birth,
      age_group: child.age_group,
      parent_name: child.parent_name,
      parent_email: child.parent_email,
      teacher_name: child.teacher_name || '',
      allergies: child.allergies ? child.allergies.join(', ') : '',
      medical_notes: child.medical_notes || '',
      emergency_contact: child.emergency_contact || '',
      status: child.status
    })
    setShowEditForm(true)
  }

  const handleUpdateChild = () => {
    if (!editingChild) return

    if (!childForm.first_name || !childForm.last_name || !childForm.parent_email) {
      toast.error('Please fill in required fields')
      return
    }

    const updatedChild: Child = {
      ...editingChild,
      first_name: childForm.first_name,
      last_name: childForm.last_name,
      date_of_birth: childForm.date_of_birth,
      age_group: childForm.age_group,
      parent_name: childForm.parent_name,
      parent_email: childForm.parent_email,
      teacher_name: childForm.teacher_name || null,
      allergies: childForm.allergies ? childForm.allergies.split(',').map(a => a.trim()) : null,
      medical_notes: childForm.medical_notes || null,
      emergency_contact: childForm.emergency_contact || null,
      status: childForm.status
    }

    setChildren(children.map(c => c.id === editingChild.id ? updatedChild : c))
    resetForm()
    setShowEditForm(false)
    setEditingChild(null)
    toast.success('Child updated successfully!')
  }

  const filteredChildren = children.filter(child => {
    const matchesSearch = 
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGroup = filterGroup === 'all' || child.age_group === filterGroup
    
    return matchesSearch && matchesGroup
  })

  const handleStatusChange = async (childId: string, newStatus: string) => {
    try {
      // Update child status in database
      const { error } = await client
        .from('children')
        .update({ status: newStatus })
        .eq('id', childId)

      if (error) {
        toast.error('Failed to update child status')
        return
      }

      // Update local state
      setChildren(prev => prev.map(child => 
        child.id === childId 
          ? { ...child, status: newStatus as any }
          : child
      ))

      toast.success(`Child status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update child status')
    }
  }

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`Are you sure you want to delete ${childName}?`)) {
      return
    }

    try {
      // Delete child from database
      const { error } = await client
        .from('children')
        .delete()
        .eq('id', childId)

      if (error) {
        toast.error('Failed to delete child')
        return
      }

      // Update local state
      setChildren(prev => prev.filter(child => child.id !== childId))
      toast.success('Child deleted successfully')
    } catch (error) {
      toast.error('Failed to delete child')
    }
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <Baby className="h-10 w-10 mr-4 text-blue-600" />
                Children Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage enrolled children and their comprehensive information
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Children</p>
                <p className="text-2xl font-bold text-blue-600">{children.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Children</p>
                  <p className="text-3xl font-bold mt-1">{children.length}</p>
                  <p className="text-blue-200 text-xs mt-1">All enrolled</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Baby className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Children</p>
                  <p className="text-3xl font-bold mt-1">{children.filter(c => c.status === 'active').length}</p>
                  <p className="text-green-200 text-xs mt-1">Currently enrolled</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average Age</p>
                  <p className="text-3xl font-bold mt-1">
                    {children.length > 0 
                      ? Math.round(children.reduce((sum, c) => sum + getAge(c.date_of_birth), 0) / children.length)
                      : 0
                    }
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Years old</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">With Allergies</p>
                  <p className="text-3xl font-bold mt-1">
                    {children.filter(c => c.allergies && c.allergies.length > 0).length}
                  </p>
                  <p className="text-orange-200 text-xs mt-1">Require attention</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search children by name or parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-lg"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Age Groups</option>
                    <option value="infant">Infants (0-1 years)</option>
                    <option value="toddler">Toddlers (1-3 years)</option>
                    <option value="preschool">Preschool (3-5 years)</option>
                  </select>
                </div>
                
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Child
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading children...</p>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Baby className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No children found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Child
              </Button>
            </div>
          ) : (
            filteredChildren.map((child) => (
              <Card key={child.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {child.first_name[0]}{child.last_name[0]}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {child.first_name} {child.last_name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 flex items-center mt-1">
                          <Users className="h-4 w-4 mr-1" />
                          {child.parent_name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={getStatusColor(child.status) as any} className="font-medium">
                        {child.status}
                      </Badge>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getAgeGroupColor(child.age_group)}`}>
                        {child.age_group}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{getAge(child.date_of_birth)} years</p>
                        <p className="text-gray-500 text-xs">Age</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      <div>
                        <p className="font-medium text-gray-900">{child.teacher_name || 'Unassigned'}</p>
                        <p className="text-gray-500 text-xs">Teacher</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm bg-blue-50 p-3 rounded-lg">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{child.parent_email}</p>
                      <p className="text-gray-500 text-xs">Parent Email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm bg-purple-50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">{new Date(child.enrollment_date).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-xs">Enrolled</p>
                    </div>
                  </div>
                  
                  {child.allergies && child.allergies.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900 text-sm">Allergies</p>
                          <p className="text-red-700 text-sm">{child.allergies.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {child.medical_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Shield className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900 text-sm">Medical Notes</p>
                          <p className="text-yellow-800 text-sm">{child.medical_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditChild(child)}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteChild(child.id, `${child.first_name} ${child.last_name}`)}
                      className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Enhanced Add Child Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Baby className="h-7 w-7 mr-3" />
                      Add New Child
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                      Complete the form below to enroll a new child in the daycare
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          First Name
                        </label>
                        <Input
                          value={childForm.first_name}
                          onChange={(e) => setChildForm({...childForm, first_name: e.target.value})}
                          placeholder="Enter child's first name"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Last Name
                        </label>
                        <Input
                          value={childForm.last_name}
                          onChange={(e) => setChildForm({...childForm, last_name: e.target.value})}
                          placeholder="Enter child's last name"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={childForm.date_of_birth}
                          onChange={(e) => setChildForm({...childForm, date_of_birth: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Baby className="h-4 w-4 mr-2 text-purple-500" />
                          Age Group
                        </label>
                        <select
                          value={childForm.age_group}
                          onChange={(e) => setChildForm({...childForm, age_group: e.target.value as any})}
                          className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base bg-white"
                        >
                          <option value="infant">👶 Infant (0-12 months)</option>
                          <option value="toddler">🧒 Toddler (1-3 years)</option>
                          <option value="preschool">👦 Preschool (3-5 years)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Parent Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Parent/Guardian Name
                        </label>
                        <Input
                          value={childForm.parent_name}
                          onChange={(e) => setChildForm({...childForm, parent_name: e.target.value})}
                          placeholder="Enter parent's full name"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <Mail className="h-4 w-4 mr-1 text-green-500" />
                          Parent Email
                        </label>
                        <Input
                          type="email"
                          value={childForm.parent_email}
                          onChange={(e) => setChildForm({...childForm, parent_email: e.target.value})}
                          placeholder="parent@example.com"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Care Information Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      Care Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          Assigned Teacher
                        </label>
                        <Input
                          value={childForm.teacher_name}
                          onChange={(e) => setChildForm({...childForm, teacher_name: e.target.value})}
                          placeholder="Teacher assignment (optional)"
                          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          Emergency Contact
                        </label>
                        <Input
                          value={childForm.emergency_contact}
                          onChange={(e) => setChildForm({...childForm, emergency_contact: e.target.value})}
                          placeholder="Emergency contact number"
                          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Health & Safety Information
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          Known Allergies
                        </label>
                        <Input
                          value={childForm.allergies}
                          onChange={(e) => setChildForm({...childForm, allergies: e.target.value})}
                          placeholder="e.g., peanuts, dairy, eggs (separate with commas)"
                          className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg text-base"
                        />
                        <p className="text-xs text-gray-500">Separate multiple allergies with commas</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-500" />
                          Medical Notes & Conditions
                        </label>
                        <textarea
                          value={childForm.medical_notes}
                          onChange={(e) => setChildForm({...childForm, medical_notes: e.target.value})}
                          placeholder="Any medical conditions, medications, or special care instructions..."
                          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg h-24 text-base resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleAddChild}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Child to Daycare
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      resetForm()
                    }}
                    className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Edit Child Form Modal */}
        {showEditForm && editingChild && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Edit className="h-7 w-7 mr-3" />
                      Edit Child Information
                    </CardTitle>
                    <CardDescription className="text-green-100 mt-2 text-base">
                      Update {editingChild.first_name} {editingChild.last_name}'s information
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingChild(null)
                      resetForm()
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          First Name
                        </label>
                        <Input
                          value={childForm.first_name}
                          onChange={(e) => setChildForm({...childForm, first_name: e.target.value})}
                          placeholder="Enter child's first name"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Last Name
                        </label>
                        <Input
                          value={childForm.last_name}
                          onChange={(e) => setChildForm({...childForm, last_name: e.target.value})}
                          placeholder="Enter child's last name"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          value={childForm.date_of_birth}
                          onChange={(e) => setChildForm({...childForm, date_of_birth: e.target.value})}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Baby className="h-4 w-4 mr-2 text-purple-500" />
                          Age Group
                        </label>
                        <select
                          value={childForm.age_group}
                          onChange={(e) => setChildForm({...childForm, age_group: e.target.value as any})}
                          className="w-full h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base bg-white"
                        >
                          <option value="infant">👶 Infant (0-12 months)</option>
                          <option value="toddler">🧒 Toddler (1-3 years)</option>
                          <option value="preschool">👦 Preschool (3-5 years)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Status & Parent Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-600" />
                      Parent Information & Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Parent/Guardian Name
                        </label>
                        <Input
                          value={childForm.parent_name}
                          onChange={(e) => setChildForm({...childForm, parent_name: e.target.value})}
                          placeholder="Enter parent's full name"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <Mail className="h-4 w-4 mr-1 text-green-500" />
                          Parent Email
                        </label>
                        <Input
                          type="email"
                          value={childForm.parent_email}
                          onChange={(e) => setChildForm({...childForm, parent_email: e.target.value})}
                          placeholder="parent@example.com"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-green-500" />
                          Enrollment Status
                        </label>
                        <select
                          value={childForm.status}
                          onChange={(e) => setChildForm({...childForm, status: e.target.value as any})}
                          className="w-full h-12 px-4 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base bg-white"
                        >
                          <option value="active">✅ Active</option>
                          <option value="inactive">⏸️ Inactive</option>
                          <option value="waitlist">⏳ Waitlist</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Care Information Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      Care Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-purple-500" />
                          Assigned Teacher
                        </label>
                        <Input
                          value={childForm.teacher_name}
                          onChange={(e) => setChildForm({...childForm, teacher_name: e.target.value})}
                          placeholder="Teacher assignment (optional)"
                          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          Emergency Contact
                        </label>
                        <Input
                          value={childForm.emergency_contact}
                          onChange={(e) => setChildForm({...childForm, emergency_contact: e.target.value})}
                          placeholder="Emergency contact number"
                          className="h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Information Section */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Health & Safety Information
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                          Known Allergies
                        </label>
                        <Input
                          value={childForm.allergies}
                          onChange={(e) => setChildForm({...childForm, allergies: e.target.value})}
                          placeholder="e.g., peanuts, dairy, eggs (separate with commas)"
                          className="h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg text-base"
                        />
                        <p className="text-xs text-gray-500">Separate multiple allergies with commas</p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-500" />
                          Medical Notes & Conditions
                        </label>
                        <textarea
                          value={childForm.medical_notes}
                          onChange={(e) => setChildForm({...childForm, medical_notes: e.target.value})}
                          placeholder="Any medical conditions, medications, or special care instructions..."
                          className="w-full px-4 py-3 border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg h-24 text-base resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleUpdateChild}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Update Child Information
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingChild(null)
                      resetForm()
                    }}
                    className="flex-1 h-12 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 