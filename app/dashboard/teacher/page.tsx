'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Plus,
  FileText,
  Activity,
  Utensils,
  Bed,
  Smile,
  CheckCircle,
  AlertCircle,
  Droplets,
  Image as ImageIcon,
  Trash2,
  Clock,
  Calendar,
  Camera,
  MessageCircle,
  Heart
} from 'lucide-react'
import { formatDate, formatTime, getAge } from '@/lib/utils'
import toast from 'react-hot-toast'

// --- TimePicker component ---
function TimePicker({
  value,
  onChange,
  id,
  placeholder,
  className,
}: {
  value: string
  onChange: (val: string) => void
  id?: string
  placeholder?: string
  className?: string
}) {
  function toInputTime(val: string) {
    if (!val) return ''
    const ampmMatch = val.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/)
    if (ampmMatch) {
      let hour = parseInt(ampmMatch[1], 10)
      const min = ampmMatch[2]
      const ampm = ampmMatch[3].toUpperCase()
      if (ampm === 'PM' && hour < 12) hour += 12
      if (ampm === 'AM' && hour === 12) hour = 0
      return `${hour.toString().padStart(2, '0')}:${min}`
    }
    const timeMatch = val.match(/^(\d{1,2}):(\d{2})$/)
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
    }
    return ''
  }
  function toDisplayTime(val: string) {
    if (!val) return ''
    const [h, m] = val.split(':')
    let hour = parseInt(h, 10)
    const min = m
    if (isNaN(hour) || !min) return ''
    const ampm = hour >= 12 ? 'PM' : 'AM'
    if (hour === 0) hour = 12
    else if (hour > 12) hour = hour - 12
    return `${hour}:${min} ${ampm}`
  }
  return (
    <input
      type="time"
      id={id}
      className={className || "w-full border rounded px-2 py-1"}
      value={toInputTime(value)}
      onChange={e => {
        const val = e.target.value
        onChange(toDisplayTime(val))
      }}
      placeholder={placeholder}
    />
  )
}

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  parent_id: string
  allergies: string[] | null
  medical_notes: string | null
}

interface DailyLog {
  id: string;
  child_id: string;
  date: string;
  meals: Array<{
    type: string;
    food: string;
    quantity: string;
    unit: string;
    time: string;
  }>;
  drinks: Array<{
    type: string;
    quantity: string;
    unit: string;
    time: string;
  }>;
  naps: {
    morning: string | null;
    afternoon: string | null;
  };
  activities: Array<{
    name: string;
    imageUrls?: string[];
  }>;
  notes: string | null;
  mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral';
  sickness: string | null;
  medications: Array<{
    name: string;
    dose: string;
    time: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string
  name: string
  description: string
  category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory'
  duration: number
  age_groups: string[]
}

const dummyChildren: Child[] = [
  {
    id: '1',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2021-03-15',
    age_group: 'toddler',
    parent_id: 'parent1',
    allergies: ['peanuts', 'dairy'],
    medical_notes: 'Asthma - uses inhaler as needed'
  },
  {
    id: '2',
    first_name: 'Liam',
    last_name: 'Smith',
    date_of_birth: '2020-08-22',
    age_group: 'preschool',
    parent_id: 'parent2',
    allergies: null,
    medical_notes: null
  }
]

const now = new Date().toISOString();
const dummyDailyLogs: DailyLog[] = [
  {
    id: '1',
    child_id: '1',
    date: new Date().toISOString().split('T')[0],
    meals: [
      {
        type: 'breakfast',
        food: 'Oatmeal with berries',
        quantity: '1',
        unit: 'bowl',
        time: '08:00'
      }
    ],
    drinks: [
      { type: 'water', quantity: '3', unit: 'cups', time: '09:00' }
    ],
    naps: { morning: '9:30 AM - 11:00 AM', afternoon: '1:30 PM - 3:00 PM' },
    activities: [
      { name: 'Circle time', imageUrls: [] },
      { name: 'Art project', imageUrls: [] }
    ],
    notes:
      'Emma had a great day! She was very social and participated well in all activities.',
    mood: 'happy',
    sickness: 'None',
    medications: [
      { name: 'Albuterol inhaler', dose: 'as needed', time: '10:00' }
    ],
    created_at: now,
    updated_at: now,
  },
  {
    id: '2',
    child_id: '2',
    date: new Date().toISOString().split('T')[0],
    meals: [
      {
        type: 'breakfast',
        food: 'Cereal with milk',
        quantity: '1',
        unit: 'bowl',
        time: '08:15'
      }
    ],
    drinks: [
      { type: 'water', quantity: '4', unit: 'cups', time: '09:30' }
    ],
    naps: { morning: '10:00 AM - 11:30 AM', afternoon: '2:00 PM - 3:30 PM' },
    activities: [
      { name: 'Science experiment', imageUrls: [] },
      { name: 'Music class', imageUrls: [] }
    ],
    notes: 'Liam showed great interest in the science experiment today.',
    mood: 'energetic',
    sickness: 'Mild cough',
    medications: [
      { name: 'Cough syrup', dose: '5ml', time: '12:00' }
    ],
    created_at: now,
    updated_at: now,
  },
];

export default function TeacherDashboard() {
  const { user, client: supabase } = useSupabase();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editLog, setEditLog] = useState<DailyLog | null>(null);
  // const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview'); // Not used

  useEffect(() => {
    setChildren(dummyChildren);
    setDailyLogs(dummyDailyLogs);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchDailyLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('first_name');
      if (error) throw error;
      setChildren(data || []);
    } catch (error: any) {
      console.error('Error fetching children:', error);
      toast.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyLogs = async () => {
    if (!selectedChild) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('child_id', selectedChild.id)
        .eq('date', today);
      if (error) throw error;
      setDailyLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching daily logs:', error);
      toast.error('Failed to load daily logs');
    }
  };

  const createOrUpdateDailyLog = async (logData: Partial<DailyLog>, logId?: string) => {
    if (!selectedChild) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      if (logId) {
        const { error } = await supabase
          .from('daily_logs')
          .update({
            ...logData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', logId);
        if (error) throw error;
        toast.success('Daily log updated successfully');
      } else {
        const { error } = await supabase.from('daily_logs').upsert([
          {
            child_id: selectedChild.id,
            date: today,
            ...logData,
          },
        ]);
        if (error) throw error;
        toast.success('Daily log created successfully');
      }
      fetchDailyLogs();
      setShowLogForm(false);
      setEditLog(null);
    } catch (error: any) {
      console.error('Error saving daily log:', error);
      toast.error('Failed to save daily log');
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <Smile className="h-5 w-5 text-green-500" />;
      case 'sad':
        return <Smile className="h-5 w-5 text-blue-500 rotate-180" />;
      case 'tired':
        return <Bed className="h-5 w-5 text-gray-500" />;
      case 'energetic':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      default:
        return <Smile className="h-5 w-5 text-gray-400" />;
    }
  };

  const todayLog = dailyLogs.find(
    (log) =>
      log.child_id === selectedChild?.id &&
      log.date === new Date().toISOString().split('T')[0]
  );

  const completedLogs = children.filter(child => {
    const childLog = dailyLogs.find(
      log => log.child_id === child.id && 
      log.date === new Date().toISOString().split('T')[0]
    );
    return childLog;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your classroom and track daily activities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{completedLogs}/{children.length}</div>
                <div className="text-sm text-gray-600">Daily logs completed</div>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Children Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Logs</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{completedLogs}</span>
                      <span className="text-sm text-gray-500">/ {children.length}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${children.length > 0 ? (completedLogs / children.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">8</div>
                      <div className="text-xs text-gray-600">Activities</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">12</div>
                      <div className="text-xs text-gray-600">Meals Served</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Your Class
                  </div>
                  <Badge variant="outline">{children.length} children</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {children.map((child) => {
                    const childLog = dailyLogs.find(
                      (log) =>
                        log.child_id === child.id &&
                        log.date === new Date().toISOString().split('T')[0]
                    );
                    
                    return (
                      <div
                        key={child.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedChild?.id === child.id
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedChild(child)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {child.first_name[0]}
                              </div>
                              {childLog && (
                                <div className="absolute -top-1 -right-1">
                                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {child.first_name} {child.last_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {getAge(child.date_of_birth)} years • {child.age_group}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="capitalize mb-1">
                              {child.age_group}
                            </Badge>
                            {childLog && (
                              <div className="flex items-center justify-end">
                                {getMoodIcon(childLog.mood)}
                                <span className="text-xs text-gray-600 ml-1 capitalize">
                                  {childLog.mood}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {child.allergies && child.allergies.length > 0 && (
                          <div className="mt-2 flex items-center">
                            <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-xs text-red-600">
                              Allergies: {child.allergies.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Child Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedChild ? (
              <>
                {/* Child Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {selectedChild.first_name[0]}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedChild.first_name} {selectedChild.last_name}
                          </h2>
                          <p className="text-gray-600">
                            {getAge(selectedChild.date_of_birth)} years old • {selectedChild.age_group}
                          </p>
                          {selectedChild.allergies && selectedChild.allergies.length > 0 && (
                            <div className="flex items-center mt-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-sm text-red-600">
                                Allergies: {selectedChild.allergies.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {selectedChild.age_group}
                        </Badge>
                        {!todayLog ? (
                          <Button onClick={() => { setShowLogForm(true); setEditLog(null); }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Log
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditLog(todayLog);
                              setShowLogForm(true);
                            }}
                          >
                            Edit Log
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Report */}
                {todayLog ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Today's Report
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {getMoodIcon(todayLog.mood)}
                            <span className="text-sm text-gray-600 ml-1 capitalize">
                              {todayLog.mood}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Updated {formatTime(todayLog.updated_at)}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quick Overview */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Utensils className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-blue-600">{todayLog.meals?.length || 0}</div>
                          <div className="text-xs text-gray-600">Meals</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Bed className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-green-600">
                            {(todayLog.naps && todayLog.naps.morning ? 1 : 0) + (todayLog.naps && todayLog.naps.afternoon ? 1 : 0)}
                          </div>
                          <div className="text-xs text-gray-600">Naps</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-purple-600">{todayLog.activities?.length || 0}</div>
                          <div className="text-xs text-gray-600">Activities</div>
                        </div>
                      </div>

                      {/* Meals */}
                      {todayLog.meals && todayLog.meals.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Utensils className="h-4 w-4 mr-2" />
                            Meals
                          </h4>
                          <div className="grid gap-3">
                            {todayLog.meals.map((meal, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="capitalize">
                                    {meal.type}
                                  </Badge>
                                  <span className="font-medium">{meal.food}</span>
                                  <span className="text-sm text-gray-600">
                                    {meal.quantity} {meal.unit}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {meal.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {todayLog.activities && todayLog.activities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Activity className="h-4 w-4 mr-2" />
                            Activities
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {todayLog.activities.map((activity, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{activity.name}</span>
                                  {activity.imageUrls && activity.imageUrls.length > 0 && (
                                    <Camera className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {todayLog.notes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Notes
                          </h4>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{todayLog.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Medical Information */}
                      {(todayLog.sickness || (todayLog.medications && todayLog.medications.length > 0)) && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Heart className="h-4 w-4 mr-2" />
                            Health & Wellness
                          </h4>
                          <div className="space-y-3">
                            {todayLog.sickness && (
                              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="font-medium text-red-800 text-sm">Sickness</div>
                                <div className="text-sm text-red-700">{todayLog.sickness}</div>
                              </div>
                            )}
                            {todayLog.medications && todayLog.medications.length > 0 && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="font-medium text-blue-800 text-sm">Medications</div>
                                <div className="space-y-1 mt-2">
                                  {todayLog.medications.map((med, index) => (
                                    <div key={index} className="text-sm text-blue-700">
                                      <span className="font-medium">{med.name}</span>
                                      {med.dose && <> — {med.dose}</>}
                                      {med.time && <> @ {med.time}</>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Report Yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {selectedChild?.first_name}'s daily report hasn't been completed yet.
                      </p>
                      <Button onClick={() => { setShowLogForm(true); setEditLog(null); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Daily Log
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a Child
                  </h3>
                  <p className="text-gray-600">
                    Choose a child from the list to view their details and create daily logs
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {showLogForm && selectedChild ? (
          <DailyLogForm
            child={selectedChild}
            onSubmit={createOrUpdateDailyLog}
            onClose={() => { setShowLogForm(false); setEditLog(null); }}
            editLog={editLog}
          />
        ) : null}
      </div>
    </div>
  );
}

function ActivityButtonWithPhotos({ activity }: { activity: { name: string; imageUrls?: string[] } }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="capitalize"
        onClick={() => setOpen(true)}
      >
        {activity.name}
        {activity.imageUrls && activity.imageUrls.length > 0 && (
          <ImageIcon className="h-4 w-4 ml-2 text-blue-500" />
        )}
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setOpen(false)}
            >
              ×
            </Button>
            <h3 className="text-lg font-semibold mb-4">{activity.name}</h3>
            {activity.imageUrls && activity.imageUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activity.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Activity ${activity.name} photo`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No photos uploaded for this activity.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Daily Log Form Component
function DailyLogForm({
  child,
  onSubmit,
  onClose,
  editLog
}: {
  child: Child
  onSubmit: (data: Partial<DailyLog>, logId?: string) => void
  onClose: () => void
  editLog?: DailyLog | null
}) {
  // Activities options
  const activityOptions = [
    'Art & Crafts',
    'Story Time',
    'Outdoor Play',
    'Music & Movement',
    'Learning Games',
    'Free Play'
  ];

  // State for selected activities (array of names)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  // State for activity images (map activity name -> File[])
  const [activityImages, setActivityImages] = useState<{ [activity: string]: File[] }>({});
  // State for activity image previews (map activity name -> string[])
  const [activityImagePreviews, setActivityImagePreviews] = useState<{ [activity: string]: string[] }>({});
  // Refs for file inputs
  const fileInputRefs = useRef<{ [activity: string]: HTMLInputElement | null }>({});

  // Meals and drinks are now dynamic arrays with time
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'snack', label: 'Snack' },
    { value: 'dinner', label: 'Dinner' }
  ];
  const drinkTypes = [
    { value: 'water', label: 'Water' },
    { value: 'milk', label: 'Milk' },
    { value: 'juice', label: 'Juice' },
    { value: 'other', label: 'Other' }
  ];

  // Form data state
  const [formData, setFormData] = useState(() => {
    if (editLog) {
      // Extract selected activities from editLog
      // const actNames = (editLog.activities || []).map(a => a.name); // unused
      return {
        meals: editLog.meals && editLog.meals.length > 0 ? editLog.meals : [
          { type: '', food: '', quantity: '', unit: '', time: '' }
        ],
        drinks: editLog.drinks && editLog.drinks.length > 0 ? editLog.drinks : [
          { type: '', quantity: '', unit: '', time: '' }
        ],
        naps: editLog.naps || { morning: '', afternoon: '' },
        activities: editLog.activities || [],
        notes: editLog.notes || '',
        mood: editLog.mood || 'happy',
        sickness: editLog.sickness || '',
        medications: Array.isArray(editLog.medications) ? editLog.medications : []
      }
    }
    return {
      meals: [
        { type: '', food: '', quantity: '', unit: '', time: '' }
      ],
      drinks: [
        { type: '', quantity: '', unit: '', time: '' }
      ],
      naps: {
        morning: '',
        afternoon: ''
      },
      activities: [] as Array<{ name: string; imageUrls?: string[] }>,
      notes: '',
      mood: 'happy' as const,
      sickness: '',
      medications: [] as Array<{ name: string; dose: string; time: string }>
    }
  });

  // On mount or editLog change, set selectedActivities and image previews
  useEffect(() => {
    if (editLog) {
      const actNames = (editLog.activities || []).map(a => a.name);
      setSelectedActivities(actNames);
      // Set activity image previews if any
      if (editLog.activities) {
        const previews: { [activity: string]: string[] } = {};
        editLog.activities.forEach(act => {
          if (act.imageUrls && act.imageUrls.length > 0) {
            previews[act.name] = act.imageUrls;
          }
        });
        setActivityImagePreviews(previews);
      } else {
        setActivityImagePreviews({});
      }
      setActivityImages({});
      setFormData({
        meals: editLog.meals && editLog.meals.length > 0 ? editLog.meals : [
          { type: '', food: '', quantity: '', unit: '', time: '' }
        ],
        drinks: editLog.drinks && editLog.drinks.length > 0 ? editLog.drinks : [
          { type: '', quantity: '', unit: '', time: '' }
        ],
        naps: editLog.naps || { morning: '', afternoon: '' },
        activities: editLog.activities || [],
        notes: editLog.notes || '',
        mood: editLog.mood || 'happy',
        sickness: editLog.sickness || '',
        medications: Array.isArray(editLog.medications) ? editLog.medications : []
      });
    } else {
      setSelectedActivities([]);
      setActivityImagePreviews({});
      setActivityImages({});
      setFormData({
        meals: [
          { type: '', food: '', quantity: '', unit: '', time: '' }
        ],
        drinks: [
          { type: '', quantity: '', unit: '', time: '' }
        ],
        naps: {
          morning: '',
          afternoon: ''
        },
        activities: [],
        notes: '',
        mood: 'happy' as const,
        sickness: '',
        medications: []
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editLog]);

  // Handle meal add/remove
  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [
        ...prev.meals,
        { type: '', food: '', quantity: '', unit: '', time: '' }
      ]
    }));
  };
  const removeMeal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.length === 1
        ? [{ type: '', food: '', quantity: '', unit: '', time: '' }]
        : prev.meals.filter((_, i) => i !== index)
    }));
  };

  // Handle drink add/remove
  const addDrink = () => {
    setFormData(prev => ({
      ...prev,
      drinks: [
        ...prev.drinks,
        { type: '', quantity: '', unit: '', time: '' }
      ]
    }));
  };
  const removeDrink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drinks: prev.drinks.length === 1
        ? [{ type: '', quantity: '', unit: '', time: '' }]
        : prev.drinks.filter((_, i) => i !== index)
    }));
  };

  // Handle activity selection (multi-select)
  const toggleActivity = (activityName: string) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityName)) {
        // Remove activity
        // Also remove from activityImages and activityImagePreviews
        setActivityImages(images => {
          const newObj = { ...images };
          delete newObj[activityName];
          return newObj;
        });
        setActivityImagePreviews(previews => {
          const newObj = { ...previews };
          delete newObj[activityName];
          return newObj;
        });
        return prev.filter(a => a !== activityName);
      } else {
        return [...prev, activityName];
      }
    });
  };

  // Handle image upload for activities
  const handleActivityImageChange = (activityName: string, files: FileList | null) => {
    if (!files) return;
    const fileArr = Array.from(files);
    setActivityImages(prev => ({
      ...prev,
      [activityName]: fileArr
    }));
    // For preview
    const previews = fileArr.map(file => URL.createObjectURL(file));
    setActivityImagePreviews(prev => ({
      ...prev,
      [activityName]: previews
    }));
  };

  // Remove a single image from an activity
  const removeActivityImage = (activityName: string, index: number) => {
    setActivityImages(prev => {
      const arr = prev[activityName] ? [...prev[activityName]] : [];
      arr.splice(index, 1);
      return { ...prev, [activityName]: arr };
    });
    setActivityImagePreviews(prev => {
      const arr = prev[activityName] ? [...prev[activityName]] : [];
      arr.splice(index, 1);
      return { ...prev, [activityName]: arr };
    });
  };

  // Medications add/remove
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dose: '', time: '' }
      ]
    }));
  };
  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.length === 1
        ? [{ name: '', dose: '', time: '' }]
        : prev.medications.filter((_, i) => i !== index)
    }));
  };

  // On submit, upload images to storage and get URLs (simulate for now)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate that required fields are filled
    const hasMeals = formData.meals.some(meal => meal.food)
    const hasDrinks = formData.drinks.some(drink => drink.quantity)
    if (!hasMeals && !hasDrinks) {
      toast.error('Please record at least one meal or drink')
      return
    }

    // Build activities array with selected activities and their images
    const activitiesWithImages = selectedActivities.map(name => {
      // If editing, try to preserve existing imageUrls if not changed
      let urls: string[] = [];
      if (activityImagePreviews[name] && activityImagePreviews[name].length > 0) {
        urls = activityImagePreviews[name];
      } else if (editLog && editLog.activities) {
        const found = editLog.activities.find(a => a.name === name);
        if (found && found.imageUrls && found.imageUrls.length > 0) {
          urls = found.imageUrls;
        }
      }
      return { name, imageUrls: urls };
    });

    const dataToSubmit = {
      ...formData,
      activities: activitiesWithImages
    };

    if (editLog) {
      onSubmit(dataToSubmit, editLog.id)
    } else {
      onSubmit(dataToSubmit)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editLog ? `Edit Daily Log for ${child.first_name}` : `Daily Log for ${child.first_name}`}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Meals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Utensils className="h-5 w-5 mr-2" />
                Meals
              </h3>
              <div className="flex flex-col gap-4">
                {formData.meals.map((meal, index) => (
                  <div key={index} className="space-y-2 border rounded p-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeMeal(index)}
                      aria-label="Remove meal"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Label htmlFor={`meal-type-${index}`}>Meal Type</Label>
                    <select
                      id={`meal-type-${index}`}
                      className="w-full border rounded px-2 py-1"
                      value={meal.type}
                      onChange={e => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...newMeals[index], type: e.target.value };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                    >
                      <option value="">Select meal type</option>
                      {mealTypes.map(mt => (
                        <option key={mt.value} value={mt.value}>{mt.label}</option>
                      ))}
                    </select>
                    <Label htmlFor={`meal-food-${index}`}>Food</Label>
                    <Input
                      id={`meal-food-${index}`}
                      value={meal.food}
                      onChange={(e) => {
                        const newMeals = [...formData.meals];
                        newMeals[index] = { ...newMeals[index], food: e.target.value };
                        setFormData({ ...formData, meals: newMeals });
                      }}
                      placeholder="What did they eat?"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={meal.quantity}
                        onChange={(e) => {
                          const newMeals = [...formData.meals];
                          newMeals[index] = { ...newMeals[index], quantity: e.target.value };
                          setFormData({ ...formData, meals: newMeals });
                        }}
                        placeholder="Quantity"
                      />
                      <Input
                        value={meal.unit}
                        onChange={(e) => {
                          const newMeals = [...formData.meals];
                          newMeals[index] = { ...newMeals[index], unit: e.target.value };
                          setFormData({ ...formData, meals: newMeals });
                        }}
                        placeholder="Unit (bowl, pieces, etc.)"
                      />
                      <Input
                        type="time"
                        value={meal.time || ""}
                        onChange={e => {
                          const newMeals = [...formData.meals];
                          newMeals[index] = { ...newMeals[index], time: e.target.value };
                          setFormData({ ...formData, meals: newMeals });
                        }}
                        id={`meal-time-${index}`}
                        placeholder="Time"
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addMeal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>
            </div>

            {/* Drinks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Droplets className="h-5 w-5 mr-2" />
                Drinks
              </h3>
              <div className="flex flex-col gap-4">
                {formData.drinks.map((drink, index) => (
                  <div key={index} className="space-y-2 border rounded p-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeDrink(index)}
                      aria-label="Remove drink"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Label htmlFor={`drink-type-${index}`}>Drink Type</Label>
                    <select
                      id={`drink-type-${index}`}
                      className="w-full border rounded px-2 py-1"
                      value={drink.type}
                      onChange={e => {
                        const newDrinks = [...formData.drinks];
                        newDrinks[index] = { ...newDrinks[index], type: e.target.value };
                        setFormData({ ...formData, drinks: newDrinks });
                      }}
                    >
                      <option value="">Select drink type</option>
                      {drinkTypes.map(dt => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={drink.quantity}
                        onChange={(e) => {
                          const newDrinks = [...formData.drinks];
                          newDrinks[index] = { ...newDrinks[index], quantity: e.target.value };
                          setFormData({ ...formData, drinks: newDrinks });
                        }}
                        placeholder="Quantity"
                      />
                      <Input
                        value={drink.unit}
                        onChange={(e) => {
                          const newDrinks = [...formData.drinks];
                          newDrinks[index] = { ...newDrinks[index], unit: e.target.value };
                          setFormData({ ...formData, drinks: newDrinks });
                        }}
                        placeholder="Unit (cups, oz)"
                      />
                      <TimePicker
                        value={drink.time}
                        onChange={val => {
                          const newDrinks = [...formData.drinks];
                          newDrinks[index] = { ...newDrinks[index], time: val };
                          setFormData({ ...formData, drinks: newDrinks });
                        }}
                        id={`drink-time-${index}`}
                        placeholder="Time"
                      />
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDrink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Drink
                </Button>
              </div>
            </div>

            {/* Naps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Bed className="h-5 w-5 mr-2" />
                Naps
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="morning-nap">Morning Nap</Label>
                  <Input
                    id="morning-nap"
                    value={formData.naps.morning || ''}
                    onChange={(e) => setFormData({ ...formData, naps: { ...formData.naps, morning: e.target.value } })}
                    placeholder="Duration and time (e.g. 9:30 AM - 11:00 AM)"
                  />
                </div>
                <div>
                  <Label htmlFor="afternoon-nap">Afternoon Nap</Label>
                  <Input
                    id="afternoon-nap"
                    value={formData.naps.afternoon || ''}
                    onChange={(e) => setFormData({ ...formData, naps: { ...formData.naps, afternoon: e.target.value } })}
                    placeholder="Duration and time (e.g. 1:30 PM - 3:00 PM)"
                  />
                </div>
              </div>
            </div>

            {/* Mood */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Mood</h3>
              <div className="flex space-x-4">
                {['happy', 'sad', 'tired', 'energetic', 'neutral'].map((mood) => (
                  <Button
                    key={mood}
                    type="button"
                    variant={formData.mood === mood ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, mood: mood as any })}
                    className="capitalize"
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Activities (with optional photos)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {activityOptions.map((activity) => {
                  const isSelected = selectedActivities.includes(activity);
                  return (
                    <div key={activity} className="flex flex-col gap-2 border rounded p-3 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => toggleActivity(activity)}
                        aria-label={isSelected ? "Remove activity" : "Add activity"}
                      >
                        {isSelected ? <Trash2 className="h-4 w-4 text-red-500" /> : <Plus className="h-4 w-4 text-green-500" />}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                          {activity}
                        </Badge>
                        {isSelected && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!fileInputRefs.current[activity]) return;
                                fileInputRefs.current[activity]?.click();
                              }}
                              className="ml-2"
                            >
                              <ImageIcon className="h-4 w-4 mr-1" />
                              Upload Photo
                            </Button>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              ref={(el) => {
                                fileInputRefs.current[activity] = el;
                              }}
                              onChange={e => handleActivityImageChange(activity, e.target.files)}
                            />
                          </>
                        )}
                      </div>
                      {isSelected && activityImagePreviews[activity] && activityImagePreviews[activity].length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activityImagePreviews[activity].map((url, i) => (
                            <div key={i} className="relative">
                              <img
                                src={url}
                                alt={`Activity ${activity} photo`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="absolute top-0 right-0"
                                onClick={() => removeActivityImage(activity, i)}
                                aria-label="Remove image"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any observations or special notes about the child's day..."
                rows={4}
              />
            </div>

            {/* Sickness */}
            <div>
              <Label htmlFor="sickness">Sickness</Label>
              <Input
                id="sickness"
                value={formData.sickness}
                onChange={e => setFormData({ ...formData, sickness: e.target.value })}
                placeholder="Any sickness symptoms today?"
              />
            </div>

            {/* Medications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">Medications</span>
                <Button type="button" size="sm" variant="outline" onClick={addMedication}>
                  <Plus className="h-4 w-4 mr-1" /> Add Medication
                </Button>
              </h3>
              <div className="flex flex-col gap-4">
                {formData.medications.length === 0 && (
                  <div className="text-gray-500 text-sm">No medications recorded.</div>
                )}
                {formData.medications.map((med, index) => (
                  <div key={index} className="space-y-2 border rounded p-3 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeMedication(index)}
                      aria-label="Remove medication"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    <Label htmlFor={`med-name-${index}`}>Name</Label>
                    <Input
                      id={`med-name-${index}`}
                      value={med.name}
                      onChange={e => {
                        const newMeds = [...formData.medications];
                        newMeds[index] = { ...newMeds[index], name: e.target.value };
                        setFormData({ ...formData, medications: newMeds });
                      }}
                      placeholder="Medication name"
                    />
                    <Label htmlFor={`med-dose-${index}`}>Dose</Label>
                    <Input
                      id={`med-dose-${index}`}
                      value={med.dose}
                      onChange={e => {
                        const newMeds = [...formData.medications];
                        newMeds[index] = { ...newMeds[index], dose: e.target.value };
                        setFormData({ ...formData, medications: newMeds });
                      }}
                      placeholder="Dose (e.g. 5ml, 1 tablet)"
                    />
                    <Label htmlFor={`med-time-${index}`}>Time</Label>
                    <TimePicker
                      value={med.time}
                      onChange={val => {
                        const newMeds = [...formData.medications];
                        newMeds[index] = { ...newMeds[index], time: val };
                        setFormData({ ...formData, medications: newMeds });
                      }}
                      id={`med-time-${index}`}
                      placeholder="Time given"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editLog ? 'Update Daily Log' : 'Save Daily Log'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}