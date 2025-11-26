'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { createClient } from '@/lib/supabase/client'

export function useUnreadMessages() {
  const { user } = useSupabase()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('messages')
          .select('id')
          .eq('recipient_id', user.id)
          .eq('read', false)

        if (error) {
          console.error('Error fetching unread messages:', error)
          return
        }

        setUnreadCount(data?.length || 0)
      } catch (error) {
        console.error('Error fetching unread messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Set up real-time subscription for messages
    const supabase = createClient()
    const subscription = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return { unreadCount, loading }
}
