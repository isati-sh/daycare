'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  FileText, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Clock,
  Heart,
  Utensils,
  Bed,
  Droplets,
  Smile,
  MessageCircle,
  Bell,
  TrendingUp,
  Camera
} from 'lucide-react';
import { formatDate, getAge } from '@/lib/utils';
import toast from 'react-hot-toast';

// --- Parent Dashboard Types ---
interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age_group: 'infant' | 'toddler' | 'preschool';
  parent_id: string;
  allergies: string[] | null;
  medical_notes: string | null;
  photo_url?: string;
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

interface Message {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'update';
  created_at: string;
  read: boolean;
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
    medical_notes: 'Asthma - uses inhaler as needed',
    photo_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    first_name: 'Liam',
    last_name: 'Johnson',
    date_of_birth: '2020-08-22',
    age_group: 'preschool',
    parent_id: 'parent1',
    allergies: null,
    medical_notes: null,
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
];

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
      },
      {
        type: 'lunch',
        food: 'Chicken and vegetables',
        quantity: '1',
        unit: 'plate',
        time: '12:00'
      }
    ],
    drinks: [
      { type: 'water', quantity: '3', unit: 'cups', time: '09:00' },
      { type: 'milk', quantity: '1', unit: 'cup', time: '10:30' }
    ],
    naps: { morning: '9:30 AM - 11:00 AM', afternoon: '1:30 PM - 3:00 PM' },
    activities: [
      { name: 'Circle time', imageUrls: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop'] },
      { name: 'Art project', imageUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'] }
    ],
    notes: 'Emma had a wonderful day! She was very social and participated well in all activities. She especially enjoyed the art project and showed great creativity.',
    mood: 'happy',
    sickness: null,
    medications: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    notes: 'Liam showed great interest in the science experiment today. He asked many questions and was very engaged.',
    mood: 'energetic',
    sickness: 'Mild cough',
    medications: [
      { name: 'Cough syrup', dose: '5ml', time: '12:00' }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const dummyMessages: Message[] = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    content: 'Reminder: Parent-teacher conferences are scheduled for next week. Please check your email for your assigned time slot.',
    type: 'reminder',
    created_at: new Date().toISOString(),
    read: false
  },
  {
    id: '2',
    title: 'New Activity Program',
    content: 'We\'re excited to announce our new music and movement program starting next month!',
    type: 'announcement',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    read: true
  }
];

export default function ParentDashboard() {
  const { user } = useSupabase();
  const [children, setChildren] = useState<Child[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setChildren(dummyChildren);
    setDailyLogs(dummyDailyLogs);
    setMessages(dummyMessages);
    setSelectedChild(dummyChildren[0]); // Select first child by default
    setLoading(false);
  }, []);

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

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'happy':
        return 'bg-green-100 text-green-800';
      case 'sad':
        return 'bg-blue-100 text-blue-800';
      case 'tired':
        return 'bg-gray-100 text-gray-800';
      case 'energetic':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayLog = selectedChild ? dailyLogs.find(
    (log) =>
      log.child_id === selectedChild.id &&
      log.date === new Date().toISOString().split('T')[0]
  ) : null;

  const unreadMessages = messages.filter(msg => !msg.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your children today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Messages
                {unreadMessages > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Children Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Children Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Your Children
              </h2>
              {children.map((child) => {
                const childLog = dailyLogs.find(
                  (log) =>
                    log.child_id === child.id &&
                    log.date === new Date().toISOString().split('T')[0]
                );
                
                return (
                  <Card 
                    key={child.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedChild?.id === child.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={child.photo_url || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=60&h=60&fit=crop&crop=face'}
                            alt={`${child.first_name} ${child.last_name}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          {childLog && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {child.first_name} {child.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getAge(child.date_of_birth)} years • {child.age_group}
                          </p>
                          {childLog && (
                            <div className="flex items-center mt-1">
                              {getMoodIcon(childLog.mood)}
                              <span className="text-xs text-gray-600 ml-1 capitalize">
                                {childLog.mood}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {child.age_group}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-xs text-gray-600">Days Attended</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-xs text-gray-600">Activities</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-xs text-gray-600">Meals Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">10</div>
                    <div className="text-xs text-gray-600">Naps Taken</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Recent Messages
                  </div>
                  {unreadMessages > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadMessages} new
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg border ${
                      !message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {message.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {message.content}
                          </p>
                        </div>
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
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
                    <div className="flex items-center space-x-4">
                      <img
                        src={selectedChild.photo_url || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=80&h=80&fit=crop&crop=face'}
                        alt={`${selectedChild.first_name} ${selectedChild.last_name}`}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div className="flex-1">
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
                      <div className="text-right">
                        <Badge variant="outline" className="capitalize mb-2">
                          {selectedChild.age_group}
                        </Badge>
                        {todayLog && (
                          <div className="flex items-center justify-end">
                            {getMoodIcon(todayLog.mood)}
                            <span className="text-sm text-gray-600 ml-1 capitalize">
                              {todayLog.mood}
                            </span>
                          </div>
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
                          <Badge className={getMoodColor(todayLog.mood)}>
                            {getMoodIcon(todayLog.mood)}
                            <span className="ml-1 capitalize">{todayLog.mood}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Updated {formatDate(todayLog.updated_at)}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                      {/* Drinks */}
                      {todayLog.drinks && todayLog.drinks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Droplets className="h-4 w-4 mr-2" />
                            Drinks
                          </h4>
                          <div className="grid gap-3">
                            {todayLog.drinks.map((drink, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Badge variant="outline" className="capitalize">
                                    {drink.type}
                                  </Badge>
                                  <span className="font-medium">
                                    {drink.quantity} {drink.unit}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {drink.time}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Naps */}
                      {(todayLog.naps.morning || todayLog.naps.afternoon) && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Bed className="h-4 w-4 mr-2" />
                            Naps
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {todayLog.naps.morning && (
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="font-medium text-sm">Morning</div>
                                <div className="text-sm text-gray-600">{todayLog.naps.morning}</div>
                              </div>
                            )}
                            {todayLog.naps.afternoon && (
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="font-medium text-sm">Afternoon</div>
                                <div className="text-sm text-gray-600">{todayLog.naps.afternoon}</div>
                              </div>
                            )}
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
                            Teacher's Notes
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
                      <p className="text-gray-600">
                        {selectedChild.first_name}'s daily report hasn't been completed yet.
                        Check back later!
                      </p>
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
                    Choose a child from the list to view their daily report
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
