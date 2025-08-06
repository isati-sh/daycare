'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Baby, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Activity,
  FileText,
  Heart,
  AlertTriangle,
  Edit,
  Plus,
  Camera,
  BookOpen,
  Star,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import RoleGuard from '@/components/guards/roleGuard'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  enrollment_date: string
  status: string
  parent_id: string
  teacher_id: string
  allergies: string[]
  medical_notes: string
  emergency_contact: string
  created_at: string
}

interface Parent {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
}

interface Teacher {
  id: string
  full_name: string
  email: string
  phone: string
}

interface DailyLog {
  id: string
  date: string
  activities: string[]
  naps: {
    morning: string | null
    afternoon: string | null
  }
  meals: {
    breakfast: string
    lunch: string
    snack: string
  }
  mood: string
  notes: string
  created_at: string
}

export default function ChildDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, client } = useSupabase()
  const [child, setChild] = useState<Child | null>(null)
  const [parent, setParent] = useState<Parent | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const childId = params.id as string

  useEffect(() => {
    if (user && client && childId) {
      fetchChildData()
    }
  }, [user, client, childId])

  const fetchChildData = async () => {
    if (!user || !client || !childId) return

    try {
      setLoading(true)

      // Fetch child data
      const { data: childData, error: childError } = await client
        .from('children')
        .select('*')
        .eq('id', childId)
        .maybeSingle()

      if (childError) {
        console.error('Error fetching child:', childError)
        toast.error('Failed to load child information')
        return
      }

      if (!childData) {
        console.error('Child not found')
        toast.error('Child not found')
        return
      }

      setChild(childData)

      // Fetch parent data
      if (childData.parent_id) {
        const { data: parentData, error: parentError } = await client
          .from('profiles')
          .select('id, full_name, email, phone, address')
          .eq('id', childData.parent_id)
          .single()

        if (!parentError && parentData) {
          setParent(parentData)
        }
      }

      // Fetch teacher data
      if (childData.teacher_id) {
        const { data: teacherData, error: teacherError } = await client
          .from('profiles')
          .select('id, full_name, email, phone')
          .eq('id', childData.teacher_id)
          .single()

        if (!teacherError && teacherData) {
          setTeacher(teacherData)
        }
      }

      // Fetch recent daily logs
      const { data: logsData, error: logsError } = await client
        .from('daily_logs')
        .select('*')
        .eq('child_id', childId)
        .order('date', { ascending: false })
        .limit(10)

      if (!logsError && logsData) {
        const transformedLogs = logsData.map(log => ({
          ...log,
          activities: log.activities.map((activity: string) => activity),
          naps: {
            morning: log.naps.morning_start && log.naps.morning_end 
              ? `${log.naps.morning_start} - ${log.naps.morning_end}`
              : null,
            afternoon: log.naps.afternoon_start && log.naps.afternoon_end
              ? `${log.naps.afternoon_start} - ${log.naps.afternoon_end}`
              : null
          },
          meals: {
            breakfast: log.meals?.breakfast || 'Not recorded',
            lunch: log.meals?.lunch || 'Not recorded',
            snack: log.meals?.snack || 'Not recorded'
          }
        }))
        setDailyLogs(transformedLogs)
      }

    } catch (error) {
      console.error('Error fetching child data:', error)
      toast.error('Failed to load child information')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
      (today.getMonth() - birthDate.getMonth())
    
    if (ageInMonths < 12) {
      return `${ageInMonths} months`
    } else {
      const years = Math.floor(ageInMonths / 12)
      const months = ageInMonths % 12
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy': return '😊'
      case 'sad': return '😢'
      case 'excited': return '🤩'
      case 'tired': return '😴'
      case 'angry': return '😠'
      default: return '😐'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading child information...</p>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Child Not Found</h2>
          <p className="text-gray-600 mb-4">The child you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/admin/children/[id]">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-10 w-10 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                    <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
                    {child.first_name} {child.last_name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Child Profile & Information
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(child.status)}>
                  {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 sm:mb-8 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'daily-logs', label: 'Daily Logs', icon: FileText },
              { id: 'activities', label: 'Activities', icon: Activity },
              { id: 'medical', label: 'Medical', icon: Heart },
              { id: 'photos', label: 'Photos', icon: Camera }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Child Information */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Baby className="h-5 w-5 mr-2" />
                      Child Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Full Name</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {child.first_name} {child.last_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Age</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {calculateAge(child.date_of_birth)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Date of Birth</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {new Date(child.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Gender</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900 capitalize">
                          {child.gender}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Enrollment Date</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {new Date(child.enrollment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Status</label>
                        <Badge className={getStatusColor(child.status)}>
                          {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Daily Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Recent Daily Logs
                    </CardTitle>
                    <CardDescription>Latest updates from teachers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dailyLogs.length > 0 ? (
                      <div className="space-y-4">
                        {dailyLogs.slice(0, 3).map((log) => (
                          <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(log.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getMoodIcon(log.mood)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {log.mood || 'No mood recorded'}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Activities:</span>
                                <p className="text-gray-600 mt-1">
                                  {log.activities.length > 0 ? log.activities.join(', ') : 'No activities recorded'}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Naps:</span>
                                <p className="text-gray-600 mt-1">
                                  {log.naps.morning || log.naps.afternoon ? 
                                    `${log.naps.morning || 'None'} / ${log.naps.afternoon || 'None'}` : 
                                    'No naps recorded'
                                  }
                                </p>
                              </div>
                            </div>
                            {log.notes && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="font-medium text-gray-700">Notes:</span>
                                <p className="text-gray-600 mt-1 text-sm">{log.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No daily logs yet</p>
                        <p className="text-sm text-gray-400 mt-1">Daily logs will appear here as teachers update them</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 sm:space-y-8">
                {/* Parent Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Parent Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {parent ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Name</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{parent.full_name}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Email</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{parent.email}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Phone</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{parent.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Address</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{parent.address || 'Not provided'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No parent information</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Teacher Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Assigned Teacher
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teacher ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Name</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{teacher.full_name}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Email</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{teacher.email}</p>
                        </div>
                        <div>
                          <label className="text-xs sm:text-sm font-semibold text-gray-600">Phone</label>
                          <p className="text-sm sm:text-base font-medium text-gray-900">{teacher.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No teacher assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Medical Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Allergies</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {child.allergies && child.allergies.length > 0 ? 
                            child.allergies.join(', ') : 'None reported'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Medical Notes</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {child.medical_notes || 'No medical notes'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Emergency Contact</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {child.emergency_contact || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'daily-logs' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Daily Logs
                </CardTitle>
                <CardDescription>Complete history of daily reports</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyLogs.length > 0 ? (
                  <div className="space-y-4">
                    {dailyLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(log.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getMoodIcon(log.mood)}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.mood || 'No mood recorded'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Activities</h4>
                            <p className="text-sm text-gray-600">
                              {log.activities.length > 0 ? log.activities.join(', ') : 'No activities recorded'}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Naps</h4>
                            <div className="text-sm text-gray-600">
                              <p>Morning: {log.naps.morning || 'None'}</p>
                              <p>Afternoon: {log.naps.afternoon || 'None'}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Meals</h4>
                            <div className="text-sm text-gray-600">
                              <p>Breakfast: {log.meals.breakfast}</p>
                              <p>Lunch: {log.meals.lunch}</p>
                              <p>Snack: {log.meals.snack}</p>
                            </div>
                          </div>
                        </div>
                        
                        {log.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                            <p className="text-sm text-gray-600">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No daily logs yet</p>
                    <p className="text-sm text-gray-400 mt-1">Daily logs will appear here as teachers update them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'activities' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Activities
                </CardTitle>
                <CardDescription>Child's activity history and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Activity tracking coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">This feature will show detailed activity history</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'medical' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Medical Information
                </CardTitle>
                <CardDescription>Health records and medical notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Allergies</label>
                      <p className="text-sm text-gray-600 mt-1">
                        {child.allergies && child.allergies.length > 0 ? 
                          child.allergies.join(', ') : 'None reported'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Medical Notes</label>
                      <p className="text-sm text-gray-600 mt-1">
                        {child.medical_notes || 'No medical notes available'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Emergency Contact</label>
                      <p className="text-sm text-gray-600 mt-1">
                        {child.emergency_contact || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">Health Status</label>
                      <Badge className="bg-green-100 text-green-800">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'photos' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Photos
                </CardTitle>
                <CardDescription>Child's photo gallery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Photo gallery coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">This feature will show child's photos and memories</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  )
} 