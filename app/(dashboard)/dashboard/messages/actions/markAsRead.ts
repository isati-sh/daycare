'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

interface MarkAsReadResult {
  success: boolean;
  error?: string;
}

export async function markAsReadAction(messageId: string): Promise<MarkAsReadResult> {
  try {
    const supabase = createServerActionClient<Database>({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, error: 'Unauthenticated' };
    }

    // Verify message exists and user is the recipient
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('recipient_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return { success: false, error: 'Message not found' };
    }

    // Only recipient can mark as read
    if (message.recipient_id !== session.user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Update message
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('recipient_id', session.user.id);

    if (updateError) {
      console.error('Error updating message:', updateError);
      return { success: false, error: 'Failed to mark message as read' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error marking message as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

