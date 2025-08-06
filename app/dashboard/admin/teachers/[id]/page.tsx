'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Activity,
  FileText,
  Baby,
  Star,
  TrendingUp,
  Edit,
  Plus,
  Award,
  BookOpen,
  Heart,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import RoleGuard from '@/components/guards/roleGuard'

interface Teacher {
  id: string
  email: string
  full_name: string
  phone: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  active_status: boolean
  site_role: string
}

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  status: string
  parent_id: string
}

interface DailyLog {
  id: string
  date: string
  child_id: string
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

interface TeacherStats {
  totalChildren: number
  activeChildren: number
  totalLogs: number
  averageLogsPerDay: number
  lastActivity: string | null
}

export default function TeacherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, client } = useSupabase()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [assignedChildren, setAssignedChildren] = useState<Child[]>([])
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [stats, setStats] = useState<TeacherStats>({
    totalChildren: 0,
    activeChildren: 0,
    totalLogs: 0,
    averageLogsPerDay: 0,
    lastActivity: null
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const teacherId = params.id as string

  useEffect(() => {
    if (user && client && teacherId) {
      fetchTeacherData()
    }
  }, [user, client, teacherId])

  const fetchTeacherData = async () => {
    if (!user || !client || !teacherId) return

    try {
      setLoading(true)

      // Fetch teacher data
      const { data: teacherData, error: teacherError } = await client
        .from('profiles')
        .select('*')
        .eq('id', teacherId)
        .eq('site_role', 'teacher')
        .maybeSingle()

      if (teacherError) {
        console.error('Error fetching teacher:', teacherError)
        toast.error('Failed to load teacher information')
        return
      }

      if (!teacherData) {
        console.error('Teacher not found')
        toast.error('Teacher not found')
        return
      }

      setTeacher(teacherData)

      // Fetch assigned children
      const { data: childrenData, error: childrenError } = await client
        .from('children')
        .select('*')
        .eq('teacher_id', teacherId)

      if (!childrenError && childrenData) {
        setAssignedChildren(childrenData)
        
        // Calculate stats
        const activeChildren = childrenData.filter(child => child.status === 'active').length
        setStats(prev => ({
          ...prev,
          totalChildren: childrenData.length,
          activeChildren
        }))
      }

      // Fetch recent daily logs
      const { data: logsData, error: logsError } = await client
        .from('daily_logs')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false })
        .limit(20)

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

        // Calculate additional stats
        const totalLogs = logsData.length
        const lastActivity = logsData.length > 0 ? logsData[0].created_at : null
        
        // Calculate average logs per day (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentLogs = logsData.filter(log => new Date(log.date) >= thirtyDaysAgo)
        const averageLogsPerDay = recentLogs.length / 30

        setStats(prev => ({
          ...prev,
          totalLogs,
          averageLogsPerDay: Math.round(averageLogsPerDay * 10) / 10,
          lastActivity
        }))
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error)
      toast.error('Failed to load teacher information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading teacher information...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600 mb-4">The teacher you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/admin/teachers/[id]">
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
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
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-2 sm:mr-3" />
                    {teacher.full_name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Teacher Profile & Performance
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(teacher.active_status)}>
                  {teacher.active_status ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">Assigned Children</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalChildren}</p>
                    <p className="text-blue-100 text-xs">{stats.activeChildren} active</p>
                  </div>
                  <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Total Logs</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalLogs}</p>
                    <p className="text-green-100 text-xs">All time</p>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Avg Logs/Day</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.averageLogsPerDay}</p>
                    <p className="text-purple-100 text-xs">Last 30 days</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm">Last Activity</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'None'}
                    </p>
                    <p className="text-orange-100 text-xs">Recent update</p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 sm:mb-8 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'children', label: 'Assigned Children', icon: Baby },
              { id: 'logs', label: 'Daily Logs', icon: FileText },
              { id: 'performance', label: 'Performance', icon: Star },
              { id: 'schedule', label: 'Schedule', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 text-emerald-700'
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
              {/* Teacher Information */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Teacher Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Full Name</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {teacher.full_name}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Email</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {teacher.email}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Phone</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {teacher.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Address</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {teacher.address || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Emergency Contact</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {teacher.emergency_contact || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-semibold text-gray-600">Joined Date</label>
                        <p className="text-sm sm:text-base font-medium text-gray-900">
                          {new Date(teacher.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest daily logs and updates</CardDescription>
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
                                <span className="font-medium text-gray-700">Notes:</span>
                                <p className="text-gray-600 mt-1">
                                  {log.notes || 'No notes'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-sm text-gray-400 mt-1">Activity will appear here as teacher updates daily logs</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 sm:space-y-8">
                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="h-5 w-5 mr-2" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Children Assigned</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {stats.totalChildren}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Active Children</span>
                        <Badge className="bg-green-100 text-green-800">
                          {stats.activeChildren}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Logs</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {stats.totalLogs}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Avg Logs/Day</span>
                        <Badge className="bg-orange-100 text-orange-800">
                          {stats.averageLogsPerDay}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        View All Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Baby className="h-4 w-4 mr-2" />
                        Manage Children
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Baby className="h-5 w-5 mr-2" />
                  Assigned Children
                </CardTitle>
                <CardDescription>Children currently assigned to this teacher</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedChildren.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {assignedChildren.map((child) => (
                      <Card key={child.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base font-semibold">
                                {child.first_name} {child.last_name}
                              </CardTitle>
                              <CardDescription>
                                {calculateAge(child.date_of_birth)}
                              </CardDescription>
                            </div>
                            <Badge className={getStatusColor(child.status === 'active')}>
                              {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                Born: {new Date(child.date_of_birth).toLocaleDateString()}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-3"
                              onClick={() => router.push(`/dashboard/admin/children/${child.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No children assigned</p>
                    <p className="text-sm text-gray-400 mt-1">Children will appear here when assigned to this teacher</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'logs' && (
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
                    <p className="text-sm text-gray-400 mt-1">Daily logs will appear here as teacher updates them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'performance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Teacher performance and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activity Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Children Assigned</span>
                        <Badge className="bg-blue-100 text-blue-800">{stats.totalChildren}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Active Children</span>
                        <Badge className="bg-green-100 text-green-800">{stats.activeChildren}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Daily Logs</span>
                        <Badge className="bg-purple-100 text-purple-800">{stats.totalLogs}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Average Logs/Day</span>
                        <Badge className="bg-orange-100 text-orange-800">{stats.averageLogsPerDay}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Last Activity</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {stats.lastActivity ? 
                            new Date(stats.lastActivity).toLocaleDateString() : 
                            'No recent activity'
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Days Since Last Log</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {stats.lastActivity ? 
                            Math.floor((new Date().getTime() - new Date(stats.lastActivity).getTime()) / (1000 * 60 * 60 * 24)) : 
                            'N/A'
                          } days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'schedule' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule
                </CardTitle>
                <CardDescription>Teacher's schedule and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Schedule management coming soon</p>
                  <p className="text-sm text-gray-400 mt-1">This feature will show teacher's schedule and availability</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </RoleGuard>
  )
} 