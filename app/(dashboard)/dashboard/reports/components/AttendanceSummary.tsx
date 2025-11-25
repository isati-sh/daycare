'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Award, Clock, TrendingUp } from 'lucide-react';

interface AttendanceSummaryProps {
  dailyLogsCount: number;
  milestonesCount: number;
  totalHours: number;
  onTimeRate: number;
}

export default function AttendanceSummary({
  dailyLogsCount,
  milestonesCount,
  totalHours,
  onTimeRate,
}: AttendanceSummaryProps) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Days Attended</p>
              <p className="text-2xl font-bold text-gray-900">{dailyLogsCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{milestonesCount}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-time Rate</p>
              <p className="text-2xl font-bold text-gray-900">{onTimeRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

