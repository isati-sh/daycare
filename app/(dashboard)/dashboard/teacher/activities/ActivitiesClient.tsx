'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Database } from '@/types/database';
import toast from 'react-hot-toast';
import { createActivity, updateActivity, deleteActivity } from './actions';
import { useRouter } from 'next/navigation';

type PlannedActivity = Database['public']['Tables']['planned_activities']['Row'] & {
  children_participating: number;
};

interface Props {
  activities: PlannedActivity[];
  selectedDate: string;
}

export default function ActivitiesClient({ activities, selectedDate }: Props) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activityForm, setActivityForm] = useState({
    name: '',
    description: '',
    category: 'learning' as
      | 'art'
      | 'music'
      | 'outdoor'
      | 'learning'
      | 'sensory'
      | 'physical'
      | 'dramatic_play'
      | 'science',
    start_time: '',
    end_time: '',
    age_groups: [] as string[],
    max_participants: '',
    materials_needed: '',
    learning_objectives: '',
    teacher_notes: '',
    weather_dependent: false,
  });

  const handleDateChange = (newDate: string) => {
    router.push(`/dashboard/teacher/activities?date=${newDate}`);
  };

  const handleAddActivity = async () => {
    if (!activityForm.name || !activityForm.description || !activityForm.start_time || !activityForm.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (activityForm.age_groups.length === 0) {
      toast.error('Please select at least one age group');
      return;
    }

    setSaving(true);

    try {
      const result = await createActivity({
        name: activityForm.name,
        description: activityForm.description,
        category: activityForm.category,
        start_time: activityForm.start_time,
        end_time: activityForm.end_time,
        age_groups: activityForm.age_groups,
        max_participants: activityForm.max_participants ? parseInt(activityForm.max_participants) : null,
        materials_needed: activityForm.materials_needed
          ? activityForm.materials_needed.split(',').map((m) => m.trim())
          : [],
        learning_objectives: activityForm.learning_objectives
          ? activityForm.learning_objectives.split(',').map((o) => o.trim())
          : [],
        teacher_notes: activityForm.teacher_notes || null,
        date: selectedDate,
        weather_dependent: activityForm.weather_dependent,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Activity created successfully');
        setShowAddForm(false);
        setActivityForm({
          name: '',
          description: '',
          category: 'learning',
          start_time: '',
          end_time: '',
          age_groups: [],
          max_participants: '',
          materials_needed: '',
          learning_objectives: '',
          teacher_notes: '',
          weather_dependent: false,
        });
      }
    } catch (error) {
      toast.error('Failed to create activity');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'art':
        return 'bg-pink-100 text-pink-800';
      case 'music':
        return 'bg-purple-100 text-purple-800';
      case 'outdoor':
        return 'bg-green-100 text-green-800';
      case 'learning':
        return 'bg-blue-100 text-blue-800';
      case 'sensory':
        return 'bg-yellow-100 text-yellow-800';
      case 'physical':
        return 'bg-orange-100 text-orange-800';
      case 'dramatic_play':
        return 'bg-indigo-100 text-indigo-800';
      case 'science':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Activities</h1>
        <Button onClick={() => setShowAddForm(true)}>Add Activity</Button>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <Card key={activity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{activity.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
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
                  <p className="text-gray-600 text-sm mt-1">
                    {activity.children_participating} children can participate
                  </p>
                </div>

                {activity.max_participants && (
                  <div>
                    <span className="font-semibold text-sm">Max Participants:</span>
                    <p className="text-gray-600 text-sm mt-1">{activity.max_participants}</p>
                  </div>
                )}

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

      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No activities planned for this date.</p>
          <p className="text-gray-400 mt-2">Click "Add Activity" to create a new one.</p>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Add New Activity</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs sm:text-sm">
                  Activity Name *
                </Label>
                <Input
                  id="name"
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-xs sm:text-sm">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, description: e.target.value })
                  }
                  className="text-sm sm:text-base mt-1 min-h-[80px] sm:min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="category" className="text-xs sm:text-sm">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={activityForm.category}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base h-10 sm:h-12 mt-1"
                  >
                    <option value="art">Art</option>
                    <option value="music">Music</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="learning">Learning</option>
                    <option value="sensory">Sensory</option>
                    <option value="physical">Physical</option>
                    <option value="dramatic_play">Dramatic Play</option>
                    <option value="science">Science</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="max_participants" className="text-xs sm:text-sm">
                    Max Participants
                  </Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={activityForm.max_participants}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, max_participants: e.target.value })
                    }
                    className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="start_time" className="text-xs sm:text-sm">
                    Start Time *
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={activityForm.start_time}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, start_time: e.target.value })
                    }
                    className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time" className="text-xs sm:text-sm">
                    End Time *
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={activityForm.end_time}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, end_time: e.target.value })
                    }
                    className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="age_groups" className="text-xs sm:text-sm">
                  Age Groups *
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['infant', 'toddler', 'preschool'].map((ageGroup) => (
                    <label key={ageGroup} className="flex items-center text-xs sm:text-sm">
                      <input
                        type="checkbox"
                        checked={activityForm.age_groups.includes(ageGroup)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActivityForm({
                              ...activityForm,
                              age_groups: [...activityForm.age_groups, ageGroup],
                            });
                          } else {
                            setActivityForm({
                              ...activityForm,
                              age_groups: activityForm.age_groups.filter((ag) => ag !== ageGroup),
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      {ageGroup}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="materials_needed" className="text-xs sm:text-sm">
                  Materials Needed (comma-separated)
                </Label>
                <Input
                  id="materials_needed"
                  value={activityForm.materials_needed}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, materials_needed: e.target.value })
                  }
                  placeholder="paint, paper, brushes"
                  className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="learning_objectives" className="text-xs sm:text-sm">
                  Learning Objectives (comma-separated)
                </Label>
                <Input
                  id="learning_objectives"
                  value={activityForm.learning_objectives}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, learning_objectives: e.target.value })
                  }
                  placeholder="color recognition, fine motor skills"
                  className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="teacher_notes" className="text-xs sm:text-sm">
                  Teacher Notes
                </Label>
                <Textarea
                  id="teacher_notes"
                  value={activityForm.teacher_notes}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, teacher_notes: e.target.value })
                  }
                  className="text-sm sm:text-base mt-1 min-h-[80px] sm:min-h-[100px]"
                />
              </div>
              <div>
                <label className="flex items-center text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={activityForm.weather_dependent}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, weather_dependent: e.target.checked })
                    }
                    className="mr-2"
                  />
                  Weather dependent activity
                </label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                onClick={handleAddActivity}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Add Activity'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
