'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

interface SendMessageData {
  recipient_id: string
  subject: string
  content: string
}

interface SendMessageResult {
  success?: boolean
  error?: string
  messageId?: string
}

interface MarkAsReadResult {
  success?: boolean
  error?: string
}

function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (trimmed.length === 0) return ''
  if (trimmed.length > maxLength) {
    throw new Error(`Field exceeds maximum length of ${maxLength} characters`)
  }
  const sanitized = trimmed
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
  return sanitized
}

export async function sendMessageAction(data: SendMessageData): Promise<SendMessageResult> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: 'Unauthenticated' }
    }

    const senderId = session.user.id

    if (!data.recipient_id?.trim()) {
      return { error: 'Recipient is required' }
    }
    if (!data.subject?.trim()) {
      return { error: 'Subject is required' }
    }
    if (!data.content?.trim()) {
      return { error: 'Message content is required' }
    }

    const sanitizedSubject = sanitizeString(data.subject, 200)
    const sanitizedContent = sanitizeString(data.content, 5000)

    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id, site_role, active_status')
      .eq('id', data.recipient_id)
      .single()

    if (recipientError || !recipient) {
      return { error: 'Recipient not found' }
    }

    if (!recipient.active_status) {
      return { error: 'Recipient is not active' }
    }

    const { data: sender, error: senderError } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', senderId)
      .single()

    if (senderError || !sender) {
      return { error: 'Failed to verify sender' }
    }

    const senderRole = sender.site_role
    const recipientRole = recipient.site_role

    // Authorization checks
    if (senderRole === 'parent') {
      if (recipientRole === 'admin') {
        // Allow
      } else if (recipientRole === 'teacher') {
        const { data: children } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', senderId)
          .eq('status', 'active')

        if (!children || children.length === 0) {
          return { error: 'No children enrolled' }
        }

        const childIds = children.map((c) => c.id)
        const { data: assignments } = await supabase
          .from('teacher_assignments')
          .select('child_id')
          .eq('teacher_id', data.recipient_id)
          .eq('status', 'active')
          .in('child_id', childIds)
          .limit(1)

        if (!assignments || assignments.length === 0) {
          return { error: 'You can only message teachers assigned to your children' }
        }
      } else {
        return { error: 'Invalid recipient' }
      }
    } else if (senderRole === 'teacher') {
      if (recipientRole === 'admin' || recipientRole === 'teacher') {
        // Allow
      } else if (recipientRole === 'parent') {
        const { data: children } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', data.recipient_id)
          .eq('status', 'active')

        if (!children || children.length === 0) {
          return { error: 'Recipient has no enrolled children' }
        }

        const childIds = children.map((c) => c.id)
        const { data: assignments } = await supabase
          .from('teacher_assignments')
          .select('child_id')
          .eq('teacher_id', senderId)
          .eq('status', 'active')
          .in('child_id', childIds)
          .limit(1)

        if (!assignments || assignments.length === 0) {
          return { error: 'You can only message parents of your assigned children' }
        }
      } else {
        return { error: 'Invalid recipient' }
      }
    } else if (senderRole === 'admin') {
      // Admins can message anyone
    } else {
      return { error: 'Unauthorized role' }
    }

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
      .single()

    if (messageError) {
      console.error('Error inserting message:', messageError)
      return { error: 'Failed to send message' }
    }

    revalidatePath('/dashboard/messages')
    return { success: true, messageId: message.id }
  } catch (error) {
    console.error('Unexpected error sending message:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function markAsReadAction(messageId: string): Promise<MarkAsReadResult> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: 'Unauthenticated' }
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('recipient_id')
      .eq('id', messageId)
      .single()

    if (messageError || !message) {
      return { error: 'Message not found' }
    }

    if (message.recipient_id !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const { error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('recipient_id', session.user.id)

    if (updateError) {
      console.error('Error updating message:', updateError)
      return { error: 'Failed to mark message as read' }
    }

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error marking message as read:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function deleteMessageAction(messageId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { error: 'Unauthenticated' }
    }

    // Only admin or message sender can delete
    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return { error: 'Profile not found' }
    }

    const { data: message } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', messageId)
      .single()

    if (!message) {
      return { error: 'Message not found' }
    }

    if (profile.site_role !== 'admin' && message.sender_id !== session.user.id) {
      return { error: 'Unauthorized' }
    }

    const { error: delError } = await supabase.from('messages').delete().eq('id', messageId)

    if (delError) {
      return { error: 'Failed to delete message' }
    }

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting message:', error)
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}
