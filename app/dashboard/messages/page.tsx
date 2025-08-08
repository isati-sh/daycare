'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  Plus,
  Inbox,
  Archive,
  Shield,
  Users,
  Baby
} from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import RoleGuard from '@/components/guards/roleGuard'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  subject: string
  content: string
  read: boolean
  created_at: string
  sender_name?: string
  recipient_name?: string
  sender?: { full_name: string; site_role: string }
  recipient?: { full_name: string; site_role: string }
}

interface Profile {
  id: string
  full_name: string
  site_role: 'parent' | 'teacher' | 'admin'
}

export default function MessagesPage() {
  const { user, client: supabase, role } = useSupabase()
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const [composeForm, setComposeForm] = useState({
    recipient_id: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (user) {
      fetchMessages()
      fetchProfiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name, site_role),
          recipient:profiles!messages_recipient_id_fkey(full_name, site_role)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map sender_name and recipient_name for easier access
      const mapped = (data || []).map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.full_name,
        recipient_name: msg.recipient?.full_name,
      }))
      setMessages(mapped)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, site_role')
        .neq('id', user?.id)
        .order('full_name')

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!composeForm.recipient_id || !composeForm.subject || !composeForm.content) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user?.id,
          recipient_id: composeForm.recipient_id,
          subject: composeForm.subject,
          content: composeForm.content
        }])

      if (error) throw error
      
      toast.success('Message sent successfully')
      setComposeForm({ recipient_id: '', subject: '', content: '' })
      setShowCompose(false)
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId)

      if (error) throw error
      fetchMessages()
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />
      case 'teacher': return <Users className="h-4 w-4 text-green-600" />
      case 'parent': return <Baby className="h-4 w-4 text-purple-600" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'teacher': return 'bg-green-100 text-green-700 border-green-200'
      case 'parent': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard path="/dashboard/messages">
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-blue-600" />
            Messages
          </h1>
          <p className="text-gray-600 mt-2">
            Communicate with daycare staff and parents
          </p>
          <Badge className={`mt-2 ${getRoleBadgeColor(role || '')}`}>
            {getRoleIcon(role || '')}
            <span className="ml-1 capitalize">{role}</span>
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Inbox className="h-5 w-5 mr-2" />
                    Messages
                  </div>
                  <Button onClick={() => setShowCompose(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </CardTitle>
                <CardDescription>
                  {messages.length} messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                      <Button onClick={() => setShowCompose(true)} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Send First Message
                      </Button>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${!message.read && message.recipient_id === user?.id ? 'bg-blue-50 border-blue-200' : ''}`}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (!message.read && message.recipient_id === user?.id) {
                            markAsRead(message.id)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {message.subject}
                          </h4>
                          {!message.read && message.recipient_id === user?.id && (
                            <Badge variant="default" className="text-xs bg-red-500 hover:bg-red-600">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <span>
                              {message.sender_id === user?.id ? 'To: ' : 'From: '}
                            </span>
                            {message.sender_id === user?.id ? (
                              <>
                                {getRoleIcon(message.recipient?.site_role || '')}
                                <span>{message.recipient_name}</span>
                              </>
                            ) : (
                              <>
                                {getRoleIcon(message.sender?.site_role || '')}
                                <span>{message.sender_name}</span>
                              </>
                            )}
                          </div>
                          <span>{formatDate(message.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {selectedMessage.subject}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {selectedMessage.sender_id === user?.id ? 'Sent' : 'Received'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(selectedMessage.created_at)}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <span>
                      {selectedMessage.sender_id === user?.id ? 'To: ' : 'From: '}
                    </span>
                    {selectedMessage.sender_id === user?.id ? (
                      <>
                        {getRoleIcon(selectedMessage.recipient?.site_role || '')}
                        <span>{selectedMessage.recipient_name}</span>
                        <Badge className={`text-xs ${getRoleBadgeColor(selectedMessage.recipient?.site_role || '')}`}>
                          {selectedMessage.recipient?.site_role}
                        </Badge>
                      </>
                    ) : (
                      <>
                        {getRoleIcon(selectedMessage.sender?.site_role || '')}
                        <span>{selectedMessage.sender_name}</span>
                        <Badge className={`text-xs ${getRoleBadgeColor(selectedMessage.sender?.site_role || '')}`}>
                          {selectedMessage.sender?.site_role}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setComposeForm({
                          recipient_id: selectedMessage.sender_id === user?.id 
                            ? selectedMessage.recipient_id 
                            : selectedMessage.sender_id,
                          subject: `Re: ${selectedMessage.subject}`,
                          content: ''
                        })
                        setShowCompose(true)
                        setSelectedMessage(null)
                      }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Message</h3>
                  <p className="text-gray-600">
                    Choose a message from the list to view its details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Compose Message Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg max-w-sm sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    New Message
                  </h2>
                  <Button variant="ghost" onClick={() => setShowCompose(false)} className="p-1 sm:p-2">
                    ×
                  </Button>
                </div>

                <form onSubmit={sendMessage} className="space-y-4 sm:space-y-6">
                  <div>
                    <Label htmlFor="recipient" className="text-xs sm:text-sm">To</Label>
                    <select
                      id="recipient"
                      value={composeForm.recipient_id}
                      onChange={(e) => setComposeForm({ ...composeForm, recipient_id: e.target.value })}
                      className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base h-10 sm:h-12 mt-1"
                      required
                    >
                      <option value="">Select recipient...</option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.full_name} ({profile.site_role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-xs sm:text-sm">Subject</Label>
                    <Input
                      id="subject"
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                      placeholder="Enter subject..."
                      className="h-10 sm:h-12 text-sm sm:text-base mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content" className="text-xs sm:text-sm">Message</Label>
                    <Textarea
                      id="content"
                      value={composeForm.content}
                      onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                      placeholder="Type your message..."
                      rows={6}
                      className="text-sm sm:text-base mt-1 min-h-[120px] sm:min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <Button type="button" variant="outline" onClick={() => setShowCompose(false)} className="h-10 sm:h-12 text-sm sm:text-base">
                      Cancel
                    </Button>
                    <Button type="submit" className="h-10 sm:h-12 text-sm sm:text-base">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  )
}
