import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { startOfDay, endOfDay } from 'date-fns';
import type { ShopeeAccount, ShopeeOrder, ShopeeShipmentStatus } from '@/types/shopee';

// Utility para gerenciar LocalStorage
const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};
const setLocalData = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ACCOUNTS_KEY = 'mock_shopee_accounts';
const ORDERS_KEY = 'mock_shopee_orders';

export function useShopeeAccounts() {
  return useQuery({
    queryKey: ['shopee-accounts'],
    queryFn: async () => getLocalData<ShopeeAccount[]>(ACCOUNTS_KEY, []),
  });
}

export function useActiveShopeeAccount() {
  return useQuery({
    queryKey: ['shopee-active-account'],
    queryFn: async () => {
      const accounts = getLocalData<ShopeeAccount[]>(ACCOUNTS_KEY, []);
      return accounts.find(a => a.is_active) || null;
    },
  });
}

export function useCreateShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (account: any) => {
      const accounts = getLocalData<ShopeeAccount[]>(ACCOUNTS_KEY, []);
      const newAccount = { ...account, id: Date.now().toString(), created_at: new Date().toISOString() };
      setLocalData(ACCOUNTS_KEY, [...accounts, newAccount]);
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({ title: 'Conta Shopee adicionada com sucesso!' });
    },
  });
}

export function useDeleteShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const accounts = getLocalData<ShopeeAccount[]>(ACCOUNTS_KEY, []).filter(a => a.id !== accountId);
      setLocalData(ACCOUNTS_KEY, accounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({ title: 'Conta deletada com sucesso!' });
    },
  });
}

export function useSetActiveShopeeAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const accounts = getLocalData<ShopeeAccount[]>(ACCOUNTS_KEY, []).map(a => ({
        ...a,
        is_active: a.id === accountId
      }));
      setLocalData(ACCOUNTS_KEY, accounts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-active-account'] });
    },
  });
}

export function useShopeeOrders(filters?: any) {
  return useQuery({
    queryKey: ['shopee-orders', filters],
    queryFn: async () => {
      let orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []);
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

export function useShopeeOrder(orderId: string) {
  return useQuery({
    queryKey: ['shopee-order', orderId],
    queryFn: async () => {
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []);
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
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []);
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
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Pedido cadastrado com sucesso!' });
    },
  });
}

export function useUpdateShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []);
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
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Pedido atualizado!' });
    },
  });
}

export function useDeleteShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []).filter(o => o.id !== orderId);
      setLocalData(ORDERS_KEY, orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Pedido excluído!' });
    },
  });
}

export function useDeleteMultipleShopeeOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []).filter(o => !orderIds.includes(o.id));
      setLocalData(ORDERS_KEY, orders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Pedidos excluídos!' });
    },
  });
}

export function useShopeeOrderStats() {
  return useQuery({
    queryKey: ['shopee-order-stats'],
    queryFn: async () => {
      const orders = getLocalData<ShopeeOrder[]>(ORDERS_KEY, []);
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

export function useShopeeSyncLogs() {
  return useQuery({
    queryKey: ['shopee-sync-logs'],
    queryFn: async () => [],
  });
}

export function useCreateSyncLog() {
  return useMutation({ mutationFn: async () => {} });
}

export function useSyncShopeeOrders() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async () => {
      return new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({ title: 'Sincronização simulada concluída com sucesso!' });
    }
  });
}

export function useShopeeOrderEditHistory() {
  return useQuery({
    queryKey: ['shopee-order-edit-history'],
    queryFn: async () => [],
  });
}
