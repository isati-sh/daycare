'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Database } from '@/types/database'

type Announcement = Database['public']['Tables']['announcements']['Row']

export function useAnnouncements() {
  const { user, client, role } = useSupabase()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !client || !role) {
      setLoading(false)
      return
    }

    const fetchAnnouncements = async () => {
      try {
        const now = new Date().toISOString()
        
        // Build query based on user role and active announcements
        let query = client
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gte.${now}`)
          .order('urgency', { ascending: false }) // urgent first
          .order('created_at', { ascending: false })

        // Filter by target audience based on user role
        if (role === 'parent') {
          query = query.or('target_audience.eq.all,target_audience.eq.parents')
        } else if (role === 'teacher') {
          query = query.or('target_audience.eq.all,target_audience.eq.teachers')
        } else if (role === 'admin') {
          // Admins see all announcements
        }

        const { data, error } = await query.limit(5) // Show only top 5 recent announcements

        if (error) {
          console.error('Error fetching announcements:', error)
          return
        }

        setAnnouncements(data || [])
      } catch (error) {
        console.error('Error fetching announcements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()

    // Set up real-time subscription for announcements
    const subscription = client
      .channel('dashboard_announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchAnnouncements()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, client, role])

  return { announcements, loading }
}
