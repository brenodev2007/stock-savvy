import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StockBalance {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    min_stock: number;
    unit: string;
    cost: number;
    price: number;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock_balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_balances')
        .select(`
          *,
          product:products(id, name, sku, min_stock, unit, cost, price),
          warehouse:warehouses(id, name)
        `)
        .order('quantity', { ascending: true });
      
      if (error) throw error;
      return data as StockBalance[];
    },
  });
}

export function useStockByProduct() {
  return useQuery({
    queryKey: ['stock_by_product'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_balances')
        .select(`
          product_id,
          quantity
        `);
      
      if (error) throw error;
      
      // Aggregate by product
      const stockByProduct: Record<string, number> = {};
      data?.forEach((balance) => {
        stockByProduct[balance.product_id] = (stockByProduct[balance.product_id] ?? 0) + balance.quantity;
      });
      
      return stockByProduct;
    },
  });
}

export function useUpdateStockBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product_id, warehouse_id, quantity }: { product_id: string; warehouse_id: string; quantity: number }) => {
      // Upsert: insert or update if exists
      const { data, error } = await supabase
        .from('stock_balances')
        .upsert(
          { product_id, warehouse_id, quantity },
          { onConflict: 'product_id,warehouse_id' }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock_balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock_by_product'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar estoque: ' + error.message);
    },
  });
}
