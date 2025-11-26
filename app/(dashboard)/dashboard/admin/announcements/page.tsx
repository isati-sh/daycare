'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Clock,
  Save,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Database } from '@/types/database'

type Announcement = Database['public']['Tables']['announcements']['Row']
type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']

export default function AnnouncementsPage() {
  const { user } = useSupabase()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  
  const [formData, setFormData] = useState<AnnouncementInsert>({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all',
    age_group: null,
    urgency: 'medium',
    duration_days: 7,
    created_by: user?.id || ''
  })

  const fetchAnnouncements = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching announcements:', error)
        toast.error('Failed to fetch announcements')
        return
      }

      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchAnnouncements()
    }
  }, [user, fetchAnnouncements])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const supabase = createClient()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + formData.duration_days!)
      
      const submissionData = {
        ...formData,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
      }

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            ...submissionData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAnnouncement.id)

        if (error) {
          console.error('Error updating announcement:', error)
          toast.error('Failed to update announcement')
          return
        }

        toast.success('Announcement updated successfully!')
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([submissionData])

        if (error) {
          console.error('Error creating announcement:', error)
          toast.error('Failed to create announcement')
          return
        }

        toast.success('Announcement created successfully!')
      }

      resetForm()
      fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      toast.error('Failed to save announcement')
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      age_group: announcement.age_group,
      urgency: announcement.urgency,
      duration_days: announcement.duration_days,
      created_by: announcement.created_by
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting announcement:', error)
        toast.error('Failed to delete announcement')
        return
      }

      toast.success('Announcement deleted successfully!')
      fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }

  const toggleActive = async (announcement: Announcement) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('announcements')
        .update({ 
          is_active: !announcement.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', announcement.id)

      if (error) {
        console.error('Error toggling announcement status:', error)
        toast.error('Failed to update announcement status')
        return
      }

      toast.success(`Announcement ${!announcement.is_active ? 'activated' : 'deactivated'}!`)
      fetchAnnouncements()
    } catch (error) {
      console.error('Error toggling announcement status:', error)
      toast.error('Failed to update announcement status')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      target_audience: 'all',
      age_group: null,
      urgency: 'medium',
      duration_days: 7,
      created_by: user?.id || ''
    })
    setEditingAnnouncement(null)
    setShowForm(false)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading announcements...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-gray-600">Manage announcements and communications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h2>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <select
                    id="urgency"
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <select
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">All Users</option>
                    <option value="parents">Parents Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="specific_age_group">Specific Age Group</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {formData.target_audience === 'specific_age_group' && (
                <div>
                  <Label htmlFor="age_group">Age Group</Label>
                  <select
                    id="age_group"
                    value={formData.age_group || ''}
                    onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Age Group</option>
                    <option value="Infants">Infants (0-1 years)</option>
                    <option value="Toddlers">Toddlers (1-3 years)</option>
                    <option value="Preschool">Preschool (3-5 years)</option>
                    <option value="Kindergarten">Kindergarten (5-6 years)</option>
                    <option value="School Age">School Age (6+ years)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAnnouncement ? 'Update' : 'Create'} Announcement
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="grid gap-6">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No announcements yet.</p>
              <p className="text-gray-400 mt-2">Create your first announcement to get started.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className={`${!announcement.is_active ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(announcement.type)}
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <Badge className={getUrgencyColor(announcement.urgency)}>
                        {announcement.urgency.toUpperCase()}
                      </Badge>
                      {!announcement.is_active && (
                        <Badge variant="outline" className="bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Target: {announcement.target_audience.replace('_', ' ')}
                      {announcement.age_group && ` (${announcement.age_group})`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleActive(announcement)}
                      className={announcement.is_active ? 'text-orange-600' : 'text-green-600'}
                    >
                      {announcement.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(announcement.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>
                    Created: {new Date(announcement.created_at).toLocaleDateString()}
                  </span>
                  <span>
                    Expires: {announcement.expires_at ? new Date(announcement.expires_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
