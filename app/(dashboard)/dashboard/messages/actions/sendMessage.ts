'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

interface SendMessageData {
  recipient_id: string;
  subject: string;
  content: string;
}

interface SendMessageResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Sanitize string input - remove HTML, trim, limit length
 */
function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.length === 0) return '';
  if (trimmed.length > maxLength) {
    throw new Error(`Field exceeds maximum length of ${maxLength} characters`);
  }
  // Remove HTML tags and dangerous characters
  const sanitized = trimmed
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
  return sanitized;
}

export async function sendMessageAction(
  data: SendMessageData
): Promise<SendMessageResult> {
  try {
    const supabase = createServerActionClient<Database>({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, error: 'Unauthenticated' };
    }

    const senderId = session.user.id;

    // Validate required fields
    if (!data.recipient_id?.trim()) {
      return { success: false, error: 'Recipient is required' };
    }
    if (!data.subject?.trim()) {
      return { success: false, error: 'Subject is required' };
    }
    if (!data.content?.trim()) {
      return { success: false, error: 'Message content is required' };
    }

    // Sanitize inputs
    const sanitizedSubject = sanitizeString(data.subject, 200);
    const sanitizedContent = sanitizeString(data.content, 5000);

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, site_role, active_status')
      .eq('id', data.recipient_id)
      .single();

    if (recipientError || !recipient) {
      return { success: false, error: 'Recipient not found' };
    }

    if (!recipient.active_status) {
      return { success: false, error: 'Recipient is not active' };
    }

    // Fetch sender role
    const { data: sender, error: senderError } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return { success: false, error: 'Failed to verify sender' };
    }

    const senderRole = sender.site_role;
    const recipientRole = recipient.site_role;

    // Authorization: Validate messaging permissions
    // Parents can message:
    // - Teachers assigned to their children
    // - Admins
    // Teachers can message:
    // - Parents of their assigned children
    // - Other teachers
    // - Admins
    // Admins can message anyone

    if (senderRole === 'parent') {
      // Parents can only message teachers of their children or admins
      if (recipientRole === 'admin') {
        // Allow messaging admins
      } else if (recipientRole === 'teacher') {
        // Check if teacher is assigned to any of parent's children
        const { data: children, error: childrenError } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', senderId)
          .eq('status', 'active');

        if (childrenError || !children || children.length === 0) {
          return { success: false, error: 'No children enrolled' };
        }

        const childIds = children.map((c) => c.id);
        const { data: assignments, error: assignmentError } = await supabase
          .from('teacher_assignments')
          .select('child_id')
          .eq('teacher_id', data.recipient_id)
          .eq('status', 'active')
          .in('child_id', childIds)
          .limit(1);

        if (assignmentError || !assignments || assignments.length === 0) {
          return {
            success: false,
            error: 'You can only message teachers assigned to your children',
          };
        }
      } else {
        return { success: false, error: 'Invalid recipient' };
      }
    } else if (senderRole === 'teacher') {
      // Teachers can message parents of their assigned children, other teachers, or admins
      if (recipientRole === 'admin' || recipientRole === 'teacher') {
        // Allow messaging admins and other teachers
      } else if (recipientRole === 'parent') {
        // Check if teacher is assigned to any of recipient's children
        const { data: children, error: childrenError } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', data.recipient_id)
          .eq('status', 'active');

        if (childrenError || !children || children.length === 0) {
          return { success: false, error: 'Recipient has no enrolled children' };
        }

        const childIds = children.map((c) => c.id);
        const { data: assignments, error: assignmentError } = await supabase
          .from('teacher_assignments')
          .select('child_id')
          .eq('teacher_id', senderId)
          .eq('status', 'active')
          .in('child_id', childIds)
          .limit(1);

        if (assignmentError || !assignments || assignments.length === 0) {
          return {
            success: false,
            error: 'You can only message parents of your assigned children',
          };
        }
      } else {
        return { success: false, error: 'Invalid recipient' };
      }
    } else if (senderRole === 'admin') {
      // Admins can message anyone
    } else {
      return { success: false, error: 'Unauthorized role' };
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: data.recipient_id,
        subject: sanitizedSubject,
        content: sanitizedContent,
        read: false,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error inserting message:', messageError);
      return { success: false, error: 'Failed to send message' };
    }

    return {
      success: true,
      messageId: message.id,
    };
  } catch (error) {
    console.error('Unexpected error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

