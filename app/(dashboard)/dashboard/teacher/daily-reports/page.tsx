'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/guards/roleGuard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send,
  FileText,
  Baby,
  Clock,
  Calendar,
  Utensils,
  Bed,
  Activity,
  Smile,
  Heart,
  Plus,
  Trash2,
  Camera,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  parent_email: string;
}

interface DailyReportForm {
  child_id: string;
  child_name: string;
  date: string;
  attendance: boolean;
  mood: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral';
  meals: { time: string; food: string; amount: 'all' | 'most' | 'some' | 'none' }[];
  naps: { start_time: string; end_time: string; notes: string }[];
  activities: string[];
  diaper_changes: number;
  potty_breaks: number;
  medication_given: boolean;
  injuries: string;
  behavior_notes: string;
  learning_highlights: string;
  photos_taken: number;
  parent_notes: string;
}

const TeacherDailyReportsPage = () => {
  const { user } = useSupabase();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [reportForm, setReportForm] = useState<DailyReportForm>({
    child_id: '',
    child_name: '',
    date: new Date().toISOString().split('T')[0],
    attendance: true,
    mood: 'happy',
    meals: [{ time: '12:00', food: '', amount: 'all' }],
    naps: [{ start_time: '13:00', end_time: '14:30', notes: '' }],
    activities: [],
    diaper_changes: 0,
    potty_breaks: 0,
    medication_given: false,
    injuries: '',
    behavior_notes: '',
    learning_highlights: '',
    photos_taken: 0,
    parent_notes: ''
  });
  const [availableActivities] = useState([
    'Circle Time', 'Art & Crafts', 'Music & Movement', 'Outdoor Play', 
    'Story Time', 'Sensory Play', 'Building Blocks', 'Science Activity',
    'Free Play', 'Snack Time', 'Group Games', 'Nature Walk'
  ]);

  // Mock children data
  useEffect(() => {
    const mockChildren: Child[] = [
      { id: '1', first_name: 'Emma', last_name: 'Johnson', parent_email: 'sarah.johnson@email.com' },
      { id: '2', first_name: 'Liam', last_name: 'Smith', parent_email: 'john.smith@email.com' },
      { id: '3', first_name: 'Sophie', last_name: 'Davis', parent_email: 'mary.davis@email.com' },
      { id: '4', first_name: 'Mason', last_name: 'Wilson', parent_email: 'david.wilson@email.com' },
      { id: '5', first_name: 'Ava', last_name: 'Brown', parent_email: 'lisa.brown@email.com' },
      { id: '6', first_name: 'Oliver', last_name: 'Taylor', parent_email: 'mike.taylor@email.com' }
    ];
    setChildren(mockChildren);
  }, []);

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setReportForm({
      ...reportForm,
      child_id: child.id,
      child_name: `${child.first_name} ${child.last_name}`
    });
  };

  const addMeal = () => {
    setReportForm({
      ...reportForm,
      meals: [...reportForm.meals, { time: '', food: '', amount: 'all' }]
    });
  };

  const removeMeal = (index: number) => {
    setReportForm({
      ...reportForm,
      meals: reportForm.meals.filter((_, i) => i !== index)
    });
  };

  const updateMeal = (index: number, field: string, value: string) => {
    const updatedMeals = reportForm.meals.map((meal, i) => 
      i === index ? { ...meal, [field]: value } : meal
    );
    setReportForm({ ...reportForm, meals: updatedMeals });
  };

  const addNap = () => {
    setReportForm({
      ...reportForm,
      naps: [...reportForm.naps, { start_time: '', end_time: '', notes: '' }]
    });
  };

  const removeNap = (index: number) => {
    setReportForm({
      ...reportForm,
      naps: reportForm.naps.filter((_, i) => i !== index)
    });
  };

  const updateNap = (index: number, field: string, value: string) => {
    const updatedNaps = reportForm.naps.map((nap, i) => 
      i === index ? { ...nap, [field]: value } : nap
    );
    setReportForm({ ...reportForm, naps: updatedNaps });
  };

  const toggleActivity = (activity: string) => {
    if (reportForm.activities.includes(activity)) {
      setReportForm({
        ...reportForm,
        activities: reportForm.activities.filter(a => a !== activity)
      });
    } else {
      setReportForm({
        ...reportForm,
        activities: [...reportForm.activities, activity]
      });
    }
  };

  const handleSubmitReport = () => {
    if (!selectedChild) {
      toast.error('Please select a child first');
      return;
    }

    if (!reportForm.learning_highlights) {
      toast.error('Please add learning highlights for the day');
      return;
    }

    // Mock API call
    toast.success(`Daily report sent to ${selectedChild.first_name}'s parents!`);
    
    // Reset form
    setReportForm({
      child_id: '',
      child_name: '',
      date: new Date().toISOString().split('T')[0],
      attendance: true,
      mood: 'happy',
      meals: [{ time: '12:00', food: '', amount: 'all' }],
      naps: [{ start_time: '13:00', end_time: '14:30', notes: '' }],
      activities: [],
      diaper_changes: 0,
      potty_breaks: 0,
      medication_given: false,
      injuries: '',
      behavior_notes: '',
      learning_highlights: '',
      photos_taken: 0,
      parent_notes: ''
    });
    setSelectedChild(null);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="h-4 w-4 text-yellow-500" />;
      case 'sad': return <Heart className="h-4 w-4 text-blue-500" />;
      case 'tired': return <Bed className="h-4 w-4 text-purple-500" />;
      case 'energetic': return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Smile className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <RoleGuard path="/dashboard/teacher/daily-reports">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 text-green-600 mr-3" />
              Daily Reports
            </h1>
            <p className="text-gray-600 mt-2">
              Create and send daily care reports to parents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Child Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Child</CardTitle>
                  <CardDescription>Choose a child to create their daily report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleChildSelect(child)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedChild?.id === child.id 
                            ? 'bg-green-50 border-green-300 text-green-900' 
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{child.first_name} {child.last_name}</p>
                            <p className="text-sm text-gray-600">{child.parent_email}</p>
                          </div>
                          <Baby className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Form */}
            <div className="lg:col-span-2">
              {selectedChild ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Report for {selectedChild.first_name} {selectedChild.last_name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reportForm.date).toLocaleDateString()}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={reportForm.date}
                          onChange={(e) => setReportForm({...reportForm, date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attendance</label>
                        <select
                          value={reportForm.attendance.toString()}
                          onChange={(e) => setReportForm({...reportForm, attendance: e.target.value === 'true'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="true">Present</option>
                          <option value="false">Absent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mood</label>
                        <select
                          value={reportForm.mood}
                          onChange={(e) => setReportForm({...reportForm, mood: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="happy">Happy</option>
                          <option value="sad">Sad</option>
                          <option value="tired">Tired</option>
                          <option value="energetic">Energetic</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center">
                          <Utensils className="h-5 w-5 mr-2 text-orange-500" />
                          Meals & Snacks
                        </h3>
                        <Button size="sm" variant="outline" onClick={addMeal}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Meal
                        </Button>
                      </div>
                      {reportForm.meals.map((meal, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                          <Input
                            type="time"
                            value={meal.time}
                            onChange={(e) => updateMeal(index, 'time', e.target.value)}
                            placeholder="Time"
                          />
                          <Input
                            value={meal.food}
                            onChange={(e) => updateMeal(index, 'food', e.target.value)}
                            placeholder="Food/Snack"
                          />
                          <select
                            value={meal.amount}
                            onChange={(e) => updateMeal(index, 'amount', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="all">Ate All</option>
                            <option value="most">Ate Most</option>
                            <option value="some">Ate Some</option>
                            <option value="none">Ate None</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeMeal(index)}
                            disabled={reportForm.meals.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Naps */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center">
                          <Bed className="h-5 w-5 mr-2 text-purple-500" />
                          Naps & Rest
                        </h3>
                        <Button size="sm" variant="outline" onClick={addNap}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Nap
                        </Button>
                      </div>
                      {reportForm.naps.map((nap, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg">
                          <Input
                            type="time"
                            value={nap.start_time}
                            onChange={(e) => updateNap(index, 'start_time', e.target.value)}
                            placeholder="Start time"
                          />
                          <Input
                            type="time"
                            value={nap.end_time}
                            onChange={(e) => updateNap(index, 'end_time', e.target.value)}
                            placeholder="End time"
                          />
                          <Input
                            value={nap.notes}
                            onChange={(e) => updateNap(index, 'notes', e.target.value)}
                            placeholder="Notes"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeNap(index)}
                            disabled={reportForm.naps.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Activities */}
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-500" />
                        Activities Participated
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableActivities.map((activity) => (
                          <button
                            key={activity}
                            onClick={() => toggleActivity(activity)}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              reportForm.activities.includes(activity)
                                ? 'bg-blue-50 border-blue-300 text-blue-900'
                                : 'hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            {activity}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Care Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Diaper Changes</label>
                        <Input
                          type="number"
                          min="0"
                          value={reportForm.diaper_changes}
                          onChange={(e) => setReportForm({...reportForm, diaper_changes: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Potty Breaks</label>
                        <Input
                          type="number"
                          min="0"
                          value={reportForm.potty_breaks}
                          onChange={(e) => setReportForm({...reportForm, potty_breaks: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={reportForm.medication_given}
                            onChange={(e) => setReportForm({...reportForm, medication_given: e.target.checked})}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">Medication Given</span>
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Photos Taken</label>
                          <Input
                            type="number"
                            min="0"
                            value={reportForm.photos_taken}
                            onChange={(e) => setReportForm({...reportForm, photos_taken: parseInt(e.target.value) || 0})}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Injuries/Incidents</label>
                        <textarea
                          value={reportForm.injuries}
                          onChange={(e) => setReportForm({...reportForm, injuries: e.target.value})}
                          placeholder="Any injuries or incidents (leave blank if none)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Behavior & Social Notes</label>
                        <textarea
                          value={reportForm.behavior_notes}
                          onChange={(e) => setReportForm({...reportForm, behavior_notes: e.target.value})}
                          placeholder="How was their behavior? Social interactions?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Learning Highlights *</label>
                        <textarea
                          value={reportForm.learning_highlights}
                          onChange={(e) => setReportForm({...reportForm, learning_highlights: e.target.value})}
                          placeholder="What did they learn today? Any milestones or achievements?"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Notes for Parents</label>
                        <textarea
                          value={reportForm.parent_notes}
                          onChange={(e) => setReportForm({...reportForm, parent_notes: e.target.value})}
                          placeholder="Any special messages or reminders for parents"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button onClick={handleSubmitReport} className="w-full md:w-auto">
                        <Send className="h-4 w-4 mr-2" />
                        Send Daily Report to Parents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Child</h3>
                    <p className="text-gray-600">
                      Choose a child from the list to create their daily report
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default TeacherDailyReportsPage;
