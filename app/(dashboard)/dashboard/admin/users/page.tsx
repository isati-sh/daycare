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
import { UserPlus, Mail, Shield, Users, BookOpen, Baby, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function AdminUsersPage() {
  const { user, isAdmin } = useSupabase()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    site_role: 'parent' as 'admin' | 'teacher' | 'parent'
  })

  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact: ''
  })
  const [inviting, setInviting] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        toast.error('Failed to load users')
        return
      }

      setUsers(usersData || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchUsers()
    }
  }, [user, fetchUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterRole === 'all' || user.site_role === filterRole
    
    return matchesSearch && matchesFilter
  })

  const handleSendInvitation = async () => {
    if (!inviteForm.email || !inviteForm.full_name) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setInviting(true)
      const supabase = createClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteForm.email)
        .single()

      if (existingUser) {
        toast.error('User with this email already exists')
        return
      }

      // Create a temporary user record with invitation status
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: inviteForm.email,
          full_name: inviteForm.full_name,
          site_role: inviteForm.site_role,
          active_status: false,
          email_verified: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        toast.error('Failed to create user profile')
        return
      }

      // Send invitation using regular signup invite (simpler approach)
      // This creates an invitation link that the user can use to set their password
      const inviteUrl = `${window.location.origin}/register?email=${encodeURIComponent(inviteForm.email)}&invited=true`
      
      // TODO: In a real application, you would send this via email service
      // For now, we'll just show the link to the admin
      navigator.clipboard.writeText(inviteUrl).then(() => {
        toast.success(`Invitation created! Invite link copied to clipboard: ${inviteUrl}`)
      }).catch(() => {
        toast.success(`Invitation created! Share this link: ${inviteUrl}`)
      })

      setShowInviteForm(false)
      setInviteForm({
        email: '',
        full_name: '',
        site_role: 'parent'
      })
      fetchUsers()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const resendInvitation = async (userEmail: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.admin.inviteUserByEmail(userEmail, {
        redirectTo: `${window.location.origin}/register`
      })

      if (error) {
        console.error('Error resending invitation:', error)
        toast.error(`Failed to resend invitation: ${error.message}`)
        return
      }

      toast.success('Invitation resent successfully!')
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast.error('Failed to resend invitation')
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'teacher' | 'parent') => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ 
          site_role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user role:', error)
        toast.error('Failed to update user role')
        return
      }

      toast.success('User role updated successfully!')
      setShowRoleForm(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const deactivateUser = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    
    try {
      const supabase = createClient()
      const updateData: any = {
        active_status: !currentStatus,
        updated_at: new Date().toISOString()
      }

      // If deactivating, also remove the role
      if (currentStatus) {
        updateData.site_role = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) {
        console.error(`Error ${action}ing user:`, error)
        toast.error(`Failed to ${action} user`)
        return
      }

      toast.success(`User ${action}d successfully!`)
      fetchUsers()
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(`Failed to ${action} user`)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      emergency_contact: user.emergency_contact || ''
    })
    setShowEditForm(true)
  }

  const updateUser = async () => {
    if (!editingUser) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          emergency_contact: editForm.emergency_contact,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (error) {
        console.error('Error updating user:', error)
        toast.error('Failed to update user')
        return
      }

      toast.success('User updated successfully!')
      setShowEditForm(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />
      case 'teacher': return <BookOpen className="h-4 w-4" />
      case 'parent': return <Baby className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'teacher': return 'bg-blue-100 text-blue-800'
      case 'parent': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage all users and send invitations</p>
        </div>
        <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {user.full_name || 'No Name'}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={getRoleColor(user.site_role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.site_role)}
                      {user.site_role || 'No Role'}
                    </div>
                  </Badge>
                  <Badge className={user.email_verified && user.active_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {user.email_verified && user.active_status ? 'Active' : user.email_verified ? 'Pending Activation' : 'Pending Verification'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="font-semibold">Joined:</Label>
                  <p className="text-gray-600 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <Label className="font-semibold">Last Sign In:</Label>
                  <p className="text-gray-600 text-sm">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>

                {(!user.email_verified || !user.active_status) && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendInvitation(user.email)}
                      className="w-full"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {!user.email_verified ? 'Resend Invitation' : 'Activate Account'}
                    </Button>
                  </div>
                )}

                {!user.site_role && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user)
                        setShowRoleForm(true)
                      }}
                      className="w-full"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Assign Role
                    </Button>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {user.site_role && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user)
                        setShowRoleForm(true)
                      }}
                      className="flex-1"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Change Role
                    </Button>
                  )}
                </div>
                
                {/* Deactivate/Activate Button */}
                <div className="pt-2">
                  <Button
                    variant={user.active_status ? "destructive" : "default"}
                    size="sm"
                    onClick={() => deactivateUser(user.id, user.active_status)}
                    className="w-full"
                  >
                    {user.active_status ? 'Deactivate User' : 'Activate User'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No users found.</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
          )}
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Invite New User</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite_email">Email Address *</Label>
                <Input
                  id="invite_email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  placeholder="user@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="invite_name">Full Name *</Label>
                <Input
                  id="invite_name"
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({...inviteForm, full_name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="invite_role">Role *</Label>
                <select
                  id="invite_role"
                  value={inviteForm.site_role}
                  onChange={(e) => setInviteForm({...inviteForm, site_role: e.target.value as 'admin' | 'teacher' | 'parent'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={handleSendInvitation} 
                disabled={inviting}
                className="flex-1"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInviteForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Role to {editingUser.full_name}</h2>
            <p className="text-gray-600 mb-4">Select a role for {editingUser.email}</p>
            <div className="space-y-3">
              <Button
                onClick={() => updateUserRole(editingUser.id, 'parent')}
                className="w-full justify-start"
                variant="outline"
              >
                <Baby className="h-4 w-4 mr-2" />
                Parent
              </Button>
              <Button
                onClick={() => updateUserRole(editingUser.id, 'teacher')}
                className="w-full justify-start"
                variant="outline"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Teacher
              </Button>
              <Button
                onClick={() => updateUserRole(editingUser.id, 'admin')}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRoleForm(false)
                  setEditingUser(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Full Name *</Label>
                <Input
                  id="edit_name"
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email *</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit_address">Address</Label>
                <Input
                  id="edit_address"
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="edit_emergency">Emergency Contact</Label>
                <Input
                  id="edit_emergency"
                  type="text"
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm({...editForm, emergency_contact: e.target.value})}
                  placeholder="Enter emergency contact"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={updateUser}
                className="flex-1"
              >
                Update User
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditForm(false)
                  setEditingUser(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
