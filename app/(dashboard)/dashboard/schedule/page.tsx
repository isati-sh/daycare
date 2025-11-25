'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Users, 
  Activity,
  Utensils,
  Bed,
  Star,
  BookOpen,
  Music,
  Palette,
  TreePine
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: 'infant' | 'toddler' | 'preschool'
  parent_id: string
}

interface DailySchedule {
  id: string
  date: string
  age_group: string
  meals: {
    breakfast_time: string
    lunch_time: string
    snack_time: string
  }
  naps: {
    morning_start: string
    morning_end: string
    afternoon_start: string
    afternoon_end: string
  import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';
  import { redirect } from 'next/navigation';
  import ScheduleClient from './ScheduleClient';

  export const revalidate = 30;

  export default async function SchedulePage({
    searchParams,
  }: {
    searchParams: { date?: string; child?: string };
  }) {
    const supabase = createServerComponentClient({ cookies });

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      redirect('/login');
    }

    // Enforce parent role
    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'parent') {
      redirect('/access-denied');
    }

    // Get parent's children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id, first_name, last_name, age_group')
      .eq('parent_id', session.user.id)
      .order('first_name');

    if (childrenError) {
      console.error('Error fetching children:', childrenError);
      throw new Error('Failed to load children');
    }

    // If no children, return empty state (client will handle)
    if (!children || children.length === 0) {
      return (
        <ScheduleClient
          children={[]}
          selectedDate=""
          dailySchedule={null}
          plannedActivities={[]}
          announcements={[]}
        />
      );
    }

    // Get selected date (default to today)
    const selectedDate = searchParams.date || new Date().toISOString().split('T')[0];

    // Get selected child (default to first child)
    const selectedChildId = searchParams.child || children[0].id;
    const selectedChild = children.find((c) => c.id === selectedChildId);

    if (!selectedChild) {
      redirect(`/dashboard/schedule?date=${selectedDate}&child=${children[0].id}`);
    }

    // Fetch daily schedule for the child's age group
    const { data: dailySchedule } = await supabase
      .from('daily_schedules')
      .select('*')
      .eq('date', selectedDate)
      .eq('age_group', selectedChild.age_group)
      .single();

    // Fetch planned activities for the child's age group
    const { data: plannedActivities } = await supabase
      .from('planned_activities')
      .select('*')
      .eq('date', selectedDate)
      .contains('age_groups', [selectedChild.age_group])
      .order('start_time');

    // Fetch recent announcements for parents
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .or('target_audience.cs.{"parent"},target_audience.cs.{"all"}')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    return (
      <ScheduleClient
        children={children}
        selectedDate={selectedDate}
        dailySchedule={dailySchedule || null}
        plannedActivities={plannedActivities || []}
        announcements={announcements || []}
      />
    );
  }