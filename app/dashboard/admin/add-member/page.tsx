'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Users, Plus, Edit, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  site_role: 'parent' | 'teacher' | 'admin';
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    site_role: 'parent' as 'parent' | 'teacher' | 'admin',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const { user, client, isAdmin, loading: authLoading } = useSupabase();
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return;
      }

      // Filter out the current admin user from the list
      const filtered = (data || []).filter((u: Profile) => u.id !== user?.id);
      setUsers(filtered);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [client, user?.id]);

  // Check access and redirect if needed
  useEffect(() => {
    if (authLoading) return; // Still loading auth state
    
    if (!user) {
      router.replace('/login');
      return;
    }
    
    if (!isAdmin) {
      setAccessDenied(true);
      toast.error('Access denied. Admin privileges required.');
      setTimeout(() => {
        router.replace('/dashboard');
      }, 3000);
      return;
    }

    setAccessChecked(true);
    fetchUsers();
  }, [user, isAdmin, authLoading, router, fetchUsers]);

  const handleAddUser = async () => {
    if (!form.email || !form.full_name) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

      // 1. Create user in Supabase Auth using admin client
      const { data: authUser, error: authError } = await client.auth.admin.createUser({
        email: form.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: form.full_name,
          role: form.site_role,
        },
      });

      if (authError) {
        console.error('Auth error:', authError);
        if (authError.message.includes('service_role')) {
          toast.error('Admin privileges required. Please check your service role key configuration.');
        } else {
          toast.error(`Failed to create user: ${authError.message}`);
        }
        return;
      }

      // 2. Add user to profiles table
      const { error: profileError } = await client
        .from('profiles')
        .insert([{
          id: authUser.user.id,
          email: form.email,
          full_name: form.full_name,
          site_role: form.site_role,
        }]);

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Failed to add user profile. Please try again.');
        // Clean up auth user if profile insert fails
        try {
          await client.auth.admin.deleteUser(authUser.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        return;
      }

      toast.success(
        `User ${form.full_name} added successfully! Temporary password: ${tempPassword}`
      );
      
      // Reset form
      setForm({ email: '', full_name: '', site_role: 'parent' });
      
      // Refresh user list
      fetchUsers();
      
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await client
        .from('profiles')
        .update({ site_role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Role update error:', error);
        toast.error('Failed to update user role');
        return;
      }

      toast.success('User role updated successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      // Delete from profiles first
      const { error: profileError } = await client
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        toast.error('Failed to delete user profile');
        return;
      }

      // Then delete from auth
      const { error: authError } = await client.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth deletion error:', authError);
        toast.error('User profile deleted but failed to remove from authentication');
        return;
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  if (authLoading || !accessChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users and their roles in the system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add User Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New User
                </CardTitle>
                <CardDescription>
                  Create a new user account with specified role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={form.site_role}
                    onChange={(e) => setForm({ ...form, site_role: e.target.value as any })}
                    className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleAddUser} 
                  disabled={submitting || !form.email || !form.full_name}
                  className="w-full"
                >
                  {submitting ? 'Adding User...' : 'Add User'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  System Users
                </CardTitle>
                <CardDescription>
                  Manage existing users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={user.site_role === 'admin' ? 'destructive' : user.site_role === 'teacher' ? 'default' : 'secondary'}
                          >
                            {user.site_role}
                          </Badge>
                          
                          <select
                            value={user.site_role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="parent">Parent</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.full_name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
