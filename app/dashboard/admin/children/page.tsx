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
  AlertTriangle
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Baby className="h-8 w-8 mr-3" />
            Children Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage enrolled children and their information
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Children</p>
                  <p className="text-2xl font-bold">{children.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
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
                <Users className="h-8 w-8 text-purple-500 mr-3" />
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
                placeholder="Search children..."
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
          <Button asChild>
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Child
            </div>
          </Button>
        </div>

        {/* Children List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading children...</p>
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No children found</p>
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
                    <span>Teacher: {child.teacher_name || 'Unassigned'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Enrolled: {new Date(child.enrollment_date).toLocaleDateString()}</span>
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
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit child */}}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteChild(child.id, `${child.first_name} ${child.last_name}`)}
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