'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  Users,
  Star,
  Award,
  Clock,
  BarChart3,
  PieChart,
  Download as DownloadIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';
import { calculateHours, formatTimeString, getTotalHours, getOnTimeRate } from './utils';
import AttendanceTable from './AttendanceTable';
import AttendanceSummary from './AttendanceSummary';
import ChildSelector from './ChildSelector';
import DateRangeSelector from './DateRangeSelector';

type Child = Database['public']['Tables']['children']['Row'];
type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];
type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
type DevelopmentMilestone = Database['public']['Tables']['development_milestones']['Row'];

interface ReportsDashboardProps {
  children: Child[];
  selectedChild: Child;
  attendance: AttendanceRecord[];
  dailyLogs: DailyLog[];
  milestones: DevelopmentMilestone[];
  startDate: string;
  endDate: string;
}

export default function ReportsDashboard({
  children,
  selectedChild,
  attendance,
  dailyLogs,
  milestones,
  startDate,
  endDate,
}: ReportsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedReport, setSelectedReport] = useState<string>('overview');

  const handleChildChange = (childId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('childId', childId);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('start', start);
    params.set('end', end);
    router.push(`/dashboard/reports?${params.toString()}`);
  };

  const getMoodStats = () => {
    const moodCounts = dailyLogs.reduce((acc, log) => {
      const mood = log.mood || 'neutral';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return moodCounts;
  };

  const getActivityStats = () => {
    const activityCounts: Record<string, number> = {};
    dailyLogs.forEach((log) => {
      const activities = Array.isArray(log.activities) ? log.activities : [];
      activities.forEach((activity) => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    return activityCounts;
  };

  const getMilestoneStats = () => {
    const categoryCounts = milestones.reduce((acc, milestone) => {
      acc[milestone.category] = (acc[milestone.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return categoryCounts;
  };

  const totalHours = getTotalHours(attendance);
  const onTimeRate = getOnTimeRate(attendance);

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
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onChildChange={handleChildChange}
          />
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Report Type Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Report Types
            </CardTitle>
            <CardDescription>Choose the type of report you want to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'attendance', label: 'Attendance', icon: Calendar },
                { id: 'development', label: 'Development', icon: TrendingUp },
                { id: 'activities', label: 'Activities', icon: Activity },
              ].map((report) => {
                const Icon = report.icon;
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
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            <AttendanceSummary
              dailyLogsCount={dailyLogs.length}
              milestonesCount={milestones.length}
              totalHours={totalHours}
              onTimeRate={onTimeRate}
            />

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
                {dailyLogs.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No mood data available for the selected period
                  </div>
                )}
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
                {Object.keys(getActivityStats()).length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(getActivityStats())
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 6)
                      .map(([activity, count]) => (
                        <div
                          key={activity}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-900">{activity}</span>
                          <Badge variant="outline">{count} times</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No activity data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Report */}
        {selectedReport === 'attendance' && (
          <AttendanceTable
            attendance={attendance}
            childName={selectedChild.first_name}
          />
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
                <Button onClick={() => alert('PDF generation coming soon')}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
              <CardDescription>
                Milestones and development progress for {selectedChild.first_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {milestones.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(getMilestoneStats()).map(([category, count]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 capitalize">{category}</h4>
                        <Badge variant="outline">{count} milestones</Badge>
                      </div>
                      <div className="space-y-2">
                        {milestones
                          .filter((m) => m.category === category)
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No milestones recorded for the selected period
                </div>
              )}
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
                <Button onClick={() => alert('PDF generation coming soon')}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
              <CardDescription>
                Daily activities and engagement for {selectedChild.first_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dailyLogs.length > 0 ? (
                <div className="space-y-4">
                  {dailyLogs.map((log) => {
                    const activities = Array.isArray(log.activities) ? log.activities : [];
                    return (
                      <div key={log.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{formatDate(log.date)}</h4>
                          <Badge variant="outline" className="capitalize">
                            {log.mood || 'neutral'}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Activities</h5>
                            <div className="flex flex-wrap gap-1">
                              {activities.length > 0 ? (
                                activities.map((activity, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {activity}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">No activities recorded</span>
                              )}
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
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activity logs available for the selected period
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

