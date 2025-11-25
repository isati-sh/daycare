'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, Mail, UserX } from 'lucide-react';

export default function AccessDenied() {
  const { user, role, loading } = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleGoToDashboard = () => {
    // Redirect based on user role
    switch (role) {
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'teacher':
        router.push('/dashboard/teacher');
        break;
      case 'parent':
        router.push('/dashboard/parent');
        break;
      default:
        router.push('/dashboard');
    }
  };

  const getErrorContent = () => {
    switch (reason) {
      case 'email-not-verified':
        return {
          icon: <Mail className="h-16 w-16 text-yellow-500" />,
          title: 'Email Verification Required',
          message: 'Please check your email and click the verification link to activate your account.',
          showDashboard: false
        };
      case 'account-not-activated':
        return {
          icon: <UserX className="h-16 w-16 text-orange-500" />,
          title: 'Account Not Activated',
          message: 'Your account is pending activation. Please contact an administrator.',
          showDashboard: false
        };
      case 'role-not-assigned':
        return {
          icon: <ShieldX className="h-16 w-16 text-blue-500" />,
          title: 'Role Assignment Pending',
          message: 'Your account has been created but no role has been assigned yet. Please contact an administrator to assign your role.',
          showDashboard: false
        };
      default:
        return {
          icon: <ShieldX className="h-16 w-16 text-red-500" />,
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
          showDashboard: true
        };
    }
  };

  const errorContent = getErrorContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {errorContent.icon}
          </div>
          <CardTitle className="text-2xl font-bold">
            {errorContent.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {errorContent.message}
          </p>
          
          {reason === 'email-not-verified' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Can't find the email? Check your spam folder or contact support.
              </p>
            </div>
          )}

          {reason === 'account-not-activated' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Your administrator will activate your account once your invitation is processed.
              </p>
            </div>
          )}

          {reason === 'role-not-assigned' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                An administrator will assign your role once they review your account.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {errorContent.showDashboard && role && (
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
