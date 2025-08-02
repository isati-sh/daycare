'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Phone, MapPin, Contact } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSupabase } from '@/components/providers/supabase-provider'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [isFirstUser, setIsFirstUser] = useState(false)
  const router = useRouter()
  const { user, client } = useSupabase()

  useEffect(() => {
    // Wait for user to load
    if (user === undefined) return

    // Helper to check users table
    const checkUsersTable = async () => {
      // 1. Check if users table is empty
      const { data: users, error: usersError } = await client
        .from('profiles')
        .select('id, site_role')
        .limit(1)

      if (usersError) {
        // If error, be safe and deny access
        setHasAccess(false)
        setAccessChecked(true)
        return
      }

      if (!users || users.length === 0) {
        // No users in table, allow access (first user)
        setIsFirstUser(true)
        setHasAccess(true)
        setAccessChecked(true)
        return
      }

      // If not logged in, redirect to login
      if (!user) {
        router.replace('/login?redirectTo=/register')
        return
      }

      // 2. Check if user exists in users table
      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('site_role')
        .eq('id', user.id)
        .single()

      if (!profile || profileError) {
        // Not in users table, allow access (could be new admin)
        setHasAccess(true)
        setAccessChecked(true)
        return
      }

      // 3. If user exists, only allow if admin
      if (profile.site_role === 'admin') {
        setHasAccess(true)
      } else {
        setHasAccess(false)
        // redirect to dashboard after accessChecked
        setTimeout(() => router.replace('/dashboard'), 100)
      }
      setAccessChecked(true)
    }

    checkUsersTable()
  }, [user, router, client])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      // If first user, set site_role to admin, else parent
      const site_role = isFirstUser ? 'admin' : 'parent'
      const { error, data: signUpData } = await client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            site_role,
            phone: data.phone || null,
            address: data.address || null,
            emergency_contact: data.emergencyContact || null,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        setIsLoading(false)
        return
      }

      // After sign up, insert into profiles table if not already there
      // (Supabase may do this via trigger, but we ensure it here)
      if (signUpData?.user) {
        const { id } = signUpData.user
        // Check if already in profiles
        const { data: existingProfile } = await client
          .from('profiles')
          .select('id')
          .eq('id', id)
          .single()
        if (!existingProfile) {
          await client.from('profiles').insert([
            {
              id,
              email: data.email,
              full_name: data.fullName,
              site_role,
              phone: data.phone || null,
              address: data.address || null,
              emergency_contact: data.emergencyContact || null,
            },
          ])
        }
      }

      toast.success(
        isFirstUser
          ? 'Admin account created! Please check your email to verify your account.'
          : 'Account created successfully! Please check your email to verify your account.'
      )
      router.push('/login')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!accessChecked) {
    // Still checking access
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Checking access...</span>
      </div>
    )
  }

  if (!hasAccess) {
    // Should never render due to redirect, but fallback
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">LL</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Join our family</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your Little Learners {isFirstUser ? 'admin' : 'parent'} account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Sign up to access your child's information and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fullName.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.phone.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    className="pl-10"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <div className="relative">
                  <Contact className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="emergencyContact"
                    type="text"
                    placeholder="Enter emergency contact"
                    className="pl-10"
                    {...register('emergencyContact')}
                  />
                </div>
                {errors.emergencyContact && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.emergencyContact.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}