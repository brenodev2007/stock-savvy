import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface StockBalance {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock-balances'],
    queryFn: async () => {
      const { data } = await api.get('/stock/balances');
      return data as StockBalance[];
    },
  });
}
