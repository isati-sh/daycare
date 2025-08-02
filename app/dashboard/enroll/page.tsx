'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  AlertTriangle,
  Plus,
  Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function EnrollPage() {
  const { user, client: supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    age_group: 'toddler' as 'infant' | 'toddler' | 'preschool',
    allergies: '',
    medical_notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const allergies = formData.allergies 
        ? formData.allergies.split(',').map(a => a.trim()).filter(a => a)
        : null

      const { error } = await supabase
        .from('children')
        .insert([{
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          age_group: formData.age_group,
          parent_id: user?.id,
          allergies,
          medical_notes: formData.medical_notes || null
        }])

      if (error) throw error

      // Fetch the user's site_role from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('site_role')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile?.site_role) {
        toast.success('Child enrolled successfully!')
        router.push('/dashboard')
        return;
      }

      toast.success('Child enrolled successfully!')
      router.push(`/dashboard/${profile.site_role}`)
    } catch (error) {
      console.error('Error enrolling child:', error)
      toast.error('Failed to enroll child')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enroll Child</h1>
          <p className="text-gray-600 mt-2">
            Add your child to our daycare program
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Child Information
            </CardTitle>
            <CardDescription>
              Please provide your child's information for enrollment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age_group">Age Group *</Label>
                  <select
                    id="age_group"
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="infant">Infant (0-12 months)</option>
                    <option value="toddler">Toddler (1-3 years)</option>
                    <option value="preschool">Preschool (3-5 years)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Enter allergies (comma-separated)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank if no allergies
                </p>
              </div>

              <div>
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                  placeholder="Any medical conditions or special needs"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional medical information for staff
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• All information will be kept confidential</li>
                      <li>• Medical information helps us provide better care</li>
                      <li>• You can update this information later in your profile</li>
                      <li>• Contact staff if you need to update any information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enroll Child
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 