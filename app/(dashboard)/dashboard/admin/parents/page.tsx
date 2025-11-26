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
  Baby,
  Contact
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
  const { user, client } = useSupabase()
  const [parents, setParents] = useState<Parent[]>([])
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [parentForm, setParentForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: '',
    active_status: true
  })

  useEffect(() => {
    if (user && client) {
      Promise.all([fetchParents(), fetchUnassignedUsers()]).finally(() => {
        setLoading(false)
      })
    }
  }, [user, client])

  const fetchParents = async () => {
    if (!client) return

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('site_role', 'parent')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching parents:', error)
        toast.error('Failed to load parents')
        return
      }

      // Fetch children count for each parent separately
      const parentsWithCounts = await Promise.all(
        (data || []).map(async (parent: any) => {
          const { data: childrenData, error: childrenError } = await client
            .from('children')
            .select('id')
            .eq('parent_id', parent.id)
            .eq('status', 'active')

          if (childrenError) {
            console.error('Error fetching children for parent:', childrenError)
          }

          return {
            ...parent,
            children_count: childrenData?.length || 0
          }
        })
      )

      setParents(parentsWithCounts)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load parents')
    }
  }

  const fetchUnassignedUsers = async () => {
    if (!client) return

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .is('site_role', null)
        .eq('active_status', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching unassigned users:', error)
        return
      }

      setUnassignedUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resetForm = () => {
    setSelectedUserId('')
    setParentForm({
      email: '',
      full_name: '',
      phone: '',
      address: '',
      emergency_contact: '',
      active_status: true
    })
  }

  const handleAddParent = async () => {
    if (!client || !selectedUserId) {
      toast.error('Please select a user to assign as parent')
      return
    }

    try {
      // Update the selected user's profile to assign parent role
      const { error } = await client
        .from('profiles')
        .update({ 
          site_role: 'parent',
          phone: parentForm.phone || null,
          address: parentForm.address || null,
          emergency_contact: parentForm.emergency_contact || null
        })
        .eq('id', selectedUserId)

      if (error) {
        console.error('Error assigning parent role:', error)
        toast.error('Failed to assign parent role')
        return
      }

      toast.success('Parent role assigned successfully')
      setShowAddForm(false)
      setSelectedUserId('')
      resetForm()
      fetchParents() // Refresh the list
      fetchUnassignedUsers() // Refresh unassigned users
    } catch (error) {
      console.error('Error assigning parent role:', error)
      toast.error('Failed to assign parent role')
    }
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

  const handleUpdateParent = async () => {
    if (!client || !editingParent) return

    try {
      const { error } = await client
        .from('profiles')
        .update({
          email: parentForm.email,
          full_name: parentForm.full_name,
          phone: parentForm.phone || null,
          address: parentForm.address || null,
          emergency_contact: parentForm.emergency_contact || null,
          active_status: parentForm.active_status
        })
        .eq('id', editingParent.id)

      if (error) {
        console.error('Error updating parent:', error)
        toast.error('Failed to update parent')
        return
      }

      toast.success('Parent updated successfully')
      setShowEditForm(false)
      setEditingParent(null)
      resetForm()
      fetchParents() // Refresh the list
    } catch (error) {
      console.error('Error updating parent:', error)
      toast.error('Failed to update parent')
    }
  }

  const handleStatusChange = async (parentId: string, newStatus: boolean) => {
    if (!client) return

    try {
      const { error } = await client
        .from('profiles')
        .update({ active_status: newStatus })
        .eq('id', parentId)

      if (error) {
        console.error('Error updating parent status:', error)
        toast.error('Failed to update parent status')
        return
      }

      toast.success(`Parent ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchParents() // Refresh the list
    } catch (error) {
      console.error('Error updating parent status:', error)
      toast.error('Failed to update parent status')
    }
  }

  const handleDeleteParent = async (parentId: string, parentName: string) => {
    if (!client) return

    if (!confirm(`Are you sure you want to delete ${parentName}? This action cannot be undone.`)) {
      return
    }

    try {
      // Check if parent has children
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('id')
        .eq('parent_id', parentId)
        .eq('status', 'active')

      if (childrenError) {
        console.error('Error checking children:', childrenError)
        toast.error('Failed to check children')
        return
      }

      if (childrenData && childrenData.length > 0) {
        toast.error('Cannot delete parent with children. Please reassign children first.')
        return
      }

      const { error } = await client
        .from('profiles')
        .delete()
        .eq('id', parentId)

      if (error) {
        console.error('Error deleting parent:', error)
        toast.error('Failed to delete parent')
        return
      }

      toast.success('Parent deleted successfully')
      fetchParents() // Refresh the list
    } catch (error) {
      console.error('Error deleting parent:', error)
      toast.error('Failed to delete parent')
    }
  }

  const filteredParents = parents.filter(parent =>
    parent.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading parents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
            Manage Parents
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            View and manage all parents in the daycare system
          </p>
        </div>

        {/* Search and Add */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              placeholder="Search parents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
          <Button 
            onClick={() => {
              setShowAddForm(true)
              fetchUnassignedUsers()
            }}
            className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Add Parent
          </Button>
        </div>

        {/* Parents List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredParents.map((parent) => (
            <Card key={parent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                      {parent.full_name}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                      {parent.email}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={parent.active_status ? "default" : "secondary"}
                    className="text-xs sm:text-sm"
                  >
                    {parent.active_status ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {parent.phone || 'No phone'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(parent.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Baby className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {parent.children_count} children
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditParent(parent)}
                    className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={parent.active_status ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleStatusChange(parent.id, !parent.active_status)}
                    className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {parent.active_status ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteParent(parent.id, parent.full_name)}
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

        {filteredParents.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No parents found' : 'No parents yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add your first parent to get started'
              }
            </p>
          </div>
        )}

        {/* Add Parent Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-2xl sm:max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3" />
                      Add New Parent
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-2 text-sm sm:text-base">
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
                    className="text-white hover:bg-white/20 rounded-full p-1 sm:p-2"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="space-y-6 sm:space-y-8">
                  {/* User Selection Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                      Select User to Assign as Parent
                    </h3>
                    
                    {unassignedUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No unassigned users available</p>
                        <p className="text-sm text-gray-400">All users already have roles assigned</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {unassignedUsers.map((user) => (
                          <div
                            key={user.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedUserId === user.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{user.full_name}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                {user.phone && (
                                  <p className="text-xs text-gray-500">{user.phone}</p>
                                )}
                              </div>
                              {selectedUserId === user.id && (
                                <div className="flex-shrink-0">
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <UserCheck className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Contact Information (Optional) */}
                  {selectedUserId && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-xl border border-purple-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <Contact className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                        Additional Contact Information (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Phone Number
                          </label>
                          <Input
                            value={parentForm.phone}
                            onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                            placeholder="+1 (555) 123-4567"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Emergency Contact
                          </label>
                          <Input
                            value={parentForm.emergency_contact}
                            onChange={(e) => setParentForm({...parentForm, emergency_contact: e.target.value})}
                            placeholder="Emergency contact number"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3 md:col-span-2">
                          <label className="text-xs sm:text-sm font-semibold text-gray-700">
                            Address
                          </label>
                          <Input
                            value={parentForm.address}
                            onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                            placeholder="Enter full address"
                            className="h-10 sm:h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg text-sm sm:text-base"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={handleAddParent}
                      disabled={!selectedUserId}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Assign Parent Role
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

        {/* Edit Parent Modal */}
        {showEditForm && editingParent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-2xl sm:max-w-4xl max-h-[90vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-md">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center">
                      <Edit className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 mr-2 sm:mr-3" />
                      Edit Parent Information
                    </CardTitle>
                    <CardDescription className="text-green-100 mt-2 text-sm sm:text-base">
                      Update the information for {editingParent.full_name}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setShowEditForm(false)
                      setEditingParent(null)
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
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3 md:col-span-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Full Name
                        </label>
                        <Input
                          value={parentForm.full_name}
                          onChange={(e) => setParentForm({...parentForm, full_name: e.target.value})}
                          placeholder="Enter parent's full name"
                          className="h-10 sm:h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-sm sm:text-base"
                        />
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          Email Address
                        </label>
                        <Input
                          value={parentForm.email}
                          onChange={(e) => setParentForm({...parentForm, email: e.target.value})}
                          placeholder="parent@example.com"
                          className="h-10 sm:h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-sm sm:text-base"
                        />
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">
                          Phone Number
                        </label>
                        <Input
                          value={parentForm.phone}
                          onChange={(e) => setParentForm({...parentForm, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          className="h-10 sm:h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl border border-teal-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                      <Contact className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-teal-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2 sm:space-y-3 md:col-span-2">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">
                          Address
                        </label>
                        <Input
                          value={parentForm.address}
                          onChange={(e) => setParentForm({...parentForm, address: e.target.value})}
                          placeholder="Enter full address"
                          className="h-10 sm:h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg text-sm sm:text-base"
                        />
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700">
                          Emergency Contact
                        </label>
                        <Input
                          value={parentForm.emergency_contact}
                          onChange={(e) => setParentForm({...parentForm, emergency_contact: e.target.value})}
                          placeholder="Emergency contact number"
                          className="h-10 sm:h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg text-sm sm:text-base"
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
                            checked={parentForm.active_status}
                            onChange={(e) => setParentForm({...parentForm, active_status: e.target.checked})}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="edit_active_status" className="text-xs sm:text-sm text-gray-700">
                            Active parent
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                    <Button 
                      onClick={handleUpdateParent}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white transition-all duration-300"
                    >
                      Update Parent
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowEditForm(false)
                        setEditingParent(null)
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
  )
} 