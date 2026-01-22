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
  warehouse_from?: {
    id: string;
    name: string;
  };
  warehouse_to?: {
    id: string;
    name: string;
  };
}

export function useMovements(filters?: { startDate?: Date; endDate?: Date }) {
  return useQuery({
    queryKey: ['movements', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate.toISOString());
      if (filters?.endDate) params.append('endDate', filters.endDate.toISOString());
      
      const { data } = await api.get(`/stock/movements?${params.toString()}`);
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

export function useUpdateMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movement: {
      id: string;
      product_id: string;
      warehouse_from_id?: string;
      warehouse_to_id?: string;
      quantity: number;
      type: MovementType;
      reason?: string;
      reference?: string;
    }) => {
      const { id, ...updateData } = movement;
      const { data } = await api.put(`/stock/movements/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      toast.success('Movimentação atualizada com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar movimentação: ' + (error.response?.data?.error || error.message));
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/stock/movements/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balances'] });
      toast.success('Movimentação excluída com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir movimentação: ' + (error.response?.data?.error || error.message));
    },
  });
}
