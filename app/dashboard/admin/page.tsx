'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/guards/roleGuard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Baby, 
  UserCheck, 
  Calendar,
  Activity,
  AlertTriangle,
  Mail,
  Clock,
  TrendingUp,
  Plus,
  Settings,
  FileText,
  Shield,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalChildren: number;
  activeChildren: number;
  totalTeachers: number;
  activeTeachers: number;
  totalParents: number;
  pendingEnrollments: number;
  todayActivities: number;
  upcomingEvents: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'activity' | 'report' | 'message';
  description: string;
  timestamp: string;
  user: string;
}

const AdminDashboardPage = () => {
  // Remove useAuth, get user from useSupabase instead
  const { user } = useSupabase();
  const { client } = useSupabase();
  const [stats, setStats] = useState<DashboardStats>({
    totalChildren: 0,
    activeChildren: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalParents: 0,
    pendingEnrollments: 0,
    todayActivities: 0,
    upcomingEvents: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && client) {
      fetchDashboardData();
    }
  }, [user, client]);

  const fetchDashboardData = async () => {
    if (!user || !client) return;

    try {
      setLoading(true);

      // Fetch children statistics
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('id, status');

      if (childrenError) {
        console.error('Error fetching children:', childrenError);
      } else {
        const totalChildren = childrenData?.length || 0;
        const activeChildren = childrenData?.filter(child => child.status === 'active').length || 0;
        
        setStats(prev => ({
          ...prev,
          totalChildren,
          activeChildren
        }));
      }

      // Fetch teachers statistics
      const { data: teachersData, error: teachersError } = await client
        .from('profiles')
        .select('id, active_status')
        .eq('site_role', 'teacher');

      if (teachersError) {
        console.error('Error fetching teachers:', teachersError);
      } else {
        const totalTeachers = teachersData?.length || 0;
        const activeTeachers = teachersData?.filter(teacher => teacher.active_status).length || 0;
        
        setStats(prev => ({
          ...prev,
          totalTeachers,
          activeTeachers
        }));
      }

      // Fetch parents statistics
      const { data: parentsData, error: parentsError } = await client
        .from('profiles')
        .select('id, active_status')
        .eq('site_role', 'parent');

      if (parentsError) {
        console.error('Error fetching parents:', parentsError);
      } else {
        const totalParents = parentsData?.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalParents
        }));
      }

      // Fetch pending enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await client
        .from('enrollment_applications')
        .select('id')
        .eq('status', 'pending');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
      } else {
        const pendingEnrollments = enrollmentsData?.length || 0;
        
        setStats(prev => ({
          ...prev,
          pendingEnrollments
        }));
      }

      // Fetch today's activities
      const today = new Date().toISOString().split('T')[0];
      const { data: activitiesData, error: activitiesError } = await client
        .from('planned_activities')
        .select('id')
        .eq('date', today);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
      } else {
        const todayActivities = activitiesData?.length || 0;
        
        setStats(prev => ({
          ...prev,
          todayActivities
        }));
      }

      // Fetch recent activities (daily logs, messages, etc.)
      const recentActivitiesData: RecentActivity[] = [];

      // Get recent daily logs
      const { data: logsData, error: logsError } = await client
        .from('daily_logs')
        .select('id, created_at, teacher_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!logsError && logsData) {
        for (const log of logsData) {
          recentActivitiesData.push({
            id: log.id,
            type: 'report',
            description: 'Daily report submitted',
            timestamp: log.created_at,
            user: 'Teacher' // We could fetch teacher name if needed
          });
        }
      }

      // Get recent messages
      const { data: messagesData, error: messagesError } = await client
        .from('messages')
        .select('id, created_at, sender_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!messagesError && messagesData) {
        for (const message of messagesData) {
          recentActivitiesData.push({
            id: message.id,
            type: 'message',
            description: 'New message sent',
            timestamp: message.created_at,
            user: 'User' // We could fetch sender name if needed
          });
        }
      }

      // Sort by timestamp and take the most recent 5
      recentActivitiesData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(recentActivitiesData.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'activity': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'report': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'message': return <Mail className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard path="/dashboard/admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Welcome back! Here's what's happening at your daycare today.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">Total Children</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalChildren}</p>
                    <p className="text-blue-100 text-xs">{stats.activeChildren} active</p>
                  </div>
                  <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Teachers</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalTeachers}</p>
                    <p className="text-green-100 text-xs">{stats.activeTeachers} active</p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Total Parents</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalParents}</p>
                    <p className="text-purple-100 text-xs">Families enrolled</p>
                  </div>
                  <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Today's Activities</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.todayActivities}</p>
                    <p className="text-orange-100 text-xs">Planned</p>
                  </div>
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Enrollments</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.pendingEnrollments}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-green-600">Good</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Button asChild className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/admin/children">
                <Baby className="h-6 w-6" />
                <span>Manage Children</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/admin/teachers">
                <Users className="h-6 w-6" />
                <span>Manage Teachers</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/admin/parents">
                <UserCheck className="h-6 w-6" />
                <span>Manage Parents</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
              <Link href="/dashboard/messages">
                <Mail className="h-6 w-6" />
                <span>Messages</span>
              </Link>
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest activities in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.user} • {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">Activity will appear here as users interact with the system</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/add-member">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Member
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/children">
                      <Baby className="h-4 w-4 mr-2" />
                      View All Children
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/admin/teachers">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Teachers
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard/messages">
                      <Mail className="h-4 w-4 mr-2" />
                      System Messages
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminDashboardPage;
