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
  AlertTriangle
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

  const handleAddTeacher = () => {
    if (!teacherForm.email || !teacherForm.full_name) {
      toast.error('Please fill in required fields')
      return
    }

    const newTeacher: Teacher = {
      id: Date.now().toString(),
      email: teacherForm.email,
      full_name: teacherForm.full_name,
      phone: teacherForm.phone || null,
      address: teacherForm.address || null,
      emergency_contact: teacherForm.emergency_contact || null,
      created_at: new Date().toISOString(),
      assigned_children: 0,
      active_status: teacherForm.active_status
    }

    setTeachers([...teachers, newTeacher])
    resetForm()
    setShowAddForm(false)
    toast.success('Teacher added successfully!')
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

  const handleUpdateTeacher = () => {
    if (!editingTeacher) return

    if (!teacherForm.email || !teacherForm.full_name) {
      toast.error('Please fill in required fields')
      return
    }

    const updatedTeacher: Teacher = {
      ...editingTeacher,
      email: teacherForm.email,
      full_name: teacherForm.full_name,
      phone: teacherForm.phone || null,
      address: teacherForm.address || null,
      emergency_contact: teacherForm.emergency_contact || null,
      active_status: teacherForm.active_status
    }

    setTeachers(teachers.map(t => t.id === editingTeacher.id ? updatedTeacher : t))
    resetForm()
    setShowEditForm(false)
    setEditingTeacher(null)
    toast.success('Teacher updated successfully!')
  }

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center">
                <Users className="h-10 w-10 mr-4 text-emerald-600" />
                Teacher Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Manage teaching staff and their assignments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Teachers</p>
                <p className="text-2xl font-bold text-emerald-600">{teachers.filter(t => t.active_status).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Teachers</p>
                  <p className="text-3xl font-bold mt-1">{teachers.length}</p>
                  <p className="text-emerald-200 text-xs mt-1">All staff members</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Teachers</p>
                  <p className="text-3xl font-bold mt-1">{teachers.filter(t => t.active_status).length}</p>
                  <p className="text-green-200 text-xs mt-1">Currently teaching</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Avg Children/Teacher</p>
                  <p className="text-3xl font-bold mt-1">
                    {teachers.length > 0 
                      ? Math.round(teachers.reduce((sum, t) => sum + t.assigned_children, 0) / teachers.length)
                      : 0
                    }
                  </p>
                  <p className="text-blue-200 text-xs mt-1">Student ratio</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">New This Month</p>
                  <p className="text-3xl font-bold mt-1">
                    {teachers.filter(t => {
                      const created = new Date(t.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Recent hires</p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Plus className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Actions */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search teachers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 text-lg"
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Teacher
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Teacher
              </Button>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {teacher.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {teacher.full_name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {teacher.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={teacher.active_status ? "default" : "secondary"} className={`font-medium ${
                      teacher.active_status 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {teacher.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                      <div>
                        <p className="font-medium text-gray-900">{teacher.phone || 'Not provided'}</p>
                        <p className="text-gray-500 text-xs">Phone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{teacher.assigned_children}</p>
                        <p className="text-gray-500 text-xs">Children</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm bg-purple-50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">{new Date(teacher.created_at).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-xs">Joined</p>
                    </div>
                  </div>
                  
                  {teacher.address && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Users className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900 text-sm">Address</p>
                          <p className="text-blue-700 text-sm">{teacher.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {teacher.emergency_contact && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-900 text-sm">Emergency Contact</p>
                          <p className="text-orange-800 text-sm">{teacher.emergency_contact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(teacher.id, !teacher.active_status)}
                      className={`flex-1 ${
                        teacher.active_status 
                          ? 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700' 
                          : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                      }`}
                    >
                      {teacher.active_status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTeacher(teacher)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Enhanced Add Teacher Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Users className="h-7 w-7 mr-3" />
                      Add New Teacher
                    </CardTitle>
                    <CardDescription className="text-emerald-100 mt-2 text-base">
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
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-emerald-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Full Name
                        </label>
                        <Input
                          value={teacherForm.full_name}
                          onChange={(e) => setTeacherForm({...teacherForm, full_name: e.target.value})}
                          placeholder="Enter teacher's full name"
                          className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <Mail className="h-4 w-4 mr-1 text-emerald-500" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                          placeholder="teacher@example.com"
                          className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-emerald-500" />
                          Phone Number
                        </label>
                        <Input
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                          placeholder="(555) 123-4567"
                          className="h-12 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Contact & Emergency Information
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Home Address
                        </label>
                        <Input
                          value={teacherForm.address}
                          onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                          placeholder="Enter complete home address"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                          Emergency Contact
                        </label>
                        <Input
                          value={teacherForm.emergency_contact}
                          onChange={(e) => setTeacherForm({...teacherForm, emergency_contact: e.target.value})}
                          placeholder="Emergency contact name and phone number"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                        <p className="text-xs text-gray-500">Include relationship and phone number (e.g., "Jane Doe (Sister) - (555) 987-6543")</p>
                      </div>
                    </div>
                  </div>

                  {/* Employment Status Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
                      Employment Status
                    </h3>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-purple-500" />
                        Active Status
                      </label>
                      <select
                        value={teacherForm.active_status.toString()}
                        onChange={(e) => setTeacherForm({...teacherForm, active_status: e.target.value === 'true'})}
                        className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base bg-white"
                      >
                        <option value="true">✅ Active - Currently employed</option>
                        <option value="false">⏸️ Inactive - Not currently active</option>
                      </select>
                      <p className="text-xs text-gray-500">Active teachers can be assigned to children and access the system</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleAddTeacher}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Teacher to Staff
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

        {/* Edit Teacher Form Modal */}
        {showEditForm && editingTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Teacher Information</CardTitle>
                <CardDescription>Update {editingTeacher.full_name}'s information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      value={teacherForm.full_name}
                      onChange={(e) => setTeacherForm({...teacherForm, full_name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Emergency Contact</label>
                    <Input
                      value={teacherForm.emergency_contact}
                      onChange={(e) => setTeacherForm({...teacherForm, emergency_contact: e.target.value})}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={teacherForm.address}
                      onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={teacherForm.active_status.toString()}
                      onChange={(e) => setTeacherForm({...teacherForm, active_status: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button onClick={handleUpdateTeacher}>
                    Update Teacher
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowEditForm(false)
                    setEditingTeacher(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
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