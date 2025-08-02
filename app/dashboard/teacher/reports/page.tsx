'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FileText, 
  Calendar, 
  Download, 
  Shield,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Report {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'progress'
  child_name: string
  date: string
  status: 'draft' | 'completed' | 'sent'
  content: string
  activities_completed: number
  attendance_rate: number
  mood_summary: string
  notes_for_parents: string
}

export default function TeacherReportsPage() {
  const { user, client, role } = useSupabase()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [filterType, setFilterType] = useState<string>('all')

  // Dummy data for testing
  const dummyReports: Report[] = [
    {
      id: '1',
      title: 'Daily Report - Emma Johnson',
      type: 'daily',
      child_name: 'Emma Johnson',
      date: '2024-03-15',
      status: 'completed',
      content: 'Emma had a wonderful day today! She participated in all activities and showed great enthusiasm during art time.',
      activities_completed: 5,
      attendance_rate: 100,
      mood_summary: 'Happy and energetic throughout the day',
      notes_for_parents: 'Emma enjoyed the finger painting activity and created a beautiful rainbow picture. She also helped clean up after activities.'
    },
    {
      id: '2',
      title: 'Weekly Progress - Liam Chen',
      type: 'weekly',
      child_name: 'Liam Chen',
      date: '2024-03-15',
      status: 'sent',
      content: 'Liam has shown significant improvement in his language skills this week. He is now using more complex sentences.',
      activities_completed: 25,
      attendance_rate: 100,
      mood_summary: 'Generally happy with occasional moments of shyness',
      notes_for_parents: 'Liam has been very helpful with younger children and shows great leadership qualities. Consider encouraging more social interactions.'
    },
    {
      id: '3',
      title: 'Monthly Assessment - Sophia Wilson',
      type: 'monthly',
      child_name: 'Sophia Wilson',
      date: '2024-03-01',
      status: 'draft',
      content: 'Sophia has made excellent progress in her motor skills and is now walking confidently.',
      activities_completed: 120,
      attendance_rate: 95,
      mood_summary: 'Calm and content, responds well to routine',
      notes_for_parents: 'Sophia is developing well and enjoys quiet activities. She has a special bond with her favorite teacher.'
    }
  ]

  useEffect(() => {
    // Use dummy data for testing
    setReports(dummyReports)
    setLoading(false)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesDate = report.date === selectedDate
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesDate && matchesType
  })

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      // Update report status in database
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus as any }
          : report
      ))

      toast.success('Report status updated')
    } catch (error) {
      toast.error('Failed to update report status')
    }
  }

  const handleDownloadReport = async (reportId: string, reportTitle: string) => {
    try {
      // Generate and download report
      toast.success(`Downloading ${reportTitle}...`)
      // In a real app, this would generate a PDF or CSV file
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'completed': return 'default'
      case 'sent': return 'outline'
      default: return 'secondary'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'progress': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (role !== 'teacher') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Teacher privileges required.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 mr-3" />
            Daily Reports
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage reports for parents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Reports</p>
                  <p className="text-2xl font-bold">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold">
                    {reports.filter(r => r.status === 'completed' && r.date === selectedDate).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Attendance</p>
                  <p className="text-2xl font-bold">
                    {reports.length > 0 
                      ? Math.round(reports.reduce((sum, r) => sum + r.attendance_rate, 0) / reports.length)
                      : 0
                    }%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Avg Activities</p>
                  <p className="text-2xl font-bold">
                    {reports.length > 0 
                      ? Math.round(reports.reduce((sum, r) => sum + r.activities_completed, 0) / reports.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily Reports</option>
              <option value="weekly">Weekly Reports</option>
              <option value="monthly">Monthly Reports</option>
              <option value="progress">Progress Reports</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create New Report
            </Button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports for this date</p>
              <Button className="mt-4">
                <FileText className="h-4 w-4 mr-2" />
                Create First Report
              </Button>
            </div>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.child_name} • {new Date(report.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(report.type)}`}>
                        {report.type}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{report.activities_completed} activities completed</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{report.attendance_rate}% attendance</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary:</h4>
                    <p className="text-sm text-gray-600">{report.content}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Mood Summary:</h4>
                    <p className="text-sm text-gray-600">{report.mood_summary}</p>
                  </div>
                  
                  {report.notes_for_parents && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes for Parents:</h4>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                        {report.notes_for_parents}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(report.id, 'completed')}
                      disabled={report.status === 'completed'}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(report.id, 'sent')}
                      disabled={report.status === 'sent'}
                    >
                      Mark Sent
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadReport(report.id, report.title)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {/* Edit report */}}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 