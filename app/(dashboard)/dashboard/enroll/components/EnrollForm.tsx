'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Calendar,
  AlertTriangle,
  Save,
  Users,
  Phone,
  Heart,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enrollChild } from '../actions/enroll';

interface EnrollFormProps {
  userRole: 'parent' | 'admin' | 'teacher';
  activeParents: Array<{ id: string; full_name: string; email: string }>;
}

export default function EnrollForm({ userRole, activeParents }: EnrollFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Child Information
    first_name: '',
    last_name: '',
    date_of_birth: '',
    age_group: 'toddler' as 'infant' | 'toddler' | 'preschool',
    gender: '',
    allergies: '',
    medical_notes: '',
    
    // Additional Child Details
    dietary_restrictions: '',
    special_needs: '',
    previous_daycare_experience: '',
    
    // Parent Information (for admin/teacher use)
    selected_parent_id: '',
    
    // Emergency Contacts
    emergency_contact_1_name: '',
    emergency_contact_1_relationship: '',
    emergency_contact_1_phone: '',
    emergency_contact_2_name: '',
    emergency_contact_2_relationship: '',
    emergency_contact_2_phone: '',
    
    // Care Preferences
    pickup_authorized_persons: '',
    preferred_nap_time: '',
    comfort_items: '',
    other_notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await enrollChild(formData);

      if (!result.success) {
        toast.error(result.error || 'Failed to enroll child');
        setSubmitting(false);
        return;
      }

      toast.success('Child enrolled successfully! Application is pending review.');
      
      // Redirect based on user role
      if (userRole === 'parent') {
        router.push('/dashboard/parent/children');
      } else {
        router.push('/dashboard/admin/children');
      }
    } catch (error) {
      console.error('Error enrolling child:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  const isAdminOrTeacher = userRole === 'admin' || userRole === 'teacher';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Enroll Child
          </h1>
          <p className="text-gray-600 mt-2">
            Complete enrollment form with detailed information
          </p>
          {isAdminOrTeacher && (
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              <Shield className="h-4 w-4 mr-1" />
              Admin/Teacher Enrollment
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Parent Selection (for admin/teacher only) */}
          {isAdminOrTeacher && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Parent Selection
                </CardTitle>
                <CardDescription>
                  Select an active parent for this child
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="selected_parent_id">
                    Active Parent <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="selected_parent_id"
                    value={formData.selected_parent_id}
                    onChange={(e) => setFormData({ ...formData, selected_parent_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a parent...</option>
                    {activeParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.full_name} ({parent.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only active parents are shown in this list
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Child Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Child Information
              </CardTitle>
              <CardDescription>
                Basic details about the child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Enter first name"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Enter last name"
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date_of_birth">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="age_group">
                    Age Group <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="age_group"
                    value={formData.age_group}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="infant">Infant (0-12 months)</option>
                    <option value="toddler">Toddler (1-3 years)</option>
                    <option value="preschool">Preschool (3-5 years)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health & Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Health & Medical Information
              </CardTitle>
              <CardDescription>
                Important health details for proper care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g., peanuts, dairy, eggs"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple allergies with commas
                  </p>
                </div>
                <div>
                  <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                  <Input
                    id="dietary_restrictions"
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                    placeholder="e.g., vegetarian, gluten-free"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple restrictions with commas
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea
                  id="medical_notes"
                  value={formData.medical_notes}
                  onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                  placeholder="Any medical conditions, medications, or special health needs"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <Label htmlFor="special_needs">Special Needs</Label>
                <Textarea
                  id="special_needs"
                  value={formData.special_needs}
                  onChange={(e) => setFormData({ ...formData, special_needs: e.target.value })}
                  placeholder="Any developmental, physical, or learning support needs"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                People authorized to pick up your child in emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Emergency Contact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Primary Emergency Contact</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_1_name">Full Name</Label>
                    <Input
                      id="emergency_contact_1_name"
                      value={formData.emergency_contact_1_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_1_name: e.target.value })}
                      placeholder="Enter full name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_1_relationship">Relationship</Label>
                    <Input
                      id="emergency_contact_1_relationship"
                      value={formData.emergency_contact_1_relationship}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_1_relationship: e.target.value })}
                      placeholder="e.g., grandparent, uncle"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_1_phone">Phone Number</Label>
                    <Input
                      id="emergency_contact_1_phone"
                      value={formData.emergency_contact_1_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_1_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Emergency Contact */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Secondary Emergency Contact</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_2_name">Full Name</Label>
                    <Input
                      id="emergency_contact_2_name"
                      value={formData.emergency_contact_2_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_2_name: e.target.value })}
                      placeholder="Enter full name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_2_relationship">Relationship</Label>
                    <Input
                      id="emergency_contact_2_relationship"
                      value={formData.emergency_contact_2_relationship}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_2_relationship: e.target.value })}
                      placeholder="e.g., grandparent, uncle"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_2_phone">Phone Number</Label>
                    <Input
                      id="emergency_contact_2_phone"
                      value={formData.emergency_contact_2_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_2_phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Care Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Care Preferences
              </CardTitle>
              <CardDescription>
                Information to help us provide personalized care
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickup_authorized_persons">Authorized Pickup Persons</Label>
                  <Input
                    id="pickup_authorized_persons"
                    value={formData.pickup_authorized_persons}
                    onChange={(e) => setFormData({ ...formData, pickup_authorized_persons: e.target.value })}
                    placeholder="Names of people authorized to pick up child"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple names with commas
                  </p>
                </div>
                <div>
                  <Label htmlFor="preferred_nap_time">Preferred Nap Time</Label>
                  <Input
                    id="preferred_nap_time"
                    value={formData.preferred_nap_time}
                    onChange={(e) => setFormData({ ...formData, preferred_nap_time: e.target.value })}
                    placeholder="e.g., 12:30 PM - 2:00 PM"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comfort_items">Comfort Items</Label>
                  <Input
                    id="comfort_items"
                    value={formData.comfort_items}
                    onChange={(e) => setFormData({ ...formData, comfort_items: e.target.value })}
                    placeholder="e.g., blanket, stuffed animal"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="previous_daycare_experience">Previous Daycare Experience</Label>
                  <Input
                    id="previous_daycare_experience"
                    value={formData.previous_daycare_experience}
                    onChange={(e) => setFormData({ ...formData, previous_daycare_experience: e.target.value })}
                    placeholder="Brief description"
                    maxLength={500}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="other_notes">Additional Notes</Label>
                <Textarea
                  id="other_notes"
                  value={formData.other_notes}
                  onChange={(e) => setFormData({ ...formData, other_notes: e.target.value })}
                  placeholder="Any other important information"
                  rows={3}
                  maxLength={1000}
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• All information will be kept confidential and secure</li>
                    <li>• Medical and emergency information helps us provide better care</li>
                    <li>• Your child's enrollment will be marked as pending for review</li>
                    <li>• You can update this information later in your dashboard</li>
                    <li>• Contact our staff if you need assistance completing this form</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Enrollment
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={submitting}
            >
              <Link href={userRole === 'parent' ? '/dashboard/parent/children' : '/dashboard/admin/children'}>
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

