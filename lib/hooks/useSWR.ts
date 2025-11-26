import useSWR from 'swr'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Admin dashboard data
export function useAdminMetrics() {
  const { data, error, isLoading } = useSWR('/api/admin/metrics', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })
  return { data: data?.data, error, isLoading }
}

// Children management
export function useChildren(role?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/children${role ? `?role=${role}` : ''}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Teachers management
export function useTeachers(status?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/teachers${status ? `?status=${status}` : ''}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Parents management
export function useParents(status?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/parents${status ? `?status=${status}` : ''}`,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Messages
export function useMessages(conversationId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    conversationId ? `/api/messages?conversationId=${conversationId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Announcements
export function useAnnouncements() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/announcements',
    fetcher,
    { revalidateOnFocus: false }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Activity logs
export function useActivityLogs() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/activity-logs',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )
  return { data: data?.data, error, isLoading, mutate }
}

// Pending approvals
export function usePendingApprovals() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/pending-approvals',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )
  return { data: data?.data, error, isLoading, mutate }
}
