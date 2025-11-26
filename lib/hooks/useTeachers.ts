import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('site_role', 'teacher')
        .order('full_name', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    },
  })
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('site_role', 'teacher')
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (updates: any) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', id] })
    },
  })
}

export function useDeactivateTeacher(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ active_status: false })
        .eq('id', id)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['teachers', id] })
    },
  })
}
