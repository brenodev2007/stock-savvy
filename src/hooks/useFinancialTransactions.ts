import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export type TransactionType = 'income' | 'expense' | 'cost';
export type ReferenceType = 'shopee_order' | 'stock_movement' | 'manual' | 'payroll';

export interface FinancialTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string | null;
  reference_type: ReferenceType | null;
  reference_id: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export function useFinancialTransactions() {
  return useQuery({
    queryKey: ['financial_transactions'],
    queryFn: async () => {
      const { data } = await api.get('/finance/transactions');
      return data as FinancialTransaction[];
    },
  });
}

export interface FinancialSummary {
  revenue: number;
  costs: number;
  expenses: number;
  cashBalance: number;
  chartData: Array<{
    name: string;
    vendas: number;
    lucro: number;
  }>;
  recentTransactions: FinancialTransaction[];
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      const { data } = await api.get('/finance/summary');
      return data as FinancialSummary;
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      type: TransactionType;
      category: string;
      amount: number;
      description?: string;
      reference_type?: ReferenceType;
      reference_id?: string;
      transaction_date?: string;
    }) => {
      const { data } = await api.post('/finance/transactions', {
        ...transaction,
        transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0]
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Transação registrada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao registrar transação: ' + (error.response?.data?.error || error.message));
    },
  });
}

export function useDeleteFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Transação removida');
    },
    onError: (error: any) => {
      toast.error('Erro ao remover transação: ' + (error.response?.data?.error || error.message));
    },
  });
}
