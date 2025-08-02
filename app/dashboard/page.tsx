'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings,
  Baby,
  GraduationCap,
  Shield,
  Heart,
  AlertTriangle
} from 'lucide-react';

export default function DashboardIndex() {
  const { user, role } = useSupabase();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const attemptedRoute = searchParams.get('attempted');

  // Handle unauthorized access errors
  useEffect(() => {
    if (error === 'unauthorized' && attemptedRoute) {
      toast.error(`Access denied: You don't have permission to access ${attemptedRoute}`, {
        duration: 5000,
        icon: '🚫'
      });
    }
  }, [error, attemptedRoute]);

  // Loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }


  

  const getWelcomeMessage = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Welcome to Admin Dashboard',
          description: 'Manage your daycare operations, staff, and children.',
          icon: Shield
        };
      case 'teacher':
        return {
          title: 'Welcome to Teacher Dashboard',
          description: 'Track daily activities, update logs, and communicate with parents.',
          icon: GraduationCap
        };
      case 'parent':
        return {
          title: 'Welcome to Parent Portal',
          description: 'Stay connected with your child\'s daily activities and development.',
          icon: Heart
        };
      default:
        return {
          title: 'Welcome to Your Dashboard',
          description: 'Manage your daycare experience.',
          icon: Baby
        };
    }
  };

  const welcome = getWelcomeMessage();
  const WelcomeIcon = welcome.icon;

  const getQuickActions = () => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Manage Children', href: '/dashboard/admin/children', icon: Users },
          { label: 'Manage Staff', href: '/dashboard/admin/teachers', icon: GraduationCap },
          { label: 'Add New Member', href: '/dashboard/admin/add-member', icon: Shield },
          { label: 'View Reports', href: '/dashboard/reports', icon: FileText },
        ];
      case 'teacher':
        return [
          { label: 'Daily Activities', href: '/dashboard/teacher', icon: Calendar },
          { label: 'Children Overview', href: '/dashboard/teacher/children', icon: Users },
          { label: 'Activity Reports', href: '/dashboard/teacher/reports', icon: FileText },
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        ];
      case 'parent':
        return [
          { label: 'My Children', href: '/dashboard/parent/children', icon: Baby },
          { label: 'Daily Activities', href: '/dashboard/parent/activities', icon: Calendar },
          { label: 'Reports', href: '/dashboard/parent/reports', icon: FileText },
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
        ];
      default:
        return [
          { label: 'Activities', href: '/dashboard/activities', icon: Calendar },
          { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
          { label: 'Profile', href: '/dashboard/profile', icon: Settings },
        ];
    }
  };

  const quickActions = getQuickActions();
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
            <CardTitle className="text-yellow-800">Role Not Found</CardTitle>
            <CardDescription>
              We couldn't determine your role. Please contact support or try
              refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen">
      {/* Welcome Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <WelcomeIcon className="h-16 w-16 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">{welcome.title}</CardTitle>
          <CardDescription className="text-lg">
            {welcome.description}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Card for Unauthorized Access */}
      {error === 'unauthorized' && attemptedRoute && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-800">Access Denied</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              You attempted to access{' '}
              <code className="bg-red-100 px-2 py-1 rounded text-red-800">
                {attemptedRoute}
              </code>{' '}
              but don't have the required permissions. Please use the authorized
              sections below for your role.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <ActionIcon className="h-12 w-12 text-primary-600 mx-auto mb-2" />
                <CardTitle className="text-lg">{action.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button className="w-full" variant="outline">
                    Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity or Stats could go here */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Welcome back! Use the quick actions above to navigate to different
            sections of your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
