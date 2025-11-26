'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

interface Summary {
  conversation_id: string
  last_message_preview: string
  last_message_at: string
  unread_count: number
  participant_a: { id: string; full_name: string | null; site_role: string | null }
  participant_b: { id: string; full_name: string | null; site_role: string | null }
}

interface Recipient {
  id: string
  full_name: string
  site_role: string
}

export default function MessagesClient({
  summaries,
  total,
  page,
  pageSize,
  initialQuery,
  userRole,
  userId,
  availableRecipients,
}: {
  summaries: Summary[]
  total: number
  page: number
  pageSize: number
  initialQuery: string
  userRole: string
  userId: string
  availableRecipients: Recipient[]
}) {
  const [q, setQ] = useState(initialQuery)
  const [showCompose, setShowCompose] = useState(false)
  const totalPages = Math.ceil(total / pageSize)

  const linkFor = (pg: number) => `?page=${pg}${q ? `&q=${encodeURIComponent(q)}` : ''}`

  const getOtherParticipant = (s: Summary) => {
    if (s.participant_a.id === userId) return s.participant_b
    return s.participant_a
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
            Messages
            {userRole === 'admin' && <Badge className="ml-3 bg-purple-100 text-purple-700">Admin View - All Conversations</Badge>}
          </h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'admin' ? 'Monitor all daycare communications' : 'Communicate with daycare staff and parents'}
          </p>
        </div>

        <div className="mb-6 flex gap-3 flex-wrap">
          <Input
            placeholder="Search conversations..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-md bg-white"
          />
          <a href={linkFor(1)}>
            <Button variant="outline">Apply</Button>
          </a>
          <Button onClick={() => setShowCompose(!showCompose)} className="ml-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {showCompose && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compose New Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/dashboard/messages/send" method="POST" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient</label>
                  <select name="recipient_id" required className="w-full border rounded-md px-3 py-2">
                    <option value="">Select recipient...</option>
                    {availableRecipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.full_name} ({r.site_role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Input name="subject" required placeholder="Message subject" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    name="content"
                    required
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Send</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCompose(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((s) => {
            const other = getOtherParticipant(s)
            return (
              <Link key={s.conversation_id} href={`/dashboard/messages/${encodeURIComponent(s.conversation_id)}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{other.full_name || 'Unknown'}</CardTitle>
                        <p className="text-xs text-gray-500">{other.site_role}</p>
                      </div>
                      {s.unread_count > 0 && (
                        <Badge className="bg-red-100 text-red-700">{s.unread_count}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-2">{s.last_message_preview}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(s.last_message_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {summaries.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No conversations found</p>
            <p className="text-sm mt-2">Start a new conversation to get started</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pg = i + 1
              const active = pg === page
              return (
                <a
                  key={pg}
                  href={linkFor(pg)}
                  className={`px-3 py-1 border rounded text-sm ${active ? 'bg-gray-800 text-white' : 'bg-white'}`}
                >
                  {pg}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
