"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Baby,
  Calendar,
  Heart,
  MessageSquare,
  Activity,
  Utensils,
  Coffee,
  Bed,
  Smile,
  AlertTriangle,
  ArrowRight,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import AnnouncementList from '@/components/ui/announcement-list';
import { Database } from '@/types/database';

type Child = Database['public']['Tables']['children']['Row'] & {
  photo_url?: string;
};

interface Props {
  childrenData: Child[];
  dailyLogs: any[];
  messages: any[];
  unreadCount: number;
  profile: any;
}

export default function ParentDashboardClient({
  childrenData,
  dailyLogs,
  messages,
  unreadCount,
}: Props) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="h-8 w-8 text-purple-600 mr-3" />
              Parent Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening with your children today.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/parent/children">
                <Baby className="h-4 w-4 mr-2" />
                View Children
              </Link>
            </Button>
            <Button
              asChild
              className={unreadCount > 0 ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              <Link href="/dashboard/messages" className="relative">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childrenData.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Baby className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {child.first_name} {child.last_name}
                      </CardTitle>
                      <CardDescription className="text-sm capitalize">
                        {child.age_group}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {child.age_group}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
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
                      <span className="text-sm text-red-700">{child.medical_notes}</span>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full mt-4" size="sm">
                  <Link href={`/dashboard/parent/children`}>
                    View Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Today's Updates</span>
              </CardTitle>
              <CardDescription>Latest daily logs for your children</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyLogs.length > 0 ? (
                <div className="space-y-4">
                  {dailyLogs.map((log) => {
                    const child = childrenData.find((c) => c.id === log.child_id);
                    return (
                      <div key={log.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {child?.first_name} {child?.last_name}
                          </h4>
                          <Badge className={getMoodColor(log.mood)}>
                            {getMoodIcon(log.mood)}
                            <span className="ml-1 capitalize">{log.mood}</span>
                          </Badge>
                        </div>

                        {/* Meals */}
                        {log.meals?.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Utensils className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">{log.meals.map((meal: any) => `${meal.food}`).join(', ')}</span>
                          </div>
                        )}

                        {/* Drinks */}
                        {log.drinks?.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Coffee className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              {log.drinks.map((drink: any) => `${drink.quantity} ${drink.unit} ${drink.type}`).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Naps */}
                        {(log.naps?.morning || log.naps?.afternoon) && (
                          <div className="flex items-center space-x-2">
                            <Bed className="h-4 w-4 text-purple-500" />
                            <span className="text-sm">{[log.naps.morning, log.naps.afternoon].filter(Boolean).join(', ')}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {log.notes && <p className="text-sm text-gray-600 mt-2">{log.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No daily logs for today yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for updates from teachers.</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5" />
                <span>Announcements</span>
              </CardTitle>
              <CardDescription>Important updates from the daycare</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementList compact={true} maxItems={4} />
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/dashboard/messages">
                  View All Messages
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/dashboard/parent/children">
                  <Baby className="h-6 w-6" />
                  <span>My Children</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/dashboard/parent/activities">
                  <Activity className="h-6 w-6" />
                  <span>Activities</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/dashboard/parent/reports">
                  <Calendar className="h-6 w-6" />
                  <span>Reports</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/dashboard/messages">
                  <MessageSquare className="h-6 w-6" />
                  <span>Messages</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
