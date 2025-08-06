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
  UserCheck,
  AlertTriangle,
  Contact
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
  const { user, client } = useSupabase()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [teacherForm, setTeacherForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    active_status: true
  })

  useEffect(() => {
    if (user && client) {
      fetchTeachers()
    }
  }, [user, client])

  const fetchTeachers = async () => {
    if (!user || !client) return

    try {
      setLoading(true)

      // Fetch teachers from profiles table
      const { data: teachersData, error: teachersError } = await client
        .from('profiles')
        .select('*')
        .eq('site_role', 'teacher')
        .order('created_at', { ascending: false })
      
      console.log(teachersData, 'teachersData')

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError)
        toast.error('Failed to load teachers')
        return
      }

      // Fetch assigned children count for each teacher
      const teachersWithChildrenCount = await Promise.all(
        teachersData.map(async (teacher) => {
          const { data: childrenData, error: childrenError } = await client
            .from('children')
            .select('id')
            .eq('teacher_id', teacher.id)
            .eq('status', 'active')

          if (childrenError) {
            console.error('Error fetching children for teacher:', childrenError)
          }

          return {
            id: teacher.id,
            email: teacher.email,
            full_name: teacher.full_name,
            phone: teacher.phone,
            address: teacher.address,
            emergency_contact: teacher.emergency_contact,
            created_at: teacher.created_at,
            assigned_children: childrenData?.length || 0,
            active_status: teacher.active_status
          }
        })
      )

      setTeachers(teachersWithChildrenCount)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTeacherForm({
      email: '',
      full_name: '',
      phone: '',
      address: '',
      emergency_contact: '',
      active_status: true
    })
  }

  const handleAddTeacher = async () => {
    if (!client) return

    try {
      // Validate required fields
      if (!teacherForm.email || !teacherForm.full_name) {
        toast.error('Email and full name are required')
        return
      }

      // Create new teacher profile
      const { data, error } = await client
        .from('profiles')
        .insert({
          email: teacherForm.email,
          full_name: teacherForm.full_name,
          phone: teacherForm.phone || null,
          address: teacherForm.address || null,
          emergency_contact: teacherForm.emergency_contact || null,
          active_status: teacherForm.active_status,
          site_role: 'teacher'
        })
        .select()

      if (error) {
        console.error('Error adding teacher:', error)
        toast.error('Failed to add teacher')
        return
      }

      toast.success('Teacher added successfully')
      setShowAddForm(false)
      resetForm()
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error adding teacher:', error)
      toast.error('Failed to add teacher')
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setTeacherForm({
      email: teacher.email,
      full_name: teacher.full_name,
      phone: teacher.phone || '',
      address: teacher.address || '',
      emergency_contact: teacher.emergency_contact || '',
      active_status: teacher.active_status
    })
    setShowEditForm(true)
  }

  const handleUpdateTeacher = async () => {
    if (!client || !editingTeacher) return

    try {
      const { error } = await client
        .from('profiles')
        .update({
          email: teacherForm.email,
          full_name: teacherForm.full_name,
          phone: teacherForm.phone || null,
          address: teacherForm.address || null,
          emergency_contact: teacherForm.emergency_contact || null,
          active_status: teacherForm.active_status
        })
        .eq('id', editingTeacher.id)

      if (error) {
        console.error('Error updating teacher:', error)
        toast.error('Failed to update teacher')
        return
      }

      toast.success('Teacher updated successfully')
      setShowEditForm(false)
      setEditingTeacher(null)
      resetForm()
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error updating teacher:', error)
      toast.error('Failed to update teacher')
    }
  }

  const handleStatusChange = async (teacherId: string, newStatus: boolean) => {
    if (!client) return

    try {
      const { error } = await client
        .from('profiles')
        .update({ active_status: newStatus })
        .eq('id', teacherId)

      if (error) {
        console.error('Error updating teacher status:', error)
        toast.error('Failed to update teacher status')
        return
      }

      toast.success(`Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error updating teacher status:', error)
      toast.error('Failed to update teacher status')
    }
  }

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!client) return

    if (!confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`)) {
      return
    }

    try {
      // Check if teacher has assigned children
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('status', 'active')

      if (childrenError) {
        console.error('Error checking assigned children:', childrenError)
        toast.error('Failed to check assigned children')
        return
      }

      if (childrenData && childrenData.length > 0) {
        toast.error('Cannot delete teacher with assigned children. Please reassign children first.')
        return
      }

      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', teacherId)

      if (error) {
        console.error('Error deleting teacher:', error)
        toast.error('Failed to delete teacher')
        return
      }

      toast.success('Teacher deleted successfully')
      fetchTeachers() // Refresh the list
    } catch (error) {
      console.error('Error deleting teacher:', error)
      toast.error('Failed to delete teacher')
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/admin/teachers">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-2 sm:mr-3" />
              Manage Teachers
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              View and manage all teachers in the daycare system
            </p>
          </div>

          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Teacher
            </Button>
          </div>

          {/* Teachers List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                        {teacher.full_name}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                        {teacher.email}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={teacher.active_status ? "default" : "secondary"}
                      className="text-xs sm:text-sm"
                    >
                      {teacher.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {teacher.phone || 'No phone'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(teacher.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span className="text-xs sm:text-sm text-gray-600">
                      {teacher.assigned_children} assigned children
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTeacher(teacher)}
                      className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={teacher.active_status ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleStatusChange(teacher.id, !teacher.active_status)}
                      className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                    >
                      {teacher.active_status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
                      className="flex-1 h-8 sm:h-10 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No teachers found' : 'No teachers yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first teacher to get started'
                }
              </p>
            </div>
          )}

          {/* Add Teacher Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <Card className="w-full max-w-2xl sm:max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3" />
                        Add New Teacher
                      </CardTitle>
                      <CardDescription className="text-emerald-100 mt-2 text-sm sm:text-base">
                        Complete the form below to add a new teacher to the daycare
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowAddForm(false)
                        resetForm()
                      }}
                      className="text-white hover:bg-white/20 rounded-full p-1 sm:p-2"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-emerald-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 md:col-span-2">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                            <span className="text-red-500 mr-1">*</span>
                            Full Name
                          </label>
                          <Input
                            value={teacherForm.full_name}
                            onChange={(e) => setTeacherForm({...teacherForm, full_name: e.target.value})}
                            placeholder="Enter teacher's full name"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                            <span className="text-red-500 mr-1">*</span>
                            Email Address
                          </label>
                          <Input
                            value={teacherForm.email}
                            onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                            placeholder="teacher@daycare.com"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            value={teacherForm.phone}
                            onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                            placeholder="+1 (555) 123-4567"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <Contact className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 md:col-span-2">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Address
                          </label>
                          <Input
                            value={teacherForm.address}
                            onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                            placeholder="Enter full address"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Emergency Contact
                          </label>
                          <Input
                            value={teacherForm.emergency_contact}
                            onChange={(e) => setTeacherForm({...teacherForm, emergency_contact: e.target.value})}
                            placeholder="Emergency contact number"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Status
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="active_status"
                              checked={teacherForm.active_status}
                              onChange={(e) => setTeacherForm({...teacherForm, active_status: e.target.checked})}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="active_status" className="text-xs sm:text-sm text-gray-700">
                              Active teacher
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                      <Button 
                        onClick={handleAddTeacher}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300"
                      >
                        Add Teacher
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddForm(false)
                          resetForm()
                        }}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Edit Teacher Modal */}
          {showEditForm && editingTeacher && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
              <Card className="w-full max-w-2xl sm:max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                        <Edit className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3" />
                        Edit Teacher Information
                      </CardTitle>
                      <CardDescription className="text-blue-100 mt-2 text-sm sm:text-base">
                        Update the information for {editingTeacher.full_name}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setShowEditForm(false)
                        setEditingTeacher(null)
                        resetForm()
                      }}
                      className="text-white hover:bg-white/20 rounded-full p-1 sm:p-2"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 md:col-span-2">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                            <span className="text-red-500 mr-1">*</span>
                            Full Name
                          </label>
                          <Input
                            value={teacherForm.full_name}
                            onChange={(e) => setTeacherForm({...teacherForm, full_name: e.target.value})}
                            placeholder="Enter teacher's full name"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                            <span className="text-red-500 mr-1">*</span>
                            Email Address
                          </label>
                          <Input
                            value={teacherForm.email}
                            onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                            placeholder="teacher@daycare.com"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            value={teacherForm.phone}
                            onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                            placeholder="+1 (555) 123-4567"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <Contact className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3 md:col-span-2">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Address
                          </label>
                          <Input
                            value={teacherForm.address}
                            onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                            placeholder="Enter full address"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Emergency Contact
                          </label>
                          <Input
                            value={teacherForm.emergency_contact}
                            onChange={(e) => setTeacherForm({...teacherForm, emergency_contact: e.target.value})}
                            placeholder="Emergency contact number"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Status
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="edit_active_status"
                              checked={teacherForm.active_status}
                              onChange={(e) => setTeacherForm({...teacherForm, active_status: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="edit_active_status" className="text-xs sm:text-sm text-gray-700">
                              Active teacher
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                      <Button 
                        onClick={handleUpdateTeacher}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
                      >
                        Update Teacher
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowEditForm(false)
                          setEditingTeacher(null)
                          resetForm()
                        }}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  )
} 