import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  cost: number;
  price: number;
  min_stock: number;
  description?: string;
  category_id?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  is_active: boolean;
}

export interface StockBalance {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  warehouse?: Warehouse;
}

export function useStockBalances() {
  return useQuery({
    queryKey: ['stock_balances'],
    queryFn: async () => {
      const { data } = await api.get('/stock/balances');
      return data as StockBalance[];
    },
  });
}
