import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  due_date: string | null;
  type: 'income' | 'expense';
  category_id: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  is_installment: boolean;
  installment_number: number | null;
  installment_count: number | null;
  is_fixed: boolean;
  is_paid: boolean;
  parent_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
}

export interface CreateTransactionData {
  amount: number;
  description?: string;
  transaction_date: string;
  due_date?: string;
  type: 'income' | 'expense';
  category_id?: string;
  is_recurring?: boolean;
  recurring_interval?: string;
  is_installment?: boolean;
  installment_count?: number;
  is_fixed?: boolean;
  is_paid?: boolean;
}

export function useTransactions(type?: 'income' | 'expense') {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', type],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const createTransaction = useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      if (!user) throw new Error('User not authenticated');

      // If it's an installment, create multiple transactions
      if (data.is_installment && data.installment_count && data.installment_count > 1) {
        const transactions = [];
        const baseDate = new Date(data.transaction_date);
        
        for (let i = 1; i <= data.installment_count; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1));
          
          const transactionData = {
            ...data,
            user_id: user.id,
            transaction_date: installmentDate.toISOString().split('T')[0],
            installment_number: i,
            is_paid: i === 1 ? (data.is_paid ?? true) : false, // Only first installment is paid by default
          };

          transactions.push(transactionData);
        }

        const { data: result, error } = await supabase
          .from('transactions')
          .insert(transactions)
          .select();

        if (error) throw error;
        return result;
      } else {
        // Single transaction
        const { data: result, error } = await supabase
          .from('transactions')
          .insert([{ ...data, user_id: user.id }])
          .select();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Transação criada!',
        description: 'A transação foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) => {
      const { error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Transação atualizada!',
        description: 'A transação foi atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Transação excluída!',
        description: 'A transação foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir transação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}