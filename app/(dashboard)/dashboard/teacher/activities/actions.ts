'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function createActivity(formData: {
  name: string;
  description: string;
  category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science';
  start_time: string;
  end_time: string;
  age_groups: string[];
  max_participants: number | null;
  materials_needed: string[];
  learning_objectives: string[];
  teacher_notes: string | null;
  date: string;
  weather_dependent: boolean;
}) {
  try {
    const supabase = createServerActionClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'teacher') {
      return { error: 'Access denied: Only teachers can create activities' };
    }

    const { error } = await supabase.from('planned_activities').insert({
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      start_time: formData.start_time,
      end_time: formData.end_time,
      age_groups: formData.age_groups,
      max_participants: formData.max_participants,
      materials_needed: formData.materials_needed,
      learning_objectives: formData.learning_objectives,
      teacher_notes: formData.teacher_notes?.trim() || null,
      date: formData.date,
      weather_dependent: formData.weather_dependent,
      created_by: session.user.id,
      status: 'planned',
    });

    if (error) {
      console.error('Activity creation error:', error);
      return { error: 'Failed to create activity' };
    }

    revalidatePath('/dashboard/teacher/activities');
    return { success: true };
  } catch (error) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateActivity(
  activityId: string,
  formData: {
    name: string;
    description: string;
    category: 'art' | 'music' | 'outdoor' | 'learning' | 'sensory' | 'physical' | 'dramatic_play' | 'science';
    start_time: string;
    end_time: string;
    age_groups: string[];
    max_participants: number | null;
    materials_needed: string[];
    learning_objectives: string[];
    teacher_notes: string | null;
    weather_dependent: boolean;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  }
) {
  try {
    const supabase = createServerActionClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'teacher') {
      return { error: 'Access denied' };
    }

    // Verify ownership
    const { data: activity } = await supabase
      .from('planned_activities')
      .select('created_by')
      .eq('id', activityId)
      .single();

    if (activity?.created_by !== session.user.id) {
      return { error: 'Access denied: You can only edit your own activities' };
    }

    const { error } = await supabase
      .from('planned_activities')
      .update({
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        start_time: formData.start_time,
        end_time: formData.end_time,
        age_groups: formData.age_groups,
        max_participants: formData.max_participants,
        materials_needed: formData.materials_needed,
        learning_objectives: formData.learning_objectives,
        teacher_notes: formData.teacher_notes?.trim() || null,
        weather_dependent: formData.weather_dependent,
        status: formData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId);

    if (error) {
      console.error('Activity update error:', error);
      return { error: 'Failed to update activity' };
    }

    revalidatePath('/dashboard/teacher/activities');
    return { success: true };
  } catch (error) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'teacher') {
      return { error: 'Access denied' };
    }

    // Verify ownership
    const { data: activity } = await supabase
      .from('planned_activities')
      .select('created_by')
      .eq('id', activityId)
      .single();

    if (activity?.created_by !== session.user.id) {
      return { error: 'Access denied: You can only delete your own activities' };
    }

    const { error } = await supabase
      .from('planned_activities')
      .delete()
      .eq('id', activityId);

    if (error) {
      console.error('Activity deletion error:', error);
      return { error: 'Failed to delete activity' };
    }

    revalidatePath('/dashboard/teacher/activities');
    return { success: true };
  } catch (error) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
