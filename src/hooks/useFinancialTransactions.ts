import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

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

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  category?: string;
}

export function useFinancialTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['financial_transactions', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate.toISOString());
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as FinancialTransaction[];
    },
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial_summary'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get current month transactions
      const { data: currentMonth, error: currentError } = await (supabase as any)
        .from('financial_transactions')
        .select('*')
        .gte('transaction_date', startOfMonth.toISOString())
        .lte('transaction_date', endOfMonth.toISOString());

      if (currentError) throw currentError;

      // Get all transactions for historical data
      const { data: allTransactions, error: allError } = await (supabase as any)
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (allError) throw allError;

      const transactions = currentMonth as FinancialTransaction[];
      const allTx = allTransactions as FinancialTransaction[];

      // Calculate metrics
      const revenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const costs = transactions
        .filter(t => t.type === 'cost')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const profit = revenue - costs - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      // Total historical
      const totalRevenue = allTx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalCosts = allTx
        .filter(t => t.type === 'cost' || t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const cashBalance = totalRevenue - totalCosts;

      // Group by month for chart
      const monthlyData = allTx.reduce((acc, t) => {
        const date = new Date(t.transaction_date);
        const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (!acc[key]) {
          acc[key] = { name: key, vendas: 0, custos: 0, lucro: 0, date };
        }
        
        if (t.type === 'income') {
          acc[key].vendas += Number(t.amount);
        } else {
          acc[key].custos += Number(t.amount);
        }
        acc[key].lucro = acc[key].vendas - acc[key].custos;
        
        return acc;
      }, {} as Record<string, { name: string; vendas: number; custos: number; lucro: number; date: Date }>);

      const chartData = Object.values(monthlyData)
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-6);

      // Recent transactions
      const recentTransactions = allTx.slice(0, 10);

      // Category breakdown
      const categoryBreakdown = transactions.reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { income: 0, expense: 0, cost: 0 };
        }
        acc[t.category][t.type] += Number(t.amount);
        return acc;
      }, {} as Record<string, { income: number; expense: number; cost: number }>);

      return {
        revenue,
        costs,
        expenses,
        profit,
        margin,
        cashBalance,
        chartData,
        recentTransactions,
        categoryBreakdown,
        totalTransactions: transactions.length,
      };
    },
  });
}

export function useCreateFinancialTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await (supabase as any)
        .from('financial_transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          description: transaction.description || null,
          reference_type: transaction.reference_type || 'manual',
          reference_id: transaction.reference_id || null,
          transaction_date: transaction.transaction_date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      toast.success('Transação registrada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao registrar transação: ' + error.message);
    },
  });
}

export function useDeleteFinancialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('financial_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial_summary'] });
      toast.success('Transação removida');
    },
    onError: (error) => {
      toast.error('Erro ao remover transação: ' + error.message);
    },
  });
}
