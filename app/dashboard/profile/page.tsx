'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield,
  Save,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  full_name: string | null
  site_role: 'parent' | 'teacher' | 'admin'
  phone: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user, client } = useSupabase()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    emergency_contact: ''
  })

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()
      if (error) throw error
      setProfile(data)
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        emergency_contact: data.emergency_contact || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [client, user?.id])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user, fetchProfile])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await client
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          emergency_contact: formData.emergency_contact
        })
        .eq('id', user?.id)

      if (error) throw error
      
      toast.success('Profile updated successfully')
      setEditing(false)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    try {
      const { error } = await client.auth.updateUser({
        password: passwordForm.new_password
      })

      if (error) throw error
      
      toast.success('Password updated successfully')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setShowPassword(false)
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'teacher':
        return 'bg-blue-100 text-blue-800'
      case 'parent':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Loading profile...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and settings
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your address"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        value={formData.emergency_contact}
                        onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                        placeholder="Enter emergency contact information"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Email:</span>
                      </div>
                      <span className="text-sm text-gray-900">{profile?.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Name:</span>
                      </div>
                      <span className="text-sm text-gray-900">{profile?.full_name || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Role:</span>
                      </div>
                      <Badge className={getRoleColor(profile?.site_role || '')}>
                        {profile?.site_role}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Phone:</span>
                      </div>
                      <span className="text-sm text-gray-900">{profile?.phone || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Address:</span>
                      </div>
                      <span className="text-sm text-gray-900">{profile?.address || 'Not provided'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Emergency Contact:</span>
                      </div>
                      <span className="text-sm text-gray-900">{profile?.emergency_contact || 'Not provided'}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Security Settings */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPassword ? 'Hide' : 'Change Password'}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showPassword ? (
                  <form onSubmit={updatePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        placeholder="Enter current password"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="Enter new password"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowPassword(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Password Security</h4>
                      <p className="text-sm text-blue-700">
                        Your password was last updated when you created your account. 
                        Consider updating it regularly for better security.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Account Status</h4>
                      <p className="text-sm text-green-700">
                        Your account is active and secure. You can change your password anytime.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Account details and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Account Created:</span>
                    <span className="text-sm text-gray-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">User ID:</span>
                    <span className="text-sm text-gray-500 font-mono">
                      {profile?.id?.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 