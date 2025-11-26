'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
import { createClient } from '@/lib/supabase/client'

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
  const { user } = useSupabase()

  // Check URL parameters for invitation (compute only once)
  const { invitedEmail, isInvited } = useMemo(() => {
    if (typeof window === 'undefined') return { invitedEmail: null, isInvited: false }
    const urlParams = new URLSearchParams(window.location.search)
    return {
      invitedEmail: urlParams.get('email'),
      isInvited: urlParams.get('invited') === 'true'
    }
  }, [])

  useEffect(() => {
    // Wait for user to load
    if (user === undefined) return

    const checkAccess = async () => {
      const supabase = createClient()
      
      // 1. Check if users table is empty to determine if this is the first user
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (!usersError && (!users || users.length === 0)) {
        setIsFirstUser(true)
      }

      // 2. If user is logged in, check if they already exist
      if (user && user.email) {
        const { data: existingUser, error: existingUserError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .single()

        if (!existingUserError && existingUser) {
          // User already exists, redirect to dashboard
          router.replace('/dashboard')
          return
        }
      }

      // Allow access for new users (logged in or not)
      setHasAccess(true)
      setAccessChecked(true)
    }

    checkAccess()
  }, [user, router])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  // Handle invited user email pre-fill
  useEffect(() => {
    if (isInvited && invitedEmail) {
      // Pre-fill the email for invited users
      setValue('email', invitedEmail)
    }
  }, [isInvited, invitedEmail, setValue])

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Check if this email was invited (has inactive profile)
      const { data: invitedProfile } = await supabase
        .from('profiles')
        .select('id, site_role, active_status')
        .eq('email', data.email)
        .single()

      let site_role = null // default - admin will assign role later
      let isInvitedUser = false

      if (invitedProfile) {
        // User was invited
        site_role = invitedProfile.site_role || null
        isInvitedUser = !invitedProfile.active_status
      } else if (isFirstUser) {
        // First user becomes admin
        site_role = 'admin'
      }

      const { error, data: signUpData } = await supabase.auth.signUp({
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

      // After sign up, update or insert profile
      if (signUpData?.user) {
        const { id } = signUpData.user
        
        if (invitedProfile) {
          // Update existing invited profile
          await supabase
            .from('profiles')
            .update({
              full_name: data.fullName,
              phone: data.phone || null,
              address: data.address || null,
              emergency_contact: data.emergencyContact || null,
              active_status: true, // Activate the account
              email_verified: true, // Mark as verified after signup
              updated_at: new Date().toISOString()
            })
            .eq('email', data.email)
        } else {
          // Create new profile
          await supabase.from('profiles').insert([
            {
              id,
              email: data.email,
              full_name: data.fullName,
              site_role,
              phone: data.phone || null,
              address: data.address || null,
              emergency_contact: data.emergencyContact || null,
              active_status: true,
              email_verified: true, // Mark as verified after signup
            },
          ])
        }
      }

      const message = isInvitedUser 
        ? 'Registration completed! Your account has been activated. Please check your email to verify your account.'
        : isFirstUser
        ? 'Admin account created! Please check your email to verify your account.'
        : 'Account created successfully! Please check your email to verify your account.'

      toast.success(message)
      router.push('/login')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!accessChecked) {
    // Still checking if user already exists
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <span className="text-sm sm:text-base text-gray-500">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-white font-bold text-lg sm:text-xl">LL</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join our family</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Create your Little Learners {isFirstUser ? 'admin' : 'parent'} account
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Create Account</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Sign up to access your child's information and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <Label htmlFor="fullName" className="text-sm sm:text-base">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    {...register('fullName')}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.fullName.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.phone.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="address" className="text-sm sm:text-base">Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    {...register('address')}
                  />
                </div>
                {errors.address && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.address.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact" className="text-sm sm:text-base">Emergency Contact</Label>
                <div className="relative mt-1">
                  <Contact className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="emergencyContact"
                    type="text"
                    placeholder="Enter emergency contact"
                    className="pl-10 sm:pl-12 text-sm sm:text-base"
                    {...register('emergencyContact')}
                  />
                </div>
                {errors.emergencyContact && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.emergencyContact.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
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
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.password.message}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center mt-1 text-xs sm:text-sm text-red-600">
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-sm sm:text-base py-2 sm:py-3"
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