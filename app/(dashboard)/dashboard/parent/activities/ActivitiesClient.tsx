"use client";

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/types/database';

type PlannedActivity = Database['public']['Tables']['planned_activities']['Row'] & {
  children_participating: number;
  child_name: string;
};

interface Props {
  activities: PlannedActivity[];
  selectedDate: string;
}

export default function ActivitiesClient({ activities, selectedDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [date, setDate] = useState<string>(selectedDate);
  const [selectedChildFilter, setSelectedChildFilter] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    const base = activities.filter((a) => !date || a.date === date);
    if (selectedChildFilter === 'participating') {
      return base.filter((a) => a.children_participating > 0);
    }
    return base;
  }, [activities, date, selectedChildFilter]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'art': return 'bg-pink-100 text-pink-800';
      case 'music': return 'bg-purple-100 text-purple-800';
      case 'outdoor': return 'bg-green-100 text-green-800';
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'sensory': return 'bg-yellow-100 text-yellow-800';
      case 'physical': return 'bg-orange-100 text-orange-800';
      case 'dramatic_play': return 'bg-indigo-100 text-indigo-800';
      case 'science': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const onDateChange = (value: string) => {
    setDate(value);
    const url = `${pathname}?date=${value}`;
    router.replace(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Daily Activities</h1>
          <div className="text-sm text-gray-600">{filteredActivities.length} activities planned</div>
        </div>

        {/* Date and Filter Controls */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <Input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} className="w-48" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Child</label>
            <select
              value={selectedChildFilter}
              onChange={(e) => setSelectedChildFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md w-48"
            >
              <option value="all">All Activities</option>
              <option value="participating">My Children Can Participate</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => { setDate(''); router.replace(pathname); }}>Show All Dates</Button>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{activity.name}</CardTitle>
                    <p className="text-gray-600 text-sm mt-1">
                      {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(activity.category)}>
                      {activity.category.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-700">{activity.description}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Age Groups:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activity.age_groups.map((ageGroup, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {ageGroup}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {activity.materials_needed && activity.materials_needed.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm">Materials:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activity.materials_needed.map((material, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {activity.learning_objectives && activity.learning_objectives.length > 0 && (
                    <div>
                      <span className="font-semibold text-sm">Learning Objectives:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activity.learning_objectives.map((objective, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {objective}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-sm">Your Children:</span>
                    <p className="text-gray-600 text-sm mt-1">{activity.child_name}</p>
                  </div>

                  {activity.weather_dependent && (
                    <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                      <p className="text-yellow-800 text-sm">⚠️ Weather dependent activity</p>
                    </div>
                  )}

                  {activity.teacher_notes && (
                    <div>
                      <span className="font-semibold text-sm">Teacher Notes:</span>
                      <p className="text-gray-600 text-sm mt-1">{activity.teacher_notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No activities found for this date.</p>
            <p className="text-gray-400 mt-2">Try selecting a different date or check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
