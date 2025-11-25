'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'

export function useUnreadMessages() {
  const { user, client } = useSupabase()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !client) {
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await client
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
    const subscription = client
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
  }, [user, client])

  return { unreadCount, loading }
}
