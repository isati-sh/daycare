'use client'

import { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { markAsReadAction } from '../actions/markAsRead'
import { sendMessageAction } from '../actions/sendMessage'
import { useRouter } from 'next/navigation'

interface MessageRow {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  read: boolean
  created_at: string
  sender?: { id: string; full_name: string | null }
  recipient?: { id: string; full_name: string | null }
}

export default function ConversationClient({
  conversationId,
  messages,
  page,
  pageSize,
  currentUserId,
  currentUserName,
  otherParticipant,
  userRole,
}: {
  conversationId: string
  messages: MessageRow[]
  page: number
  pageSize: number
  currentUserId: string
  currentUserName: string
  otherParticipant: { id: string; full_name: string | null; site_role: string | null }
  userRole: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const sendReply = () => {
    if (!content.trim()) return
    startTransition(async () => {
      const res = await sendMessageAction({
        recipient_id: otherParticipant.id,
        subject: subject || 'Re: Conversation',
        content,
      })
      if (res.error) {
        setMessage(res.error)
      } else {
        setMessage('Message sent!')
        setSubject('')
        setContent('')
        router.refresh()
      }
    })
  }

  const markRead = (msgId: string) => {
    startTransition(async () => {
      await markAsReadAction(msgId)
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard/messages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-xl">{otherParticipant.full_name || 'Unknown'}</span>
                {otherParticipant.site_role && (
                  <Badge className="ml-3" variant="outline">
                    {otherParticipant.site_role}
                  </Badge>
                )}
                {userRole === 'admin' && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700">Admin View</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map((m) => {
                const isFromMe = m.sender_id === currentUserId
                return (
                  <div
                    key={m.id}
                    className={`border rounded-lg p-4 ${isFromMe ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                  >
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span className="font-medium">
                        {isFromMe ? currentUserName : (m.sender?.full_name || 'Unknown')}
                      </span>
                      <span>{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    {m.subject && <div className="font-semibold mb-1">{m.subject}</div>}
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                    {!m.read && !isFromMe && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        disabled={pending}
                        onClick={() => markRead(m.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    {!m.read && isFromMe && <Badge className="mt-2 bg-gray-200 text-gray-600">Unread</Badge>}
                    {m.read && <Badge className="mt-2 bg-green-100 text-green-700">Read</Badge>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reply</CardTitle>
          </CardHeader>
          <CardContent>
            {message && (
              <div className={`mb-4 p-3 rounded ${message.includes('error') || message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject (optional)</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Re: Conversation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={5}
                />
              </div>
              <Button disabled={pending || !content.trim()} onClick={sendReply}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
