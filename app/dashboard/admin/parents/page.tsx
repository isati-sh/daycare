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
  Baby
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Parent {
  id: string
  email: string
  full_name: string
  phone: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  children_count: number
  active_status: boolean
  last_login: string | null
}

export default function AdminParentsPage() {
  const { user, client, isAdmin } = useSupabase()
  const [parents, setParents] = useState<Parent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [parentForm, setParentForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    active_status: true
  })

  // Dummy data for testing
  const dummyParents: Parent[] = [
    {
      id: '1',
      email: 'parent1@example.com',
      full_name: 'John Smith',
      phone: '+1 (555) 111-2222',
      address: '123 Parent St, City, State',
      emergency_contact: '+1 (555) 999-8888',
      created_at: '2024-01-10',
      children_count: 2,
      active_status: true,
      last_login: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      email: 'parent2@example.com',
      full_name: 'Maria Garcia',
      phone: '+1 (555) 222-3333',
      address: '456 Family Ave, City, State',
      emergency_contact: '+1 (555) 888-7777',
      created_at: '2024-02-05',
      children_count: 1,
      active_status: true,
      last_login: '2024-03-14T15:45:00Z'
    },
    {
      id: '3',
      email: 'parent3@example.com',
      full_name: 'David Wilson',
      phone: '+1 (555) 333-4444',
      address: '789 Home Rd, City, State',
      emergency_contact: '+1 (555) 777-6666',
      created_at: '2024-01-25',
      children_count: 3,
      active_status: false,
      last_login: '2024-03-10T09:15:00Z'
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setParents(dummyParents)
    setLoading(false)
  }, [])

  const resetForm = () => {
    setParentForm({
      email: '',
      full_name: '',
      phone: '',
      address: '',
      emergency_contact: '',
      active_status: true
    })
  }

  const handleAddParent = () => {
    if (!parentForm.email || !parentForm.full_name) {
      toast.error('Please fill in required fields')
      return
    }

    const newParent: Parent = {
      id: Date.now().toString(),
      email: parentForm.email,
      full_name: parentForm.full_name,
      phone: parentForm.phone || null,
      address: parentForm.address || null,
      emergency_contact: parentForm.emergency_contact || null,
      created_at: new Date().toISOString(),
      children_count: 0,
      active_status: parentForm.active_status,
      last_login: null
    }

    setParents([...parents, newParent])
    resetForm()
    setShowAddForm(false)
    toast.success('Parent added successfully!')
  }

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent)
    setParentForm({
      email: parent.email,
      full_name: parent.full_name,
      phone: parent.phone || '',
      address: parent.address || '',
      emergency_contact: parent.emergency_contact || '',
      active_status: parent.active_status
    })
    setShowEditForm(true)
  }

  const handleUpdateParent = () => {
    if (!editingParent) return

    if (!parentForm.email || !parentForm.full_name) {
      toast.error('Please fill in required fields')
      return
    }

    const updatedParent: Parent = {
      ...editingParent,
      email: parentForm.email,
      full_name: parentForm.full_name,
      phone: parentForm.phone || null,
      address: parentForm.address || null,
      emergency_contact: parentForm.emergency_contact || null,
      active_status: parentForm.active_status
    }

    setParents(parents.map(p => p.id === editingParent.id ? updatedParent : p))
    resetForm()
    setShowEditForm(false)
    setEditingParent(null)
    toast.success('Parent updated successfully!')
  }

  const filteredParents = parents.filter(parent =>
    parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = async (parentId: string, newStatus: boolean) => {
    try {
      // Update parent status in database
      const { error } = await client
        .from('profiles')
        .update({ active_status: newStatus })
        .eq('id', parentId)

      if (error) {
        toast.error('Failed to update parent status')
        return
      }

      // Update local state
      setParents(prev => prev.map(parent => 
        parent.id === parentId 
          ? { ...parent, active_status: newStatus }
          : parent
      ))

      toast.success(`Parent ${newStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error('Failed to update parent status')
    }
  }

  const handleDeleteParent = async (parentId: string, parentName: string) => {
    if (!confirm(`Are you sure you want to delete ${parentName}?`)) {
      return
    }

    try {
      // Delete parent from database
      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', parentId)

      if (error) {
        toast.error('Failed to delete parent')
        return
      }

      // Update local state
      setParents(prev => prev.filter(parent => parent.id !== parentId))
      toast.success('Parent deleted successfully')
    } catch (error) {
      toast.error('Failed to delete parent')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold flex items-center mb-3">
                  <Users className="h-10 w-10 mr-4" />
                  Parent Management
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage parents and their families with comprehensive oversight
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Parents</p>
                  <p className="text-3xl font-bold mt-2">{parents.length}</p>
                  <p className="text-blue-200 text-xs mt-1">Registered families</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Active Parents</p>
                  <p className="text-3xl font-bold mt-2">{parents.filter(p => p.active_status).length}</p>
                  <p className="text-emerald-200 text-xs mt-1">Currently active</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Children</p>
                  <p className="text-3xl font-bold mt-2">
                    {parents.reduce((sum, p) => sum + p.children_count, 0)}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">Under care</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Baby className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Children/Parent</p>
                  <p className="text-3xl font-bold mt-2">
                    {parents.length > 0 
                      ? (parents.reduce((sum, p) => sum + p.children_count, 0) / parents.length).toFixed(1)
                      : 0
                    }
                  </p>
                  <p className="text-orange-200 text-xs mt-1">Family size ratio</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search parents by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-0 shadow-lg bg-white/80 backdrop-blur-sm focus:bg-white focus:shadow-xl transition-all duration-300"
              />
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="h-5 w-5 mr-2" />
            Add New Parent
          </Button>
        </div>

        {/* Enhanced Parents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading parents...</p>
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No parents found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Parent
              </Button>
            </div>
          ) : (
            filteredParents.map((parent) => (
              <Card key={parent.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {parent.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          {parent.full_name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {parent.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={parent.active_status ? "default" : "secondary"} className={`font-medium ${
                      parent.active_status 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {parent.active_status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Phone className="h-4 w-4 mr-2 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{parent.phone || 'Not provided'}</p>
                        <p className="text-gray-500 text-xs">Phone</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm bg-gray-50 p-3 rounded-lg">
                      <Baby className="h-4 w-4 mr-2 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">{parent.children_count}</p>
                        <p className="text-gray-500 text-xs">Children</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm bg-green-50 p-3 rounded-lg">
                    <Calendar className="h-4 w-4 mr-2 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{new Date(parent.created_at).toLocaleDateString()}</p>
                      <p className="text-gray-500 text-xs">Joined</p>
                    </div>
                  </div>
                  
                  {parent.last_login && (
                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Calendar className="h-4 w-4 text-indigo-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-indigo-900 text-sm">Last Login</p>
                          <p className="text-indigo-700 text-sm">{new Date(parent.last_login).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {parent.address && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Users className="h-4 w-4 text-orange-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-900 text-sm">Address</p>
                          <p className="text-orange-800 text-sm">{parent.address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {parent.emergency_contact && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-900 text-sm">Emergency Contact</p>
                          <p className="text-red-800 text-sm">{parent.emergency_contact}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(parent.id, !parent.active_status)}
                      className={`flex-1 ${
                        parent.active_status 
                          ? 'hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700' 
                          : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                      }`}
                    >
                      {parent.active_status ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditParent(parent)}
                      className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteParent(parent.id, parent.full_name)}
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

        {/* Enhanced Add Parent Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Users className="h-7 w-7 mr-3" />
                      Add New Parent
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-base">
                      Complete the form below to add a new parent to the daycare system
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Full Name
                        </label>
                        <Input
                          value={parentForm.full_name}
                          onChange={(e) => setParentForm({...parentForm, full_name: e.target.value})}
                          placeholder="Enter parent's full name"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <Mail className="h-4 w-4 mr-1 text-blue-500" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={parentForm.email}
                          onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                          placeholder="parent@example.com"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          Phone Number
                        </label>
                        <Input
                          value={parentForm.phone}
                          onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                          placeholder="(555) 123-4567"
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      Contact & Address Information
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-green-500" />
                          Home Address
                        </label>
                        <Input
                          value={parentForm.address}
                          onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                          placeholder="Enter complete home address"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-orange-500" />
                          Emergency Contact
                        </label>
                        <Input
                          value={parentForm.emergency_contact}
                          onChange={(e) => setParentForm({...parentForm, emergency_contact: e.target.value})}
                          placeholder="Emergency contact name and phone number"
                          className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-base"
                        />
                        <p className="text-xs text-gray-500">Include relationship and phone number (e.g., "John Smith (Spouse) - (555) 987-6543")</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
                      Account Status
                    </h3>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-purple-500" />
                        Active Status
                      </label>
                      <select
                        value={parentForm.active_status.toString()}
                        onChange={(e) => setParentForm({...parentForm, active_status: e.target.value === 'true'})}
                        className="w-full h-12 px-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-base bg-white"
                      >
                        <option value="true">✅ Active - Can access parent portal</option>
                        <option value="false">⏸️ Inactive - Limited access</option>
                      </select>
                      <p className="text-xs text-gray-500">Active parents can log in to view their children's information and communicate with teachers</p>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Baby className="h-5 w-5 mr-2 text-yellow-600" />
                      Family Information
                    </h3>
                    <div className="bg-yellow-100 border border-yellow-300 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-900 text-sm">Next Steps</p>
                          <p className="text-yellow-800 text-sm">After adding this parent, you can enroll their children through the Children Management page.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleAddParent}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Parent to System
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

        {/* Edit Parent Form Modal */}
        {showEditForm && editingParent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Edit Parent Information</CardTitle>
                <CardDescription>Update {editingParent.full_name}'s information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input
                      value={parentForm.full_name}
                      onChange={(e) => setParentForm({...parentForm, full_name: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={parentForm.email}
                      onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      value={parentForm.phone}
                      onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Emergency Contact</label>
                    <Input
                      value={parentForm.emergency_contact}
                      onChange={(e) => setParentForm({...parentForm, emergency_contact: e.target.value})}
                      placeholder="Enter emergency contact"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={parentForm.address}
                      onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      value={parentForm.active_status.toString()}
                      onChange={(e) => setParentForm({...parentForm, active_status: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button onClick={handleUpdateParent}>
                    Update Parent
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowEditForm(false)
                    setEditingParent(null)
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
  )
} 