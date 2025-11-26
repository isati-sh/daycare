'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabase } from '@/components/providers/supabase-provider';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { user, loading } = useSupabase();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const onSubmit = async (data: LoginForm) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

      if (!signInData?.user) throw new Error('No user returned from Supabase');

      if (error) {
        toast.error(
          error.message.includes('Invalid login credentials')
            ? 'Invalid email or password'
            : error.message
        );
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('site_role')
        .eq('id', signInData.user.id)
        .single();
      
      console.log(profile, 'profile')

      if (profileError || !profile?.site_role) {
        toast.error('Could not fetch user role');
        return;
      }

      toast.success('Logged in successfully');

      // Redirect based on role
      const role = profile.site_role;
      if (role === 'admin') router.push('/dashboard/admin');
      else if (role === 'parent') router.push('/dashboard/parent');
      else if (role === 'teacher') router.push('/dashboard/teacher');
      else router.push('/dashboard');
    } catch (error) {
      toast.error('Unexpected error during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-500 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-white font-bold text-lg sm:text-xl mx-auto">
            LL
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">Welcome back</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Sign in to continue</p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Sign In</CardTitle>
            <CardDescription className="text-sm sm:text-base">Use your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    autoComplete="username"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base py-2 sm:py-3" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
