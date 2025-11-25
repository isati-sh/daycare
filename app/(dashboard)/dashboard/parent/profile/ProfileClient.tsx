"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  Edit,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  Camera,
  Settings,
  Bell,
  Lock,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { updateParentProfile, updateParentPassword } from './actions';

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  site_role: 'parent' | 'teacher' | 'admin';
  phone: string | null;
  address: string | null;
  emergency_contact: string | null;
  created_at: string;
  updated_at: string;
  daysActive: number;
  profileCompletion: number;
}

interface Props {
  profile: ProfileData;
}

export default function ProfileClient({ profile }: Props) {
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    emergency_contact: profile.emergency_contact || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await updateParentProfile(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Profile updated successfully');
        setEditing(false);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      const result = await updateParentPassword(passwordForm.new_password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Password updated successfully');
        setPasswordForm({ new_password: '', confirm_password: '' });
        setShowPassword(false);
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
      case 'teacher':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';
      case 'parent':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Profile Summary */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6">
                {/* Profile Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                    {getInitials(profile.full_name)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white text-indigo-600 hover:bg-gray-100"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold">{profile.full_name || 'Welcome User'}</h1>
                    <Badge className={`${getRoleColor(profile.site_role)} border-0 px-3 py-1`}>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span className="capitalize">{profile.site_role}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-indigo-100 text-lg mb-3">{profile.email}</p>
                  <div className="flex items-center space-x-4 text-sm text-indigo-200">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined{' '}
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Account Active</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="hidden lg:flex space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.daysActive}</div>
                    <div className="text-xs text-indigo-200">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.profileCompletion}%</div>
                    <div className="text-xs text-indigo-200">Profile Complete</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                      <p className="text-sm text-gray-600">Manage your personal details</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    disabled={saving}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter your full name"
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="mt-1 bg-gray-50 border-gray-200"
                        />
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Email cannot be changed for security reasons
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <Label htmlFor="emergency_contact" className="text-sm font-medium text-gray-700">
                          Emergency Contact
                        </Label>
                        <Input
                          id="emergency_contact"
                          value={formData.emergency_contact}
                          onChange={(e) =>
                            setFormData({ ...formData, emergency_contact: e.target.value })
                          }
                          placeholder="Enter emergency contact"
                          className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter your complete address"
                        rows={3}
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex space-x-4 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Email</p>
                            <p className="text-sm text-gray-900">{profile.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Full Name</p>
                            <p className="text-sm text-gray-900">
                              {profile.full_name || (
                                <span className="text-orange-600">Add your name</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Phone</p>
                            <p className="text-sm text-gray-900">
                              {profile.phone || (
                                <span className="text-orange-600">Add phone number</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Shield className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Role</p>
                            <Badge className={`${getRoleColor(profile.site_role)} mt-1`}>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span className="capitalize">{profile.site_role}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Address</p>
                            <p className="text-sm text-gray-900">
                              {profile.address || (
                                <span className="text-orange-600">Add your address</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Emergency Contact</p>
                            <p className="text-sm text-gray-900">
                              {profile.emergency_contact || (
                                <span className="text-orange-600">Add emergency contact</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                      <p className="text-sm text-gray-600">Manage your account security</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={saving}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {showPassword ? 'Hide' : 'Change Password'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {showPassword ? (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                      <Label htmlFor="new_password" className="text-sm font-medium text-gray-700">
                        New Password
                      </Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, new_password: e.target.value })
                        }
                        placeholder="Enter new password (min 8 characters)"
                        className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="confirm_password"
                        className="text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                        }
                        placeholder="Confirm new password"
                        className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="flex space-x-4 pt-4 border-t border-gray-200">
                      <Button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPassword(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-900">Password Security</h4>
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        Your password is secure. Consider updating it regularly for better security.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Account Status</h4>
                      </div>
                      <p className="text-sm text-blue-700 mt-2">
                        Your account is active and secure. All security features are enabled.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* Account Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Info className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                    <p className="text-sm text-gray-600">Your account information</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Created</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    </div>
                    <span className="text-sm text-gray-900">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">User ID</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {profile.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-sm text-gray-600">Common account tasks</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowPassword(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card
              className={`shadow-lg border-0 ${
                profile.profileCompletion === 100
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                  : 'bg-gradient-to-br from-orange-50 to-amber-50'
              }`}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 ${
                      profile.profileCompletion === 100 ? 'bg-green-100' : 'bg-orange-100'
                    } rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    {profile.profileCompletion === 100 ? (
                      <CheckCircle
                        className={`h-8 w-8 ${
                          profile.profileCompletion === 100 ? 'text-green-600' : 'text-orange-600'
                        }`}
                      />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {profile.profileCompletion === 100
                      ? 'Profile Complete!'
                      : 'Complete Your Profile'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {profile.profileCompletion === 100
                      ? 'Your profile is complete. Keep your information up to date for the best experience.'
                      : 'Add missing information to complete your profile.'}
                  </p>
                  <div
                    className={`w-full ${
                      profile.profileCompletion === 100 ? 'bg-green-200' : 'bg-orange-200'
                    } rounded-full h-2`}
                  >
                    <div
                      className={`${
                        profile.profileCompletion === 100 ? 'bg-green-500' : 'bg-orange-500'
                      } h-2 rounded-full transition-all`}
                      style={{ width: `${profile.profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{profile.profileCompletion}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
