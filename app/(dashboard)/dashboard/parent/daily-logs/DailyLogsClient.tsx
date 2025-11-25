"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Baby,
  Calendar,
  Utensils,
  Coffee,
  Bed,
  Activity,
  Heart,
  Camera,
  User,
  Download,
} from 'lucide-react';
import Image from 'next/image';
import type { Database } from '@/types/database';

type Child = Database['public']['Tables']['children']['Row'];

interface Props {
  childrenData: Child[];
  logs: any[];
}

export default function DailyLogsClient({ childrenData, logs }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [showPhoto, setShowPhoto] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log: any) => {
      const dateMatch = !selectedDate || log.date === selectedDate;
      const childMatch = selectedChild === 'all' || log.child_id === selectedChild;
      return dateMatch && childMatch;
    });
  }, [logs, selectedDate, selectedChild]);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'tired':
        return '😴';
      case 'energetic':
        return '⚡';
      case 'fussy':
        return '😤';
      case 'excited':
        return '🤩';
      default:
        return '😐';
    }
  };

  const downloadReport = async (log: any) => {
    // Placeholder for PDF generation
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-600">View your child's daily activities and updates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
          <select value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md w-48">
            <option value="all">All Children</option>
            {childrenData.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => setSelectedDate('')}>
          Show All Dates
        </Button>
      </div>

      {/* Daily Logs */}
      <div className="space-y-6">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log: any) => (
            <Card key={log.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Baby className="h-6 w-6 text-blue-500" />
                    <div>
                      <CardTitle className="text-xl">
                        {/* Use child names from children list if needed */}
                        {(childrenData.find((c) => c.id === log.child_id)?.first_name || 'Child') + ' ' +
                          (childrenData.find((c) => c.id === log.child_id)?.last_name || '')}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        {/* Teacher name optional if included later */}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="flex items-center space-x-2 text-lg">
                      <span>{getMoodIcon(log.mood)}</span>
                      <span className="capitalize">{log.mood}</span>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => downloadReport(log)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Utensils className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Meals</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{log.meals?.length || 0}</p>
                    <p className="text-sm text-orange-600">meals today</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Coffee className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Drinks</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{log.drinks?.length || 0}</p>
                    <p className="text-sm text-blue-600">drinks today</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bed className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Naps</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {[log.naps?.morning, log.naps?.afternoon].filter(Boolean).length}
                    </p>
                    <p className="text-sm text-purple-600">nap sessions</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Activities</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{log.activities?.length || 0}</p>
                    <p className="text-sm text-green-600">activities</p>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Meals */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Utensils className="h-5 w-5 mr-2 text-orange-500" />
                      Meals & Snacks
                    </h3>
                    <div className="space-y-3">
                      {log.meals && log.meals.length > 0 ? (
                        log.meals.map((meal: any, index: number) => (
                          <div key={index} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium capitalize">{meal.type}</span>
                              <span className="text-sm text-gray-500">{meal.time}</span>
                            </div>
                            <p className="text-gray-700">{meal.food}</p>
                            <p className="text-sm text-gray-500">{meal.quantity} {meal.unit}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No meals recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Drinks */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Coffee className="h-5 w-5 mr-2 text-blue-500" />
                      Drinks
                    </h3>
                    <div className="space-y-3">
                      {log.drinks && log.drinks.length > 0 ? (
                        log.drinks.map((drink: any, index: number) => (
                          <div key={index} className="border rounded p-3 bg-gray-50">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium capitalize">{drink.type}</span>
                              <span className="text-sm text-gray-500">{drink.time}</span>
                            </div>
                            <p className="text-sm text-gray-500">{drink.quantity} {drink.unit}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No drinks recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Naps */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-purple-500" />
                      Nap Times
                    </h3>
                    <div className="space-y-3">
                      {log.naps?.morning && (
                        <div className="border rounded p-3 bg-gray-50">
                          <span className="font-medium">Morning Nap</span>
                          <p className="text-sm text-gray-700">{log.naps.morning}</p>
                        </div>
                      )}
                      {log.naps?.afternoon && (
                        <div className="border rounded p-3 bg-gray-50">
                          <span className="font-medium">Afternoon Nap</span>
                          <p className="text-sm text-gray-700">{log.naps.afternoon}</p>
                        </div>
                      )}
                      {!log.naps?.morning && !log.naps?.afternoon && (
                        <p className="text-gray-500">No naps recorded</p>
                      )}
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-500" />
                      Activities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {log.activities && log.activities.length > 0 ? (
                        log.activities.map((activity: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {typeof activity === 'string' ? activity : activity.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No activities recorded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Care Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Array.isArray(log.bathroom_visits) ? log.bathroom_visits.length : log.bathroom_visits || 0}
                    </p>
                    <p className="text-sm text-gray-600">Bathroom Visits</p>
                  </div>
                  {log.diaper_changes && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{log.diaper_changes}</p>
                      <p className="text-sm text-gray-600">Diaper Changes</p>
                    </div>
                  )}
                  {log.behavior && (
                    <div className="text-center">
                      <Badge className="text-lg px-3 py-1 capitalize">{log.behavior}</Badge>
                      <p className="text-sm text-gray-600">Behavior</p>
                    </div>
                  )}
                </div>

                {/* Photos */}
                {log.photos && (log.photos as string[]).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-pink-500" />
                      Photos ({(log.photos as string[]).length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(log.photos as string[]).map((photo: string, index: number) => (
                        <button key={index} onClick={() => setShowPhoto(photo)} className="relative w-full h-32">
                          <Image
                            src={photo}
                            alt="Daily activity"
                            fill
                            className="object-cover rounded-lg hover:opacity-90 transition-opacity"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teacher Notes */}
                {log.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center text-yellow-800">
                      <User className="h-5 w-5 mr-2" />
                      Teacher's Notes
                    </h3>
                    <p className="text-gray-700">{log.notes}</p>
                  </div>
                )}

                {/* Health Information */}
                {(log.sickness || log.medications) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 flex items-center text-red-800">
                      <Heart className="h-5 w-5 mr-2" />
                      Health Information
                    </h3>
                    {log.sickness && (
                      <div className="mb-2">
                        <span className="font-medium">Symptoms: </span>
                        <span className="text-gray-700">{log.sickness}</span>
                      </div>
                    )}
                    {log.medications && (
                      <div>
                        <span className="font-medium">Medications: </span>
                        <span className="text-gray-700">{Array.isArray(log.medications) ? log.medications.map((m: any) => `${m.name} ${m.dose}`).join(', ') : log.medications}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Daily Logs</h3>
              <p className="text-gray-500">No daily logs found for the selected filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Photo Modal */}
      {showPhoto && (
        <button
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPhoto(null)}
        >
          <div className="relative w-full max-w-3xl h-[70vh]">
            <Image src={showPhoto} alt="Daily activity" fill className="object-contain rounded-md" />
          </div>
        </button>
      )}
    </div>
  );
}
