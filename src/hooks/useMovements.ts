import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_from_id: string | null;
  warehouse_to_id: string | null;
  quantity: number;
  type: MovementType;
  user_id: string;
  reason: string | null;
  reference: string | null;
  lot_id: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export function useMovements() {
  return useQuery({
    queryKey: ['movements'],
    queryFn: async () => {
      const { data } = await api.get('/stock/movements');
      return data as StockMovement[];
    },
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movement: {
      product_id: string;
      warehouse_from_id?: string;
      warehouse_to_id?: string;
      quantity: number;
      type: MovementType;
      reason?: string;
      reference?: string;
    }) => {
      const { data } = await api.post('/stock/movements', movement);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      toast.success('Movimentação registrada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao registrar movimentação: ' + (error.response?.data?.error || error.message));
    },
  });
}
