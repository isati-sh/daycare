'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Calendar, 
  Download, 
  ArrowLeft,
  Clock,
  User,
  Activity,
  Baby,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Heart,
  Utensils,
  Coffee,
  Bed,
  Palette,
  BookOpen,
  Target,
  Award
} from 'lucide-react'
import { Database } from '@/types/database'
import RoleGuard from '@/components/guards/roleGuard'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']
type Attendance = Database['public']['Tables']['attendance']['Row']
type PortfolioEntry = Database['public']['Tables']['portfolio_entries']['Row']
type DevelopmentMilestone = Database['public']['Tables']['development_milestones']['Row']
type IncidentReport = Database['public']['Tables']['incident_reports']['Row']
type Child = Database['public']['Views']['children_with_parents']['Row']

interface FullReport {
  child: Child | null
  date: string
  dailyLog: DailyLog | null
  attendance: Attendance | null
  portfolioEntries: PortfolioEntry[]
  milestones: DevelopmentMilestone[]
  incidents: IncidentReport[]
  teacherName: string
}

export default function FullReportPage() {
  const { user, client, role } = useSupabase()
  const searchParams = useSearchParams()
  const [report, setReport] = useState<FullReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const childId = searchParams.get('childId')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (user && client && childId) {
      fetchFullReport()
    }
  }, [user, client, childId, date])

  const fetchFullReport = async () => {
    if (!user || !client || !childId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch child information
      const { data: childData, error: childError } = await client
        .from('children_with_parents')
        .select('*')
        .eq('child_id', childId)
        .eq('parent_id', user.id)
        .single()

      if (childError || !childData) {
        setError('Child not found or access denied')
        setLoading(false)
        return
      }

      // Fetch daily log
      const { data: dailyLogData, error: dailyLogError } = await client
        .from('daily_logs')
        .select(`
          *,
          teacher:profiles!daily_logs_teacher_id_fkey(full_name)
        `)
        .eq('child_id', childId)
        .eq('date', date)
        .single()

      // Fetch attendance
      const { data: attendanceData, error: attendanceError } = await client
        .from('attendance')
        .select(`
          *,
          teacher:profiles!attendance_recorded_by_fkey(full_name)
        `)
        .eq('child_id', childId)
        .eq('date', date)
        .single()

      // Fetch portfolio entries for the date
      const { data: portfolioData, error: portfolioError } = await client
        .from('portfolio_entries')
        .select('*')
        .eq('child_id', childId)
        .eq('date', date)

      // Fetch milestones for the date
      const { data: milestonesData, error: milestonesError } = await client
        .from('development_milestones')
        .select('*')
        .eq('child_id', childId)
        .eq('achieved_date', date)

      // Fetch incidents for the date
      const { data: incidentsData, error: incidentsError } = await client
        .from('incident_reports')
        .select(`
          *,
          teacher:profiles!incident_reports_reported_by_fkey(full_name)
        `)
        .eq('child_id', childId)
        .eq('date', date)

      const teacherName = dailyLogData?.teacher?.full_name || 
                        attendanceData?.teacher?.full_name || 
                        incidentsData?.[0]?.teacher?.full_name || 
                        'Unknown Teacher'

      setReport({
        child: childData,
        date,
        dailyLog: dailyLogData || null,
        attendance: attendanceData || null,
        portfolioEntries: portfolioData || [],
        milestones: milestonesData || [],
        incidents: incidentsData || [],
        teacherName
      })

    } catch (error) {
      console.error('Error fetching full report:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    // Generate PDF report
    toast.success('Downloading report...')
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Heart className="h-4 w-4 text-green-500" />
      case 'sad': return <XCircle className="h-4 w-4 text-blue-500" />
      case 'tired': return <Bed className="h-4 w-4 text-gray-500" />
      case 'energetic': return <Activity className="h-4 w-4 text-yellow-500" />
      case 'fussy': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'excited': return <TrendingUp className="h-4 w-4 text-pink-500" />
      default: return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getAttendanceStatus = (status: string) => {
    switch (status) {
      case 'present': return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-600' }
      case 'absent': return { icon: <XCircle className="h-4 w-4 text-red-500" />, color: 'text-red-600' }
      case 'late': return { icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600' }
      case 'early_pickup': return { icon: <Clock className="h-4 w-4 text-blue-500" />, color: 'text-blue-600' }
      default: return { icon: <User className="h-4 w-4 text-gray-500" />, color: 'text-gray-600' }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'art': return <Palette className="h-4 w-4 text-pink-500" />
      case 'learning': return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'physical': return <Activity className="h-4 w-4 text-green-500" />
      case 'social': return <User className="h-4 w-4 text-purple-500" />
      case 'milestone': return <Award className="h-4 w-4 text-orange-500" />
      default: return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <RoleGuard path="/dashboard/parent/reports/full-report">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading full report...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (error) {
    return (
      <RoleGuard path="/dashboard/parent/reports/full-report">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  if (!report) {
    return (
      <RoleGuard path="/dashboard/parent/reports/full-report">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Report Found</h2>
            <p className="text-gray-600">No report data available for this date.</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard path="/dashboard/parent/reports/full-report">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <FileText className="h-8 w-8 mr-3" />
                    Full Report
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {report.child?.first_name} {report.child?.last_name} • {new Date(date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button onClick={handleDownloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Child Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Baby className="h-5 w-5 mr-2" />
                Child Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg">{report.child?.first_name} {report.child?.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age Group</p>
                  <Badge className="mt-1">{report.child?.age_group}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Teacher</p>
                  <p className="text-lg">{report.teacherName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Daily Activities
                </CardTitle>
                <CardDescription>
                  {report.dailyLog ? 'Daily log completed' : 'No daily log for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.dailyLog ? (
                  <div className="space-y-4">
                    {/* Mood */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mood</span>
                      <div className="flex items-center">
                        {getMoodIcon(report.dailyLog.mood)}
                        <span className="ml-2 capitalize">{report.dailyLog.mood}</span>
                      </div>
                    </div>

                    {/* Activities */}
                    {report.dailyLog.activities && report.dailyLog.activities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Activities Completed</p>
                        <div className="space-y-1">
                          {report.dailyLog.activities.map((activity, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {report.dailyLog.meals && report.dailyLog.meals.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center">
                          <Utensils className="h-4 w-4 mr-1" />
                          Meals
                        </p>
                        <div className="space-y-1">
                          {report.dailyLog.meals.map((meal, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium capitalize">{meal.type}</span>: {meal.food} ({meal.quantity} {meal.unit}) at {meal.time}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drinks */}
                    {report.dailyLog.drinks && report.dailyLog.drinks.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center">
                          <Coffee className="h-4 w-4 mr-1" />
                          Drinks
                        </p>
                        <div className="space-y-1">
                          {report.dailyLog.drinks.map((drink, index) => (
                            <div key={index} className="text-sm">
                              {drink.type}: {drink.quantity} {drink.unit} at {drink.time}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Naps */}
                    {report.dailyLog.naps && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          Naps
                        </p>
                        <div className="text-sm space-y-1">
                          {report.dailyLog.naps.morning_start && (
                            <div>Morning: {formatTime(report.dailyLog.naps.morning_start)} - {formatTime(report.dailyLog.naps.morning_end || '')}</div>
                          )}
                          {report.dailyLog.naps.afternoon_start && (
                            <div>Afternoon: {formatTime(report.dailyLog.naps.afternoon_start)} - {formatTime(report.dailyLog.naps.afternoon_end || '')}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {report.dailyLog.notes && (
                      <div>
                        <p className="text-sm font-medium mb-2">Teacher Notes</p>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                          {report.dailyLog.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No daily log available for this date</p>
                )}
              </CardContent>
            </Card>

            {/* Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Attendance
                </CardTitle>
                <CardDescription>
                  {report.attendance ? 'Attendance recorded' : 'No attendance record for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.attendance ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <div className="flex items-center">
                        {getAttendanceStatus(report.attendance.status).icon}
                        <span className={`ml-2 capitalize ${getAttendanceStatus(report.attendance.status).color}`}>
                          {report.attendance.status}
                        </span>
                      </div>
                    </div>

                    {report.attendance.check_in_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Check In</span>
                        <span className="text-sm">{formatTime(report.attendance.check_in_time)}</span>
                      </div>
                    )}

                    {report.attendance.check_out_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Check Out</span>
                        <span className="text-sm">{formatTime(report.attendance.check_out_time)}</span>
                      </div>
                    )}

                    {report.attendance.notes && (
                      <div>
                        <p className="text-sm font-medium mb-2">Notes</p>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                          {report.attendance.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No attendance record available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Entries */}
          {report.portfolioEntries.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Portfolio Entries
                </CardTitle>
                <CardDescription>
                  {report.portfolioEntries.length} entry{report.portfolioEntries.length !== 1 ? 'ies' : ''} for this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.portfolioEntries.map((entry) => (
                    <div key={entry.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center mb-2">
                        {getCategoryIcon(entry.category)}
                        <span className="ml-2 text-sm font-medium capitalize">{entry.category}</span>
                        <Badge variant="outline" className="ml-2">{entry.date}</Badge>
                      </div>
                      <h4 className="font-medium">{entry.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                      {entry.teacher_notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Teacher Notes:</p>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded mt-1">
                            {entry.teacher_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Development Milestones */}
          {report.milestones.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Development Milestones
                </CardTitle>
                <CardDescription>
                  {report.milestones.length} milestone{report.milestones.length !== 1 ? 's' : ''} achieved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.milestones.map((milestone) => (
                    <div key={milestone.id} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center mb-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="ml-2 text-sm font-medium capitalize">{milestone.category}</span>
                        <Badge variant="outline" className="ml-2">{milestone.achieved_date}</Badge>
                      </div>
                      <h4 className="font-medium">{milestone.milestone}</h4>
                      {milestone.notes && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Incident Reports */}
          {report.incidents.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Incident Reports
                </CardTitle>
                <CardDescription>
                  {report.incidents.length} incident{report.incidents.length !== 1 ? 's' : ''} reported
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.incidents.map((incident) => (
                    <div key={incident.id} className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="ml-2 text-sm font-medium capitalize">{incident.type}</span>
                        </div>
                        <Badge 
                          variant={incident.severity === 'high' ? 'destructive' : incident.severity === 'medium' ? 'default' : 'secondary'}
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{incident.description}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="font-medium">Time:</span> {incident.time}</p>
                        <p className="text-sm"><span className="font-medium">Action Taken:</span> {incident.action_taken}</p>
                        {incident.parent_notified && (
                          <p className="text-sm text-green-600">
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                            Parent notified
                          </p>
                        )}
                        {incident.follow_up_required && (
                          <p className="text-sm text-orange-600">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Follow-up required
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {report.dailyLog ? '✓' : '✗'}
                  </p>
                  <p className="text-sm text-gray-600">Daily Log</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {report.attendance ? '✓' : '✗'}
                  </p>
                  <p className="text-sm text-gray-600">Attendance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.portfolioEntries.length}
                  </p>
                  <p className="text-sm text-gray-600">Portfolio Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.milestones.length}
                  </p>
                  <p className="text-sm text-gray-600">Milestones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
