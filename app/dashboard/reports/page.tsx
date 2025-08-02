'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Activity,
  Users,
  Star,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Download as DownloadIcon
} from 'lucide-react'
import { formatDate, formatTime, getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  parent_id: string
}

interface DailyLog {
  id: string
  child_id: string
  date: string
  meals: {
    breakfast: string | null
    lunch: string | null
    snack: string | null
  }
  naps: {
    morning: string | null
    afternoon: string | null
  }
  activities: string[]
  notes: string | null
  mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral'
  created_at: string
  updated_at: string
}

interface DevelopmentMilestone {
  id: string
  child_id: string
  category: 'physical' | 'cognitive' | 'social' | 'language'
  milestone: string
  achieved_date: string
  notes: string | null
  created_at: string
}

interface AttendanceRecord {
  id: string
  child_id: string
  date: string
  check_in: string | null
  check_out: string | null
  hours_attended: number
  created_at: string
}

export default function ReportsPage() {
  const { user, client: supabase } = useSupabase()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [selectedReport, setSelectedReport] = useState<string>('overview')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([])
  const [milestones, setMilestones] = useState<DevelopmentMilestone[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchChildren()
    }
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      fetchReportData()
    }
  }, [selectedChild, dateRange])

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', user?.id)

      if (error) throw error
      setChildren(data || [])
      if (data && data.length > 0) {
        setSelectedChild(data[0])
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      toast.error('Failed to load children information')
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    if (!selectedChild) return

    try {
      // Fetch daily logs
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('child_id', selectedChild.id)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: false })

      if (logsError) throw logsError
      setDailyLogs(logsData || [])

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('development_milestones')
        .select('*')
        .eq('child_id', selectedChild.id)
        .gte('achieved_date', dateRange.start)
        .lte('achieved_date', dateRange.end)
        .order('achieved_date', { ascending: false })

      if (milestonesError) throw milestonesError
      setMilestones(milestonesData || [])

      // Fetch attendance (mock data for now)
      setAttendance([
        {
          id: '1',
          child_id: selectedChild.id,
          date: '2024-01-15',
          check_in: '08:30',
          check_out: '16:00',
          hours_attended: 7.5,
          created_at: '2024-01-15T08:30:00Z'
        },
        {
          id: '2',
          child_id: selectedChild.id,
          date: '2024-01-16',
          check_in: '08:45',
          check_out: '15:30',
          hours_attended: 6.75,
          created_at: '2024-01-16T08:45:00Z'
        }
      ])
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to load report data')
    }
  }

  const generateReport = async (reportType: string) => {
    if (!selectedChild) return

    try {
      // In a real app, this would generate a PDF or CSV report
      toast.success(`${reportType} report generated successfully`)
      
      // Simulate download
      const link = document.createElement('a')
      link.href = '#'
      link.download = `${selectedChild.first_name}_${reportType}_report.pdf`
      link.click()
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  const getMoodStats = () => {
    const moodCounts = dailyLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return moodCounts
  }

  const getActivityStats = () => {
    const activityCounts: Record<string, number> = {}
    dailyLogs.forEach(log => {
      log.activities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1
      })
    })
    return activityCounts
  }

  const getMilestoneStats = () => {
    const categoryCounts = milestones.reduce((acc, milestone) => {
      acc[milestone.category] = (acc[milestone.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return categoryCounts
  }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading reports...</p>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            View detailed reports about your child's progress and development
          </p>
        </div>

        {/* Child and Date Range Selector */}
        <div className="mb-8 space-y-4">
          {children.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child
              </label>
              <div className="flex flex-wrap gap-2">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild?.id === child.id ? 'default' : 'outline'}
                    onClick={() => setSelectedChild(child)}
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>{child.first_name} {child.last_name}</span>
                    <Badge variant="secondary">{child.age_group}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReportData} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Update Reports
              </Button>
            </div>
          </div>
        </div>

        {selectedChild ? (
          <div className="space-y-8">
            {/* Report Type Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Report Types
                </CardTitle>
                <CardDescription>
                  Choose the type of report you want to view
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'attendance', label: 'Attendance', icon: Calendar },
                    { id: 'development', label: 'Development', icon: TrendingUp },
                    { id: 'activities', label: 'Activities', icon: Activity }
                  ].map((report) => {
                    const Icon = report.icon
                    return (
                      <Button
                        key={report.id}
                        variant={selectedReport === report.id ? 'default' : 'outline'}
                        onClick={() => setSelectedReport(report.id)}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{report.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Overview Report */}
            {selectedReport === 'overview' && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Days Attended</p>
                          <p className="text-2xl font-bold text-gray-900">{dailyLogs.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Milestones Achieved</p>
                          <p className="text-2xl font-bold text-gray-900">{milestones.length}</p>
                        </div>
                        <Award className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Hours</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {attendance.reduce((sum, record) => sum + record.hours_attended, 0).toFixed(1)}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Avg. Mood</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {dailyLogs.length > 0 ? 'Happy' : 'N/A'}
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mood Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="h-5 w-5 mr-2" />
                      Mood Analysis
                    </CardTitle>
                    <CardDescription>
                      Breakdown of {selectedChild.first_name}'s mood over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-4">
                      {Object.entries(getMoodStats()).map(([mood, count]) => (
                        <div key={mood} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                          <div className="text-sm text-gray-600 capitalize">{mood}</div>
                          <div className="text-xs text-gray-500">
                            {((count / dailyLogs.length) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Activity Analysis
                    </CardTitle>
                    <CardDescription>
                      Most common activities during the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(getActivityStats())
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([activity, count]) => (
                          <div key={activity} className="flex items-center justify-between p-3 border rounded-lg">
                            <span className="text-sm font-medium text-gray-900">{activity}</span>
                            <Badge variant="outline">{count} times</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Attendance Report */}
            {selectedReport === 'attendance' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Attendance Report
                    </div>
                    <Button onClick={() => generateReport('attendance')}>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Detailed attendance records for {selectedChild.first_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check In
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Check Out
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendance.map((record) => (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(record.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.check_in || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.check_out || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.hours_attended} hours
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Development Report */}
            {selectedReport === 'development' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Development Report
                    </div>
                    <Button onClick={() => generateReport('development')}>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Milestones and development progress for {selectedChild.first_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(getMilestoneStats()).map(([category, count]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 capitalize">{category}</h4>
                          <Badge variant="outline">{count} milestones</Badge>
                        </div>
                        <div className="space-y-2">
                          {milestones
                            .filter(m => m.category === category)
                            .slice(0, 3)
                            .map((milestone) => (
                              <div key={milestone.id} className="text-sm">
                                <p className="font-medium text-gray-900">{milestone.milestone}</p>
                                <p className="text-gray-600">{formatDate(milestone.achieved_date)}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities Report */}
            {selectedReport === 'activities' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Activities Report
                    </div>
                    <Button onClick={() => generateReport('activities')}>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Daily activities and engagement for {selectedChild.first_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailyLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {formatDate(log.date)}
                          </h4>
                          <Badge variant="outline" className="capitalize">{log.mood}</Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Activities</h5>
                            <div className="flex flex-wrap gap-1">
                              {log.activities.map((activity, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {activity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Notes</h5>
                            <p className="text-sm text-gray-600">
                              {log.notes || 'No notes for this day'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
              <p className="text-gray-600 mb-4">
                Enroll your child to view detailed reports
              </p>
              <Button asChild>
                <a href="/dashboard/enroll">Enroll Child</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 