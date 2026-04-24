import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay } from 'date-fns';
import type { ShopeeOrder, ShopeeShipmentStatus, ShopeeAccount, ShopeeSyncLog } from '@/types/shopee';

interface ShopeeOrdersFilters {
  status?: ShopeeShipmentStatus;
  startDate?: Date;
  endDate?: Date;
  carrier?: string;
  search?: string;
}

// Fetch orders with filters
export function useShopeeOrders(filters: ShopeeOrdersFilters = {}) {
  return useQuery({
    queryKey: ['shopee-orders', filters],
    queryFn: async () => {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = startOfDay(filters.startDate).toISOString();
      if (filters.endDate) params.endDate = endOfDay(filters.endDate).toISOString();
      if (filters.carrier) params.carrier = filters.carrier;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get('/shopee/orders', { params });
      return data as ShopeeOrder[];
    },
  });
}

// Fetch order statistics
export function useShopeeOrderStats() {
  return useQuery({
    queryKey: ['shopee-stats'],
    queryFn: async () => {
      const { data } = await api.get('/shopee/stats');
      return data as {
        total: number;
        aguardandoEnvio: number;
        enviado: number;
        emTransito: number;
        entregue: number;
        cancelado: number;
        atrasados?: number;
      };
    },
  });
}

// Fetch single order
export function useShopeeOrder(orderId: string) {
  return useQuery({
    queryKey: ['shopee-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await api.get(`/shopee/orders/${orderId}`);
      return data as ShopeeOrder;
    },
    enabled: !!orderId,
  });
}

// Create manual order
export function useCreateManualOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (order: Partial<ShopeeOrder>) => {
      const { data } = await api.post('/shopee/orders', order);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-stats'] });
      toast({
        title: "Pedido criado",
        description: "O pedido manual foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pedido",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    },
  });
}

// Update order
export function useUpdateShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<ShopeeOrder> }) => {
      const { data } = await api.put(`/shopee/orders/${orderId}`, updates);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['shopee-stats'] });
      toast({
        title: "Pedido atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete order
export function useDeleteShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      await api.delete(`/shopee/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-stats'] });
      toast({
        title: "Pedido excluído",
        description: "O pedido foi removido do sistema.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir pedido",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    },
  });
}

// Delete multiple orders
export function useDeleteMultipleShopeeOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      await api.delete('/shopee/orders/bulk', { data: { ids: orderIds } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-stats'] });
      toast({
        title: "Pedidos excluídos",
        description: "Os pedidos selecionados foram removidos.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir pedidos",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    },
  });
}

// Accounts management
export function useShopeeAccounts() {
  return useQuery({
    queryKey: ['shopee-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/shopee/accounts');
      return data as ShopeeAccount[];
    },
  });
}

export function useCreateShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: Partial<ShopeeAccount>) => {
      const { data } = await api.post('/shopee/accounts', account);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({
        title: "Conta conectada",
        description: "A conta Shopee foi vinculada com sucesso.",
      });
    },
  });
}

export function useSetDefaultShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      await api.put(`/shopee/accounts/${accountId}/active`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({
        title: "Conta alterada",
        description: "A conta ativa foi atualizada.",
      });
    },
  });
}

export function useDeleteShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      await api.delete(`/shopee/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({
        title: "Conta removida",
        description: "A conta Shopee foi desconectada.",
      });
    },
  });
}

// Sync management
export function useSyncShopeeOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data } = await api.post(`/shopee/accounts/${accountId}/sync`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-stats'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-sync-logs'] });
      toast({
        title: "Sincronização iniciada",
        description: "Buscando novos pedidos na Shopee...",
      });
    },
  });
}

export function useShopeeSyncLogs() {
  return useQuery({
    queryKey: ['shopee-sync-logs'],
    queryFn: async () => {
      const { data } = await api.get('/shopee/sync-logs');
      return data as ShopeeSyncLog[];
    },
  });
}

// Edit history (Mocking for now as backend doesn't have it)
export function useShopeeOrderEditHistory(orderId: string) {
  return useQuery({
    queryKey: ['shopee-order-history', orderId],
    queryFn: async () => {
      return [] as any[];
    },
    enabled: !!orderId,
  });
}
