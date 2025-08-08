'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  FileText,
  Activity,
  Bed,
  Smile,
  Heart,
  Baby,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  X,
  Edit,
  Trash2,
  Clock,
  Save,
  User,
  Megaphone,
} from 'lucide-react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import AnnouncementList from '@/components/ui/announcement-list';
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages';

// Types from database
type Child = Database['public']['Tables']['children']['Row'];
type DailyLog = Database['public']['Tables']['daily_logs']['Row'];
type ActivityType = Database['public']['Tables']['activities']['Row'];

// Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      onChange(`${displayHour}:${minutes} ${ampm}`);
    } else {
      onChange('');
    }
  };

  const convertToInputValue = (displayValue: string): string => {
    if (!displayValue) return '';
    const match = displayValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hour = parseInt(match[1]);
      const minute = match[2];
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    return '';
  };

  return (
    <input
      type="time"
      value={convertToInputValue(value)}
      onChange={handleTimeChange}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
};

// Daily Log Form Component
interface DailyLogFormProps {
  child: Child;
  onSubmit: (data: Partial<DailyLog>, logId?: string) => void;
  onClose: () => void;
  editLog?: DailyLog | null;
}

const DailyLogForm: React.FC<DailyLogFormProps> = ({
  child,
  onSubmit,
  onClose,
  editLog,
}) => {
  const { client } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    child_id: child.id,
    meals: [] as Array<{
      type: string;
      food: string;
      quantity: string;
      unit: string;
      time: string;
    }>,
    drinks: [] as Array<{
      type: string;
      quantity: string;
      unit: string;
      time: string;
    }>,
    naps: {
      morning_start: null as string | null,
      morning_end: null as string | null,
      afternoon_start: null as string | null,
      afternoon_end: null as string | null,
    },
    activities: [] as Array<{
      name: string;
      imageUrl?: string;
    }>,
    notes: '',
    mood: 'neutral' as DailyLog['mood'],
    behavior: null as DailyLog['behavior'],
    sickness: '',
    medications: '',
    bathroom_visits: [] as Array<{
      time: string;
      type: 'pee' | 'poop';
      pee_color?: 'clear' | 'light_yellow' | 'dark_yellow' | 'other';
      poop_type?: 'soft' | 'formed' | 'hard' | 'loose' | 'watery';
      notes?: string;
    }>,
    diaper_changes: 0,
    photos: [] as string[],
  });

  const [newActivity, setNewActivity] = useState('')
  const fileInputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (editLog) {
      setFormData({
        child_id: editLog.child_id,
        meals: editLog.meals || [],
        drinks: editLog.drinks || [],
        naps: editLog.naps || {
          morning_start: null,
          morning_end: null,
          afternoon_start: null,
          afternoon_end: null,
        },
        activities: Array.isArray(editLog.activities)
          ? editLog.activities.map((a: any) =>
              typeof a === 'string' ? { name: a } : { name: a?.name || '', imageUrl: a?.imageUrl || undefined }
            )
          : [],
        notes: editLog.notes || '',
        mood: editLog.mood || 'neutral',
        behavior: editLog.behavior || null,
        sickness: editLog.sickness || '',
        medications: editLog.medications || '',
        bathroom_visits: editLog.bathroom_visits || [],
        diaper_changes: editLog.diaper_changes || 0,
        photos: editLog.photos || [],
      });
    }
  }, [editLog]);

  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [...prev.meals, {
        type: 'breakfast',
        food: '',
        quantity: '',
        unit: 'oz',
        time: new Date().toTimeString().slice(0, 5)
      }]
    }))
  };

  const updateMeal = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.map((meal, i) =>
        i === index ? { ...meal, [field]: value } : meal
      ),
    }));
  };

  const removeMeal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  const addDrink = () => {
    setFormData(prev => ({
      ...prev,
      drinks: [...prev.drinks, {
        type: 'water',
        quantity: '',
        unit: 'oz',
        time: new Date().toTimeString().slice(0, 5)
      }]
    }))
  };

  const updateDrink = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      drinks: prev.drinks.map((drink, i) =>
        i === index ? { ...drink, [field]: value } : drink
      ),
    }));
  };

  const removeDrink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      drinks: prev.drinks.filter((_, i) => i !== index),
    }));
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setFormData(prev => ({
        ...prev,
        activities: [...prev.activities, { name: newActivity.trim() }]
      }))
      setNewActivity('')
    }
  }

  const updateActivityName = (index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) =>
        i === index ? { ...activity, name } : activity
      )
    }))
  }

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const uploadActivityImage = async (activityIndex: number, file: File) => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `activity-photos/${fileName}`

      const { error: uploadError } = await client.storage
        .from('daily-logs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = client.storage
        .from('daily-logs')
        .getPublicUrl(filePath)

      setFormData(prev => ({
        ...prev,
        activities: prev.activities.map((activity, i) =>
          i === activityIndex ? { ...activity, imageUrl: publicUrl } : activity
        )
      }))

      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleActivityImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadActivityImage(index, file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      // Convert activities to the format expected by the database
      const submissionData = {
        ...formData,
        activities: formData.activities.map(a => 
          a.imageUrl ? { name: a.name, imageUrl: a.imageUrl } : a.name
        ) as any // Cast to any to handle the mixed array type
      };
      
      await onSubmit(submissionData, editLog?.id);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to save daily log')
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Daily Log - {child.first_name} {child.last_name}
            </h2>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="">
            {/* Mood & Behavior */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mood">Mood</Label>
                <select
                  id="mood"
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      mood: e.target.value as DailyLog['mood'],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="happy">Happy 😊</option>
                  <option value="sad">Sad 😢</option>
                  <option value="tired">Tired 😴</option>
                  <option value="energetic">Energetic ⚡</option>
                  <option value="neutral">Neutral 😐</option>
                  <option value="fussy">Fussy 😤</option>
                  <option value="excited">Excited 🤩</option>
                </select>
              </div>
              <div>
                <Label htmlFor="behavior">Behavior</Label>
                <select
                  id="behavior"
                  value={formData.behavior || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      behavior: e.target.value as DailyLog['behavior'],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select behavior</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs_attention">Needs Attention</option>
                </select>
              </div>
            </div>

            {/* Meals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Meals</Label>
                <Button type="button" onClick={addMeal} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Meal
                </Button>
              </div>
              <div className="space-y-3">
                {formData.meals.map((meal, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select
                          value={meal.type}
                          onChange={(e) =>
                            updateMeal(index, 'type', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="snack">Snack</option>
                          <option value="dinner">Dinner</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Food</Label>
                        <Input
                          value={meal.food}
                          onChange={(e) =>
                            updateMeal(index, 'food', e.target.value)
                          }
                          className="text-sm"
                          placeholder="Food item"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          value={meal.quantity}
                          onChange={(e) =>
                            updateMeal(index, 'quantity', e.target.value)
                          }
                          className="text-sm"
                          placeholder="Amount eaten"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMeal(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drinks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Drinks</Label>
                <Button type="button" onClick={addDrink} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Drink
                </Button>
              </div>
              <div className="space-y-3">
                {formData.drinks.map((drink, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select
                          value={drink.type}
                          onChange={(e) =>
                            updateDrink(index, 'type', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="water">Water</option>
                          <option value="milk">Milk</option>
                          <option value="juice">Juice</option>
                          <option value="formula">Formula</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          value={drink.quantity}
                          onChange={(e) =>
                            updateDrink(index, 'quantity', e.target.value)
                          }
                          className="text-sm"
                          placeholder="Amount (oz)"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Time</Label>
                        <TimePicker
                          value={drink.time}
                          onChange={(value) =>
                            updateDrink(index, 'time', value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDrink(index)}
                          className="w-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Naps */}
            <div>
              <Label>Naps</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border rounded-lg p-3 bg-blue-50">
                  <Label className="text-sm font-medium text-blue-900">
                    Morning Nap
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={formData.naps.morning_start || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            naps: { ...prev.naps, morning_start: e.target.value || null },
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={formData.naps.morning_end || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            naps: { ...prev.naps, morning_end: e.target.value || null },
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-green-50">
                  <Label className="text-sm font-medium text-green-900">
                    Afternoon Nap
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={formData.naps.afternoon_start || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            naps: { ...prev.naps, afternoon_start: e.target.value || null },
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={formData.naps.afternoon_end || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            naps: { ...prev.naps, afternoon_end: e.target.value || null },
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities with Image Upload */}
            <div>
              <Label>Activities</Label>
              <div className="flex gap-2 mt-2 mb-3">
                <Input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Add activity"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addActivity())
                  }
                />
                <Button type="button" onClick={addActivity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.activities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-2 border rounded p-2 bg-gray-50">
                    <Input
                      value={activity.name}
                      onChange={(e) => updateActivityName(index, e.target.value)}
                      className="w-32"
                      placeholder="Activity name"
                    />
                    {activity.imageUrl && (
                      <img 
                        src={activity.imageUrl} 
                        alt="activity" 
                        className="w-10 h-10 object-cover rounded" 
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={(el) => {
                        if (fileInputs.current) {
                          fileInputs.current[index] = el;
                        }
                      }}
                      onChange={(e) => handleActivityImageChange(index, e)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputs.current[index]?.click()}
                      disabled={uploading}
                      title="Upload image"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeActivity(index)}
                      title="Remove activity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Details */}
            <div className="space-y-6">
              {/* Bathroom Visits */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Bathroom Visits</Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const newVisit = {
                        time: new Date().toLocaleTimeString('en-US', { 
                          hour12: false, 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }),
                        type: 'pee' as const,
                        pee_color: 'light_yellow' as const,
                        notes: ''
                      }
                      setFormData(prev => ({
                        ...prev,
                        bathroom_visits: [...prev.bathroom_visits, newVisit]
                      }))
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Visit
                  </Button>
                </div>
                
                {formData.bathroom_visits.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No bathroom visits recorded yet</p>
                    <p className="text-sm text-gray-400">Click "Add Visit" to record bathroom activities</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.bathroom_visits.map((visit, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`visit_time_${index}`}>Time</Label>
                            <Input
                              id={`visit_time_${index}`}
                              type="time"
                              value={visit.time}
                              onChange={(e) => {
                                const updatedVisits = [...formData.bathroom_visits]
                                updatedVisits[index] = { ...updatedVisits[index], time: e.target.value }
                                setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`visit_type_${index}`}>Type</Label>
                            <select
                              id={`visit_type_${index}`}
                              value={visit.type}
                              onChange={(e) => {
                                const updatedVisits = [...formData.bathroom_visits]
                                updatedVisits[index] = { 
                                  ...updatedVisits[index], 
                                  type: e.target.value as 'pee' | 'poop',
                                  // Reset type-specific fields
                                  pee_color: e.target.value === 'pee' ? 'light_yellow' : undefined,
                                  poop_type: e.target.value === 'poop' ? 'formed' : undefined
                                }
                                setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pee">Pee</option>
                              <option value="poop">Poop</option>
                            </select>
                          </div>
                          
                          {visit.type === 'pee' && (
                            <div>
                              <Label htmlFor={`pee_color_${index}`}>Pee Color</Label>
                              <select
                                id={`pee_color_${index}`}
                                value={visit.pee_color || 'light_yellow'}
                                onChange={(e) => {
                                  const updatedVisits = [...formData.bathroom_visits]
                                  updatedVisits[index] = { 
                                    ...updatedVisits[index], 
                                    pee_color: e.target.value as 'clear' | 'light_yellow' | 'dark_yellow' | 'other'
                                  }
                                  setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="clear">Clear</option>
                                <option value="light_yellow">Light Yellow</option>
                                <option value="dark_yellow">Dark Yellow</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          )}
                          
                          {visit.type === 'poop' && (
                            <div>
                              <Label htmlFor={`poop_type_${index}`}>Poop Type</Label>
                              <select
                                id={`poop_type_${index}`}
                                value={visit.poop_type || 'formed'}
                                onChange={(e) => {
                                  const updatedVisits = [...formData.bathroom_visits]
                                  updatedVisits[index] = { 
                                    ...updatedVisits[index], 
                                    poop_type: e.target.value as 'soft' | 'formed' | 'hard' | 'loose' | 'watery'
                                  }
                                  setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="soft">Soft</option>
                                <option value="formed">Formed</option>
                                <option value="hard">Hard</option>
                                <option value="loose">Loose</option>
                                <option value="watery">Watery</option>
                              </select>
                            </div>
                          )}
                          
                          {visit.type === 'pee' ? (
                            <div></div>
                          ) : null}
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-3">
                            <Label htmlFor={`visit_notes_${index}`}>Notes (optional)</Label>
                            <Input
                              id={`visit_notes_${index}`}
                              value={visit.notes || ''}
                              onChange={(e) => {
                                const updatedVisits = [...formData.bathroom_visits]
                                updatedVisits[index] = { ...updatedVisits[index], notes: e.target.value }
                                setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                              }}
                              placeholder="Any additional notes..."
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const updatedVisits = formData.bathroom_visits.filter((_, i) => i !== index)
                                setFormData(prev => ({ ...prev, bathroom_visits: updatedVisits }))
                              }}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Diaper Changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diaper_changes">Diaper Changes</Label>
                  <Input
                    id="diaper_changes"
                    type="number"
                    min="0"
                    value={formData.diaper_changes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                      ...prev,
                      diaper_changes: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            </div>

            {/* Health Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sickness">Sickness/Symptoms</Label>
                <Input
                  id="sickness"
                  value={formData.sickness}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sickness: e.target.value,
                    }))
                  }
                  placeholder="Any symptoms observed"
                />
              </div>
              <div>
                <Label htmlFor="medications">Medications Given</Label>
                <Input
                  id="medications"
                  value={formData.medications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      medications: e.target.value,
                    }))
                  }
                  placeholder="Medication and time"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes for Parents</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Share any special moments or important information about the child's day"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editLog ? 'Update Log' : 'Save Log'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Teacher Dashboard Component
export default function TeacherDashboard() {
  const { user, client } = useSupabase();
  const { unreadCount } = useUnreadMessages();
  const [children, setChildren] = useState<Child[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [editLog, setEditLog] = useState<DailyLog | null>(null);

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch children assigned to this teacher
        const { data: childrenData, error: childrenError } = await client
          .from('children')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('status', 'active');

        if (childrenError) {
          console.error('Error fetching children:', childrenError);
        } else {
          setChildren(childrenData || []);
        }

        // Fetch today's daily logs
        const today = new Date().toISOString().split('T')[0];
        const { data: logsData, error: logsError } = await client
          .from('daily_logs')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('date', today);

        if (logsError) {
          console.error('Error fetching daily logs:', logsError);
        } else {
          setDailyLogs(logsData || []);
        }

        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await client
          .from('activities')
          .select('*')
          .limit(10);

        if (activitiesError) {
          console.error('Error fetching activities:', activitiesError);
        } else {
          setActivities(activitiesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, client]);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return <Smile className="h-4 w-4 text-green-600" />;
      case 'sad':
        return <Heart className="h-4 w-4 text-blue-600" />;
      case 'tired':
        return <Bed className="h-4 w-4 text-gray-600" />;
      case 'energetic':
        return <Activity className="h-4 w-4 text-orange-600" />;
      default:
        return <Smile className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy':
        return 'bg-green-100 text-green-800';
      case 'sad':
        return 'bg-blue-100 text-blue-800';
      case 'tired':
        return 'bg-gray-100 text-gray-800';
      case 'energetic':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateLog = (child: Child) => {
    setSelectedChild(child);
    setEditLog(null);
    setShowLogForm(true);
  };

  const handleEditLog = (child: Child) => {
    const existingLog = dailyLogs.find((log) => log.child_id === child.id);
    setSelectedChild(child);
    setEditLog(existingLog || null);
    setShowLogForm(true);
  };

  const handleSubmitLog = async (logData: Partial<DailyLog>, logId?: string) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (logId) {
        // Update existing log
        const { error } = await client
          .from('daily_logs')
          .update({
            ...logData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', logId);
          
        if (error) {
          console.error('Error updating log:', error);
          alert('Error updating log. Please try again.');
          return;
        }
        
        // Refresh daily logs
        const { data: logsData } = await client
          .from('daily_logs')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('date', today);
          
        setDailyLogs(logsData || []);
        alert('Log updated successfully!');
      } else {
        // Create new log
        const { error } = await client
          .from('daily_logs')
          .insert([{
            ...logData,
            date: today,
            teacher_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
          
        if (error) {
          console.error('Error creating log:', error);
          alert('Error creating log. Please try again.');
          return;
        }
        
        // Refresh daily logs
        const { data: logsData } = await client
          .from('daily_logs')
          .select('*')
          .eq('teacher_id', user.id)
          .eq('date', today);
          
        setDailyLogs(logsData || []);
        alert('Log created successfully!');
      }
    } catch (error) {
      console.error('Error submitting log:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="h-8 w-8 text-green-600 mr-3" />
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your classroom and track daily activities
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/teacher/children"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-200 focus:ring-blue-500 px-4 py-2 text-sm"
            >
              <Baby className="h-4 w-4 mr-2" />
              My Children
            </a>
            <a
              href="/dashboard/teacher/activities"
              className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border bg-blue-500 border-gray-300 text-white hover:bg-blue-600 focus:ring-blue-500 px-4 py-2 text-sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Plan Activities
            </a>
            <a
              href="/dashboard/messages"
              className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border px-4 py-2 text-sm relative ${
                unreadCount > 0 
                  ? 'bg-red-500 text-white hover:bg-red-600 border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-200 focus:ring-blue-500'
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                  {unreadCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Baby className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Children
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {children.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Logs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyLogs.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Planned Activities
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activities.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Children Overview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            My Children
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => {
              const todayLog = dailyLogs.find(
                (log) => log.child_id === child.id
              );
              return (
                <Card
                  key={child.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {child.first_name} {child.last_name}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {child.age_group}
                          </p>
                        </div>
                      </div>
                      {todayLog && (
                        <Badge className={getMoodColor(todayLog.mood)}>
                          {getMoodIcon(todayLog.mood)}
                          <span className="ml-1 capitalize">
                            {todayLog.mood}
                          </span>
                        </Badge>
                      )}
                    </div>

                    {/* Child Details */}
                    <div className="space-y-2 mb-4">
                      {child.allergies && child.allergies.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-700">
                            Allergies: {child.allergies.join(', ')}
                          </span>
                        </div>
                      )}
                      {child.medical_notes && (
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700">
                            {child.medical_notes}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Today's Summary */}
                    {todayLog && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">
                          Today's Summary
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <span>Meals: {todayLog.meals?.length || 0}</span>
                          <span>
                            Activities: {todayLog.activities?.length || 0}
                          </span>
                          <span>Bathroom: {Array.isArray(todayLog.bathroom_visits) ? todayLog.bathroom_visits.length : (todayLog.bathroom_visits || 0)}</span>
                          <span>
                            Updated:{' '}
                            {new Date(todayLog.updated_at).toLocaleTimeString(
                              'en-US',
                              { hour: 'numeric', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {todayLog ? (
                        <Button
                          onClick={() => handleEditLog(child)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Log
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleCreateLog(child)}
                          size="sm"
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Log
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Today's Activities */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Today's Planned Activities
          </h2>
          <Card>
            <div className="p-6">
              {activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {activity.name}
                        </h4>
                        <Badge variant="outline" className="capitalize">
                          {activity.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Activity
                        </span>
                        <span>{activity.age_groups.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Activities Planned
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Plan some engaging activities for your children today.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Plan Activities
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex-col space-y-3 hover:bg-blue-50"
                >
                  <Baby className="h-8 w-8 text-blue-600" />
                  <span className="font-medium">Manage Children</span>
                  <span className="text-xs text-gray-500">
                    View and edit child profiles
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-6 flex-col space-y-3 hover:bg-green-50"
                >
                  <Activity className="h-8 w-8 text-green-600" />
                  <span className="font-medium">Plan Activities</span>
                  <span className="text-xs text-gray-500">
                    Create engaging activities
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-6 flex-col space-y-3 hover:bg-purple-50"
                >
                  <FileText className="h-8 w-8 text-purple-600" />
                  <span className="font-medium">View Reports</span>
                  <span className="text-xs text-gray-500">
                    Access daily reports
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-6 flex-col space-y-3 hover:bg-orange-50"
                >
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                  <span className="font-medium">Messages</span>
                  <span className="text-xs text-gray-500">
                    Communicate with parents
                  </span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Megaphone className="h-5 w-5 mr-2 text-blue-600" />
            Announcements
          </h2>
          <Card>
            <div className="p-6">
              <AnnouncementList compact={true} maxItems={3} />
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <Card>
            <div className="p-6">
              {dailyLogs.length > 0 ? (
                <div className="space-y-4">
                  {dailyLogs.map((log) => {
                    const child = children.find((c) => c.id === log.child_id);
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {child?.first_name} {child?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Daily log updated •{' '}
                              {new Date(log.updated_at).toLocaleTimeString(
                                'en-US',
                                { hour: 'numeric', minute: '2-digit' }
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge className={getMoodColor(log.mood)}>
                          {getMoodIcon(log.mood)}
                          <span className="ml-1 capitalize">{log.mood}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No recent activity to display.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Daily Log Form Modal */}
        {showLogForm && selectedChild && (
          <DailyLogForm
            child={selectedChild}
            onSubmit={handleSubmitLog}
            onClose={() => {
              setShowLogForm(false);
              setSelectedChild(null);
              setEditLog(null);
            }}
            editLog={editLog}
          />
        )}
      </div>
    </div>
  );
}
