'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Megaphone, AlertTriangle, Calendar, Clock, Save, X } from 'lucide-react'
import { createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement } from './actions'
import { useRouter } from 'next/navigation'

interface AnnouncementItem {
  id: string
  title: string
  content: string
  type: 'general' | 'event' | 'reminder' | 'emergency'
  target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
  age_group: string | null
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  duration_days: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AnnouncementsClientProps {
  announcements: AnnouncementItem[]
  page: number
  totalPages: number
}

export default function AnnouncementsClient({ announcements, page, totalPages }: AnnouncementsClientProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const selected = announcements.find(a => a.id === selectedId) || null

  interface FormState {
    title: string
    content: string
    type: 'general' | 'event' | 'reminder' | 'emergency'
    target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
    age_group: string
    urgency: 'low' | 'medium' | 'high' | 'urgent'
    duration_days: number
  }

  const [formState, setFormState] = useState<FormState>({
    title: '',
    content: '',
    type: 'general',
    target_audience: 'all',
    age_group: '',
    urgency: 'medium',
    duration_days: 7,
  })

  const openCreate = () => {
    setSelectedId(null)
    setFormState({
      title: '', content: '', type: 'general', target_audience: 'all', age_group: '', urgency: 'medium', duration_days: 7
    })
    setShowForm(true)
  }

  const openEdit = (id: string) => {
    const a = announcements.find(x => x.id === id)
    if (!a) return
    setSelectedId(id)
    setFormState({
      title: a.title,
      content: a.content,
      type: a.type,
      target_audience: a.target_audience,
      age_group: a.age_group || '',
      urgency: a.urgency,
      duration_days: a.duration_days,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSelectedId(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: formState.title,
      content: formState.content,
      type: formState.type,
      target_audience: formState.target_audience,
      age_group: formState.age_group || null,
      urgency: formState.urgency,
      duration_days: formState.duration_days,
    }
    startTransition(async () => {
      if (selected) {
        const res = await updateAnnouncement(selected.id, payload)
        if (res.error) console.error(res.error)
      } else {
        const res = await createAnnouncement(payload)
        if (res.error) console.error(res.error)
      }
      closeForm()
      router.refresh()
    })
  }

  const remove = (id: string) => {
    if (!confirm('Delete this announcement?')) return
    startTransition(async () => {
      const res = await deleteAnnouncement(id)
      if (res.error) console.error(res.error)
      router.refresh()
    })
  }

  const toggleActive = (id: string) => {
    startTransition(async () => {
      const res = await toggleAnnouncement(id)
      if (res.error) console.error(res.error)
      router.refresh()
    })
  }

  const changePage = (newPage: number) => {
    router.push(`/dashboard/admin/announcements?page=${newPage}`)
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-gray-600">Server-secured announcement management</p>
        </div>
        <Button onClick={openCreate} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </div>

      {/* List */}
      <div className="space-y-6 mb-8">
        {announcements.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No announcements found.</p>
              <p className="text-gray-400 mt-2">Create one to get started.</p>
            </CardContent>
          </Card>
        )}
        {announcements.map(a => (
          <Card key={a.id} className={!a.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(a.type)}
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                    <Badge className={getUrgencyColor(a.urgency)}>{a.urgency.toUpperCase()}</Badge>
                    {!a.is_active && <Badge variant="outline" className="bg-gray-100">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">
                    Target: {a.target_audience.replace('_', ' ')}{a.age_group && ` (${a.age_group})`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(a.id)} disabled={isPending}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(a.id)} disabled={isPending}>
                    {a.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(a.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{a.content}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(a.created_at).toLocaleDateString()}</span>
                <span>Expires: {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : 'Never'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-10">
          <Button variant="outline" disabled={page <= 1 || isPending} onClick={() => changePage(page - 1)}>Prev</Button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <Button variant="outline" disabled={page >= totalPages || isPending} onClick={() => changePage(page + 1)}>Next</Button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selected ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <Button variant="outline" size="sm" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea id="content" rows={4} value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select id="type" className="w-full border rounded px-2 py-2" value={formState.type} onChange={e => setFormState({ ...formState, type: e.target.value as any })}>
                    <option value="general">General</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <select id="urgency" className="w-full border rounded px-2 py-2" value={formState.urgency} onChange={e => setFormState({ ...formState, urgency: e.target.value as any })}>
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
                  <select id="target_audience" className="w-full border rounded px-2 py-2" value={formState.target_audience} onChange={e => setFormState({ ...formState, target_audience: e.target.value as any })}>
                    <option value="all">All Users</option>
                    <option value="parents">Parents</option>
                    <option value="teachers">Teachers</option>
                    <option value="specific_age_group">Specific Age Group</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input id="duration_days" type="number" min={1} max={365} value={formState.duration_days} onChange={e => setFormState({ ...formState, duration_days: parseInt(e.target.value) || 1 })} />
                </div>
              </div>
              {formState.target_audience === 'specific_age_group' && (
                <div>
                  <Label htmlFor="age_group">Age Group</Label>
                  <Input id="age_group" value={formState.age_group} onChange={e => setFormState({ ...formState, age_group: e.target.value })} placeholder="e.g. infant, toddler" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={isPending}>
                  <Save className="h-4 w-4 mr-2" /> {selected ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={closeForm} disabled={isPending}>Cancel</Button>
              </div>
              {isPending && <p className="text-xs text-gray-500">Processing...</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
