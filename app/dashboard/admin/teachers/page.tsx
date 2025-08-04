'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Shield,
  UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import RoleGuard from '@/components/guards/roleGuard'

interface Teacher {
  id: string
  email: string
  full_name: string
  phone: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  assigned_children: number
  active_status: boolean
}

export default function AdminTeachersPage() {
  const { user, client, isAdmin } = useSupabase()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Dummy data for testing
  const dummyTeachers: Teacher[] = [
    {
      id: '1',
      email: 'teacher1@daycare.com',
      full_name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State',
      emergency_contact: '+1 (555) 987-6543',
      created_at: '2024-01-15',
      assigned_children: 8,
      active_status: true
    },
    {
      id: '2',
      email: 'teacher2@daycare.com',
      full_name: 'Michael Chen',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, City, State',
      emergency_contact: '+1 (555) 876-5432',
      created_at: '2024-02-01',
      assigned_children: 6,
      active_status: true
    },
    {
      id: '3',
      email: 'teacher3@daycare.com',
      full_name: 'Emily Davis',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, City, State',
      emergency_contact: '+1 (555) 765-4321',
      created_at: '2024-01-20',
      assigned_children: 10,
      active_status: false
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setTeachers(dummyTeachers)
    setLoading(false)
  }, [])

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = async (teacherId: string, newStatus: boolean) => {
    try {
      // Update teacher status in database
      const { error } = await client
        .from('profiles')
        .update({ active_status: newStatus })
        .eq('id', teacherId)

      if (error) {
        toast.error('Failed to update teacher status')
        return
      }

      // Update local state
      setTeachers(prev => prev.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, active_status: newStatus }
          : teacher
      ))

      toast.success(`Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update teacher status')
    }
  }

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return
    }

    try {
      // Delete teacher from database
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', teacherId)

      if (error) {
        toast.error('Failed to delete teacher')
        return
      }

      // Update local state
      setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId))
      toast.success('Teacher deleted successfully')
    } catch (error) {
      toast.error('Failed to delete teacher')
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
    <RoleGuard path="/dashboard/admin/teachers">
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            Teacher Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage teachers and their assignments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Teachers</p>
                  <p className="text-2xl font-bold">{teachers.filter(t => t.active_status).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Children/Teacher</p>
                  <p className="text-2xl font-bold">
                    {teachers.length > 0 
                      ? Math.round(teachers.reduce((sum, t) => sum + t.assigned_children, 0) / teachers.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold">
                    {teachers.filter(t => {
                      const created = new Date(t.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button asChild>
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Teacher
            </div>
          </Button>
        </div>

        {/* Teachers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No teachers found</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{teacher.full_name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {teacher.email}
                      </CardDescription>
                    </div>
                    <Badge variant={teacher.active_status ? "default" : "secondary"}>
                      {teacher.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{teacher.phone || 'No phone'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Assigned: {teacher.assigned_children} children</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Joined: {new Date(teacher.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(teacher.id, !teacher.active_status)}
                    >
                      {teacher.active_status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit teacher */}}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
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
    </RoleGuard>
  )
} 