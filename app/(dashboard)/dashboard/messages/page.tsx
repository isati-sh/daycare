import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import MessagesClient from './components/MessagesClient';

export default async function MessagesPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send to login
  if (!session) {
    redirect('/login');
  }

  // Fetch user role to ensure proper authorization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    redirect('/access-denied');
  }

  const role = profile.site_role;

  // Only authenticated users can access messages
  if (!role || (role !== 'parent' && role !== 'teacher' && role !== 'admin')) {
    redirect('/access-denied?reason=not-authorized');
  }

  // Fetch messages with pagination (limit to 50 most recent)
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, site_role),
      recipient:profiles!messages_recipient_id_fkey(id, full_name, site_role)
    `)
    .or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
    .order('created_at', { ascending: false })
    .range(0, 49);

  if (messagesError) {
    console.error('Error fetching messages:', messagesError);
  }

  // Fetch available recipients based on role
  let availableRecipients: Array<{
    id: string;
    full_name: string;
    site_role: string;
  }> = [];

  if (role === 'parent') {
    // Parents can message teachers assigned to their children and admins
    // First, get parent's children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', session.user.id)
      .eq('status', 'active');

    if (!childrenError && children && children.length > 0) {
      const childIds = children.map((c) => c.id);
      
      // Get teachers assigned to these children
      const { data: assignments, error: assignmentsError } = await supabase
        .from('teacher_assignments')
        .select('teacher_id')
        .in('child_id', childIds)
        .eq('status', 'active');

      if (!assignmentsError && assignments) {
        const teacherIds = [...new Set(assignments.map((a) => a.teacher_id))];
        
        // Fetch teacher profiles
        if (teacherIds.length > 0) {
          const { data: teachers } = await supabase
            .from('profiles')
            .select('id, full_name, site_role')
            .in('id', teacherIds)
            .eq('active_status', true);
          
          if (teachers) {
            availableRecipients.push(...teachers);
          }
        }
      }
    }

    // Add admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, full_name, site_role')
      .eq('site_role', 'admin')
      .eq('active_status', true);

    if (admins) {
      availableRecipients.push(...admins);
    }
  } else if (role === 'teacher') {
    // Teachers can message parents of their assigned children, other teachers, and admins
    // Get teacher's assigned children
    const { data: assignments, error: assignmentsError } = await supabase
      .from('teacher_assignments')
      .select('child_id')
      .eq('teacher_id', session.user.id)
      .eq('status', 'active');

    if (!assignmentsError && assignments) {
      const childIds = assignments.map((a) => a.child_id);
      
      // Get parents of these children
      const { data: children } = await supabase
        .from('children')
        .select('parent_id')
        .in('id', childIds)
        .eq('status', 'active');

      if (children) {
        const parentIds = [...new Set(children.map((c) => c.parent_id))];
        
        if (parentIds.length > 0) {
          const { data: parents } = await supabase
            .from('profiles')
            .select('id, full_name, site_role')
            .in('id', parentIds)
            .eq('active_status', true);
          
          if (parents) {
            availableRecipients.push(...parents);
          }
        }
      }
    }

    // Add other teachers
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, full_name, site_role')
      .eq('site_role', 'teacher')
      .eq('active_status', true)
      .neq('id', session.user.id);

    if (teachers) {
      availableRecipients.push(...teachers);
    }

    // Add admins
    const { data: admins } = await supabase
      .from('profiles')
      .select('id, full_name, site_role')
      .eq('site_role', 'admin')
      .eq('active_status', true);

    if (admins) {
      availableRecipients.push(...admins);
    }
  } else if (role === 'admin') {
    // Admins can message anyone
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, full_name, site_role')
      .eq('active_status', true)
      .neq('id', session.user.id);

    if (allUsers) {
      availableRecipients = allUsers;
    }
  }

  // Remove duplicates
  const uniqueRecipients = availableRecipients.filter(
    (recipient, index, self) => index === self.findIndex((r) => r.id === recipient.id)
  );

  return (
    <MessagesClient
      initialMessages={messages || []}
      availableRecipients={uniqueRecipients}
      userRole={role}
      userId={session.user.id}
    />
  );
}
