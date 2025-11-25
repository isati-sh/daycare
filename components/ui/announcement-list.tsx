'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Megaphone, 
  AlertTriangle, 
  Calendar, 
  Clock,
  X
} from 'lucide-react'
import { useAnnouncements } from '@/lib/hooks/useAnnouncements'
import { Database } from '@/types/database'

type Announcement = Database['public']['Tables']['announcements']['Row']

interface AnnouncementCardProps {
  announcement: Announcement
  compact?: boolean
  onDismiss?: (id: string) => void
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  compact = false,
  onDismiss 
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCardColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'border-l-4 border-l-red-500 bg-red-50'
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-50'
      case 'medium': return 'border-l-4 border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-4 border-l-green-500 bg-green-50'
      default: return 'border-l-4 border-l-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'event': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'reminder': return <Clock className="h-4 w-4 text-orange-500" />
      default: return <Megaphone className="h-4 w-4 text-gray-500" />
    }
  }

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${getCardColor(announcement.urgency)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon(announcement.type)}
            <span className="font-medium text-sm">{announcement.title}</span>
            <Badge className={`${getUrgencyColor(announcement.urgency)} text-xs`}>
              {announcement.urgency}
            </Badge>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(announcement.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-600 line-clamp-2">{announcement.content}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(announcement.created_at).toLocaleDateString()}
        </p>
      </div>
    )
  }

  return (
    <Card className={getCardColor(announcement.urgency)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(announcement.type)}
            <CardTitle className="text-lg">{announcement.title}</CardTitle>
            <Badge className={getUrgencyColor(announcement.urgency)}>
              {announcement.urgency.toUpperCase()}
            </Badge>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(announcement.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{announcement.content}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            Posted: {new Date(announcement.created_at).toLocaleDateString()}
          </span>
          {announcement.expires_at && (
            <span>
              Expires: {new Date(announcement.expires_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AnnouncementListProps {
  compact?: boolean
  maxItems?: number
  showTitle?: boolean
}

export const AnnouncementList: React.FC<AnnouncementListProps> = ({ 
  compact = false, 
  maxItems = 5,
  showTitle = true 
}) => {
  const { announcements, loading } = useAnnouncements()
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([])

  const visibleAnnouncements = announcements
    .filter(announcement => !dismissedIds.includes(announcement.id))
    .slice(0, maxItems)

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id])
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {showTitle && <h3 className="font-semibold text-gray-900">Announcements</h3>}
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (visibleAnnouncements.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Latest Announcements</h3>
        </div>
      )}
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {visibleAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            compact={compact}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  )
}

export default AnnouncementList
