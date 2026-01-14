import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data } = await api.get('/warehouses');
      return data as Warehouse[];
    },
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouse: { name: string; address?: string; is_active?: boolean }) => {
      const { data } = await api.post('/warehouses', warehouse);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Depósito criado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar depósito: ' + (error.response?.data?.error || error.message));
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; address?: string; is_active?: boolean }) => {
      const { data } = await api.put(`/warehouses/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Depósito atualizado com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar depósito: ' + (error.response?.data?.error || error.message));
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Depósito excluído com sucesso');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir depósito: ' + (error.response?.data?.error || error.message));
    },
  });
}
