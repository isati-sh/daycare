import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database'
import ConversationClient from './ConversationClient'
export const revalidate = 0

const PAGE_SIZE = 50

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: { conversationId: string }
  searchParams?: { page?: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role, full_name')
    .eq('id', session.user.id)
    .single()
  if (!profile) redirect('/access-denied')

  const role = profile.site_role
  if (!role || (role !== 'parent' && role !== 'teacher' && role !== 'admin')) {
    redirect('/access-denied')
  }

  const convId = decodeURIComponent(params.conversationId)
  const [a, b] = convId.split('-')
  if (!a || !b) redirect('/dashboard/messages')

  // Authorization check: ensure user is part of conversation (unless admin)
  if (role !== 'admin' && ![a, b].includes(session.user.id)) {
    redirect('/access-denied')
  }

  const page = Math.max(1, parseInt(searchParams?.page || '1', 10))

  const { data: msgs, error } = await supabase
    .from('messages')
    .select(
      'id, sender_id, recipient_id, subject, content, read, created_at, sender:profiles!messages_sender_id_fkey(id, full_name), recipient:profiles!messages_recipient_id_fkey(id, full_name)'
    )
    .in('sender_id', [a, b])
    .in('recipient_id', [a, b])
    .order('created_at', { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (error) {
    return <div className="p-6 text-red-600">Failed to load conversation.</div>
  }

  const messagesAny = (msgs as any[] | null) || []
  
  // Determine other participant
  const otherId = [a, b].find((id) => id !== session.user.id) || a
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('id, full_name, site_role')
    .eq('id', otherId)
    .single()

  return (
    <ConversationClient
      conversationId={convId}
      messages={messagesAny}
      page={page}
      pageSize={PAGE_SIZE}
      currentUserId={session.user.id}
      currentUserName={profile.full_name || 'You'}
      otherParticipant={otherProfile || { id: otherId, full_name: 'Unknown', site_role: null }}
      userRole={role}
    />
  )
}
