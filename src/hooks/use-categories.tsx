import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense';
  user_id: string;
  created_at: string;
}

export function useCategories(type?: 'income' | 'expense') {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as Category[];
    },
    enabled: !!user,
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
  };
}