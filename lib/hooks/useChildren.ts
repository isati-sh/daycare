'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

// Fetch all children
export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw new Error(error.message || 'Failed to fetch children');
      return data || [];
    },
  });
}

// Fetch a single child
export function useChild(id: string | undefined) {
  return useQuery({
    queryKey: ['children', id],
    queryFn: async () => {
      if (!id) return null;

      const supabase = createClient();

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message || 'Failed to fetch child');
      return data;
    },
    enabled: !!id,
  });
}

// Create a child
export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (child: any) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('children')
        .insert([child])
        .select()
        .single();

      if (error) throw new Error(error.message || 'Failed to create child');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

// Update a child
export function useUpdateChild(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message || 'Failed to update child');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['children', id] });
    },
  });
}

// Delete a child
export function useDeleteChild(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createClient();

      const { error } = await supabase.from('children').delete().eq('id', id);

      if (error) throw new Error(error.message || 'Failed to delete child');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}
