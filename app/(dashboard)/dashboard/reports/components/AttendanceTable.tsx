'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download as DownloadIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Database } from '@/types/database';
import { formatTimeString, calculateHours } from './utils';

type AttendanceRecord = Database['public']['Tables']['attendance']['Row'];

interface AttendanceTableProps {
  attendance: AttendanceRecord[];
  childName: string;
}

export default function AttendanceTable({ attendance, childName }: AttendanceTableProps) {
  if (attendance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Report
          </CardTitle>
          <CardDescription>Detailed attendance records for {childName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No attendance records found for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Report
          </div>
          <Button onClick={() => alert('PDF generation coming soon')}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download
          </Button>
        </CardTitle>
        <CardDescription>Detailed attendance records for {childName}</CardDescription>
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
                  Status
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => {
                const hours = calculateHours(record.check_in_time, record.check_out_time);
                const statusColors = {
                  present: 'bg-green-100 text-green-800',
                  absent: 'bg-red-100 text-red-800',
                  late: 'bg-yellow-100 text-yellow-800',
                  early_pickup: 'bg-blue-100 text-blue-800',
                };
                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={statusColors[record.status] || 'bg-gray-100 text-gray-800'}
                      >
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeString(record.check_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeString(record.check_out_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hours > 0 ? `${hours.toFixed(1)}h` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

