'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Calendar,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Baby,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Database } from '@/types/database';
import RoleGuard from '@/components/guards/roleGuard';
import { useRouter } from 'next/navigation';

type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type PortfolioEntry = Database['public']['Tables']['portfolio_entries']['Row'];
type DevelopmentMilestone =
  Database['public']['Tables']['development_milestones']['Row'];
type IncidentReport = Database['public']['Tables']['incident_reports']['Row'];

interface Report {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'progress' | 'incident';
  child_name: string;
  child_id: string;
  date: string;
  status: 'draft' | 'completed' | 'sent';
  content: string;
  activities_completed: number;
  attendance_rate: number;
  mood_summary: string;
  notes_for_parents: string;
  teacher_name: string;
}

export default function ParentReportsPage() {
  const { user, client, role } = useSupabase();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  useEffect(() => {
    if (user && client) {
      fetchReports();
    }
  }, [user, client, selectedDate]);

  const fetchReports = async () => {
    if (!user || !client) return;

    try {
      setLoading(true);

      // Fetch children for this parent
      const { data: childrenData, error: childrenError } = await client
        .from('children_with_parents')
        .select('*')
        .eq('parent_id', user.id)
        .eq('status', 'active');

      if (childrenError || !childrenData) {
        console.error('Error fetching children:', childrenError);
        setReports([]);
        setLoading(false);
        return;
      }

      const childIds = childrenData.map((child) => child.child_id);
      if (childIds.length === 0) {
        setReports([]);
        setLoading(false);
        return;
      }

      const allReports: Report[] = [];

      // Fetch daily logs as daily reports
      const { data: dailyLogsData, error: dailyLogsError } = await client
        .from('daily_logs')
        .select(
          `
          *,
          child:children!daily_logs_child_id_fkey(first_name, last_name),
          teacher:profiles!daily_logs_teacher_id_fkey(full_name)
        `
        )
        .in('child_id', childIds)
        .eq('date', selectedDate);

      if (!dailyLogsError && dailyLogsData) {
        dailyLogsData.forEach((log) => {
          const childName = `${log.child?.first_name || ''} ${
            log.child?.last_name || ''
          }`.trim();
          const teacherName = log.teacher?.full_name || 'Unknown Teacher';

          allReports.push({
            id: `daily_${log.id}`,
            title: `Daily Report - ${childName}`,
            type: 'daily',
            child_name: childName,
            child_id: log.child_id,
            date: log.date,
            status: 'completed',
            content: log.notes || 'Daily activities and observations',
            activities_completed: log.activities?.length || 0,
            attendance_rate: 100, // Daily logs indicate presence
            mood_summary: log.mood || 'Not recorded',
            notes_for_parents: log.notes || '',
            teacher_name: teacherName,
          });
        });
      }

      // Fetch attendance records
      const { data: attendanceData, error: attendanceError } = await client
        .from('attendance')
        .select(
          `
          *,
          child:children!attendance_child_id_fkey(first_name, last_name),
          teacher:profiles!attendance_recorded_by_fkey(full_name)
        `
        )
        .in('child_id', childIds)
        .eq('date', selectedDate);

      if (!attendanceError && attendanceData) {
        attendanceData.forEach((attendance) => {
          const childName = `${attendance.child?.first_name || ''} ${
            attendance.child?.last_name || ''
          }`.trim();
          const teacherName =
            attendance.teacher?.full_name || 'Unknown Teacher';

          allReports.push({
            id: `attendance_${attendance.id}`,
            title: `Attendance Report - ${childName}`,
            type: 'daily',
            child_name: childName,
            child_id: attendance.child_id,
            date: attendance.date,
            status: 'completed',
            content: `Attendance: ${attendance.status}`,
            activities_completed: 0,
            attendance_rate: attendance.status === 'present' ? 100 : 0,
            mood_summary: 'Not recorded',
            notes_for_parents: attendance.notes || '',
            teacher_name: teacherName,
          });
        });
      }

      // Fetch portfolio entries as progress reports
      const { data: portfolioData, error: portfolioError } = await client
        .from('portfolio_entries')
        .select(
          `
          *,
          child:children!portfolio_entries_child_id_fkey(first_name, last_name)
        `
        )
        .in('child_id', childIds)
        .gte('date', selectedDate)
        .lte('date', selectedDate);

      if (!portfolioError && portfolioData) {
        portfolioData.forEach((entry) => {
          const childName = `${entry.child?.first_name || ''} ${
            entry.child?.last_name || ''
          }`.trim();

          allReports.push({
            id: `portfolio_${entry.id}`,
            title: `Progress Report - ${childName}`,
            type: 'progress',
            child_name: childName,
            child_id: entry.child_id,
            date: entry.date,
            status: 'completed',
            content: entry.description,
            activities_completed: 1,
            attendance_rate: 100,
            mood_summary: 'Positive progress',
            notes_for_parents: entry.teacher_notes || '',
            teacher_name: 'Teacher',
          });
        });
      }

      // Fetch development milestones
      const { data: milestonesData, error: milestonesError } = await client
        .from('development_milestones')
        .select(
          `
          *,
          child:children!development_milestones_child_id_fkey(first_name, last_name)
        `
        )
        .in('child_id', childIds)
        .gte('achieved_date', selectedDate)
        .lte('achieved_date', selectedDate);

      if (!milestonesError && milestonesData) {
        milestonesData.forEach((milestone) => {
          const childName = `${milestone.child?.first_name || ''} ${
            milestone.child?.last_name || ''
          }`.trim();

          allReports.push({
            id: `milestone_${milestone.id}`,
            title: `Milestone Report - ${childName}`,
            type: 'progress',
            child_name: childName,
            child_id: milestone.child_id,
            date: milestone.achieved_date,
            status: 'completed',
            content: `Achieved: ${milestone.milestone}`,
            activities_completed: 1,
            attendance_rate: 100,
            mood_summary: 'Excited about achievement',
            notes_for_parents: milestone.notes || '',
            teacher_name: 'Teacher',
          });
        });
      }

      // Fetch incident reports
      const { data: incidentsData, error: incidentsError } = await client
        .from('incident_reports')
        .select(
          `
          *,
          child:children!incident_reports_child_id_fkey(first_name, last_name),
          teacher:profiles!incident_reports_reported_by_fkey(full_name)
        `
        )
        .in('child_id', childIds)
        .eq('date', selectedDate);

      if (!incidentsError && incidentsData) {
        incidentsData.forEach((incident) => {
          const childName = `${incident.child?.first_name || ''} ${
            incident.child?.last_name || ''
          }`.trim();
          const teacherName = incident.teacher?.full_name || 'Unknown Teacher';

          allReports.push({
            id: `incident_${incident.id}`,
            title: `Incident Report - ${childName}`,
            type: 'incident',
            child_name: childName,
            child_id: incident.child_id,
            date: incident.date,
            status: 'completed',
            content: incident.description,
            activities_completed: 0,
            attendance_rate: 100,
            mood_summary: 'Incident occurred',
            notes_for_parents: incident.action_taken,
            teacher_name: teacherName,
          });
        });
      }

      setReports(allReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesChild =
      selectedChild === 'all' || report.child_name === selectedChild;
    return matchesType && matchesChild;
  });

  const handleDownloadReport = async (
    reportId: string,
    reportTitle: string
  ) => {
    try {
      // Generate and download report
      toast.success(`Downloading ${reportTitle}...`);
      // In a real app, this would generate a PDF or CSV file
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'sent':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'progress':
        return 'bg-orange-100 text-orange-800';
      case 'incident':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique children names for filter
  const childrenNames = Array.from(new Set(reports.map((r) => r.child_name)));

  return (
    <RoleGuard path="/dashboard/parent/reports">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 mr-3" />
              Child Reports
            </h1>
            <p className="text-gray-600 mt-2">
              View reports and progress updates for your children
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
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold">
                      {
                        reports.filter((r) => {
                          const reportDate = new Date(r.date);
                          const now = new Date();
                          const weekAgo = new Date(
                            now.getTime() - 7 * 24 * 60 * 60 * 1000
                          );
                          return reportDate >= weekAgo && reportDate <= now;
                        }).length
                      }
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
                        ? Math.round(
                            reports.reduce(
                              (sum, r) => sum + r.attendance_rate,
                              0
                            ) / reports.length
                          )
                        : 0}
                      %
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
                        ? Math.round(
                            reports.reduce(
                              (sum, r) => sum + r.activities_completed,
                              0
                            ) / reports.length
                          )
                        : 0}
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
                <option value="progress">Progress Reports</option>
                <option value="incident">Incident Reports</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Children</option>
                {childrenNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
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
              </div>
            ) : (
              filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {report.child_name} • {report.teacher_name} •{' '}
                          {new Date(report.date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(report.status) as any}>
                          {report.status}
                        </Badge>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                            report.type
                          )}`}
                        >
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {report.activities_completed} activities completed
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{report.attendance_rate}% attendance</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {new Date(report.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Summary:
                      </h4>
                      <p className="text-sm text-gray-600">{report.content}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Mood Summary:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {report.mood_summary}
                      </p>
                    </div>

                    {report.notes_for_parents && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Notes from Teacher:
                        </h4>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                          {report.notes_for_parents}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownloadReport(report.id, report.title)
                        }
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Navigate to full report page with childId and date as query params
                          const params = new URLSearchParams({
                            childId: report.child_id,
                            date: report.date,
                          });
                          router.push(`/dashboard/parent/reports/full-report?${params.toString()}`);
                        }}
                      >
                        View Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
