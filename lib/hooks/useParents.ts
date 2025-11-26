import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useParents() {
  return useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('site_role', 'parent')
        .order('full_name', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    },
  })
}

export function useParent(id: string) {
  return useQuery({
    queryKey: ['parents', id],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('site_role', 'parent')
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateParent(id: string) {
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
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      queryClient.invalidateQueries({ queryKey: ['parents', id] })
    },
  })
}

export function useDeactivateParent(id: string) {
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
      queryClient.invalidateQueries({ queryKey: ['parents'] })
      queryClient.invalidateQueries({ queryKey: ['parents', id] })
    },
  })
}
