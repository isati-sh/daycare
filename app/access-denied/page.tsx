'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccessDenied() {
  const { user, role, loading } = useSupabase();
  const router = useRouter();

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>Access Denied</h1>
      <p style={{ marginBottom: '10px' }}>
        You don't have permission to access this page.
      </p>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Your current role: <strong>{role || 'Unknown'}</strong>
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleGoToDashboard}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Go to My Dashboard
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
