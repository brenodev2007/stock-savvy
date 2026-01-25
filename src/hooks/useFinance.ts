import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'cost';
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
  user_id: string;
}

export interface CreateTransactionDTO {
  type: 'income' | 'expense' | 'cost';
  amount: number;
  description: string;
  category: string;
  transaction_date: Date;
}

export function useFinance() {
  return useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const { data } = await api.get('/finance/summary');
      return data;
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: CreateTransactionDTO) => {
      const { data } = await api.post('/finance/transactions', transaction);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
