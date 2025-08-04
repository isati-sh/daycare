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
  const { user, isAdmin } = useSupabase();
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

  // Mock data for dashboard
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalChildren: 45,
      activeChildren: 42,
      totalTeachers: 8,
      activeTeachers: 7,
      totalParents: 38,
      pendingEnrollments: 3,
      todayActivities: 12,
      upcomingEvents: 5
    };

    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'enrollment',
        description: 'New child enrollment: Emma Johnson',
        timestamp: '2025-08-04T09:30:00Z',
        user: 'Sarah Wilson'
      },
      {
        id: '2',
        type: 'activity',
        description: 'Art class completed for Preschool group',
        timestamp: '2025-08-04T08:45:00Z',
        user: 'Michael Chen'
      },
      {
        id: '3',
        type: 'report',
        description: 'Daily report submitted for 15 children',
        timestamp: '2025-08-04T08:15:00Z',
        user: 'Emily Davis'
      },
      {
        id: '4',
        type: 'message',
        description: 'Parent inquiry about nutrition program',
        timestamp: '2025-08-04T07:30:00Z',
        user: 'Lisa Martinez'
      }
    ];

    setStats(mockStats);
    setRecentActivities(mockActivities);
    setLoading(false);
  }, []);

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard path="/dashboard/admin">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening at your daycare today.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Children</p>
                    <p className="text-2xl font-bold">{stats.totalChildren}</p>
                    <p className="text-blue-100 text-xs">{stats.activeChildren} active</p>
                  </div>
                  <Baby className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Teachers</p>
                    <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                    <p className="text-green-100 text-xs">{stats.activeTeachers} active</p>
                  </div>
                  <Users className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Parents</p>
                    <p className="text-2xl font-bold">{stats.totalParents}</p>
                    <p className="text-purple-100 text-xs">Families enrolled</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingEnrollments}</p>
                    <p className="text-orange-100 text-xs">New enrollments</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/admin/add-member">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New User
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/admin/children">
                    <Button variant="outline" className="w-full justify-start">
                      <Baby className="h-4 w-4 mr-2" />
                      Manage Children
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/admin/teachers">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Teachers
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/admin/parents">
                    <Button variant="outline" className="w-full justify-start">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Manage Parents
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard/enroll">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Enrollments
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Today's Overview */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Today's Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Scheduled Activities</span>
                    </div>
                    <Badge variant="secondary">{stats.todayActivities}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Upcoming Events</span>
                    </div>
                    <Badge variant="secondary">{stats.upcomingEvents}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Attendance Rate</span>
                    </div>
                    <Badge variant="default">93%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest updates and activities in your daycare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading activities...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              by {activity.user} • {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Database</span>
                      <Badge variant="secondary" className="ml-auto">Online</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Authentication</span>
                      <Badge variant="secondary" className="ml-auto">Online</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">File Storage</span>
                      <Badge variant="secondary" className="ml-auto">Online</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Email Service</span>
                      <Badge variant="secondary" className="ml-auto">Online</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminDashboardPage;
