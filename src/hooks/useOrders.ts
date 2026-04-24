import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay } from 'date-fns';
import type { OrderAccount, Order, OrderShipmentStatus } from '@/types/orders';

// Utility para gerenciar LocalStorage
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};
const setLocalData = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ACCOUNTS_KEY = 'mock_universal_accounts';
const ORDERS_KEY = 'mock_universal_orders';

export function useOrderAccounts() {
  return useQuery({
    queryKey: ['order-accounts'],
    queryFn: async () => getLocalData<OrderAccount[]>(ACCOUNTS_KEY, []),
  });
}

export function useActiveOrderAccount() {
  return useQuery({
    queryKey: ['order-active-account'],
    queryFn: async () => {
      const accounts = getLocalData<OrderAccount[]>(ACCOUNTS_KEY, []);
      return accounts.find(a => a.is_active) || null;
    },
  });
}

export function useCreateOrderAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (account: any) => {
      const accounts = getLocalData<OrderAccount[]>(ACCOUNTS_KEY, []);
      const newAccount = { ...account, id: Date.now().toString(), created_at: new Date().toISOString() };
      setLocalData(ACCOUNTS_KEY, [...accounts, newAccount]);
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-accounts'] });
      toast({ title: 'Conta de e-commerce adicionada!' });
    },
  });
}

export function useDeleteOrderAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const accounts = getLocalData<OrderAccount[]>(ACCOUNTS_KEY, []).filter(a => a.id !== accountId);
      setLocalData(ACCOUNTS_KEY, accounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-accounts'] });
      toast({ title: 'Conta removida com sucesso!' });
    },
  });
}

export function useSetActiveOrderAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const accounts = getLocalData<OrderAccount[]>(ACCOUNTS_KEY, []).map(a => ({
        ...a,
        is_active: a.id === accountId
      }));
      setLocalData(ACCOUNTS_KEY, accounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['order-active-account'] });
    },
  });
}

export function useOrders(filters?: any) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let orders = getLocalData<Order[]>(ORDERS_KEY, []);
      if (filters?.status) orders = orders.filter(o => o.status === filters.status);
      if (filters?.carrier) orders = orders.filter(o => o.carrier === filters.carrier);
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        orders = orders.filter(o => o.order_sn?.toLowerCase().includes(s) || o.product_name?.toLowerCase().includes(s));
      }
      return orders.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []);
      return orders.find(o => o.id === orderId) || null;
    },
    enabled: !!orderId,
  });
}

export function useCreateManualOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (order: any) => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []);
      const newOrder = { 
        ...order, 
        id: Date.now().toString(), 
        product_name: order.items?.length > 0 ? order.items[0].product_name : 'Produto',
        items: order.items || []
      };
      setLocalData(ORDERS_KEY, [newOrder, ...orders]);
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast({ title: 'Pedido cadastrado com sucesso!' });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []);
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updateData };
        if (updateData.items?.length > 0) {
          orders[index].product_name = updateData.items[0].product_name;
        }
        setLocalData(ORDERS_KEY, orders);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast({ title: 'Pedido atualizado!' });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []).filter(o => o.id !== orderId);
      setLocalData(ORDERS_KEY, orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast({ title: 'Pedido excluído!' });
    },
  });
}

export function useDeleteMultipleOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []).filter(o => !orderIds.includes(o.id));
      setLocalData(ORDERS_KEY, orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
      toast({ title: 'Pedidos excluídos!' });
    },
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const orders = getLocalData<Order[]>(ORDERS_KEY, []);
      const now = new Date();
      return {
        total: orders.length,
        aguardandoEnvio: orders.filter(o => o.status === 'AGUARDANDO_ENVIO').length,
        enviado: orders.filter(o => o.status === 'ENVIADO').length,
        emTransito: orders.filter(o => o.status === 'EM_TRANSPORTE').length,
        entregue: orders.filter(o => o.status === 'ENTREGUE').length,
        cancelado: orders.filter(o => o.status === 'CANCELADO' || o.status === 'DEVOLVIDO').length,
        atrasados: orders.filter(o => o.estimated_delivery && new Date(o.estimated_delivery) < now && !['ENTREGUE', 'CANCELADO', 'DEVOLVIDO'].includes(o.status)).length
      };
    },
  });
}

export function useOrderSyncLogs() {
  return useQuery({
    queryKey: ['order-sync-logs'],
    queryFn: async () => [],
  });
}

export function useCreateSyncLog() {
  return useMutation({ mutationFn: async () => {} });
}

export function useSyncOrders() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({ title: 'Sincronização manual concluída!' });
    }
  });
}

export function useOrderEditHistory() {
  return useQuery({
    queryKey: ['order-edit-history'],
    queryFn: async () => [],
  });
}
