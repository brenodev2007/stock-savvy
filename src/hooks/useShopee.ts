import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ShopeeAccount, ShopeeOrder, ShopeeOrderItem, ShopeeOrderStatusHistory, ShopeeSyncLog, ShopeeShipmentStatus, ShopeeOrderEditHistory } from '@/types/shopee';

// Accounts
export function useShopeeAccounts() {
  return useQuery({
    queryKey: ['shopee-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ShopeeAccount[];
    },
  });
}

export function useCreateShopeeAccount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (account: { shop_name: string; shop_id: number; is_active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('shopee_accounts')
        .insert({
          shop_name: account.shop_name,
          shop_id: account.shop_id,
          is_active: account.is_active,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-accounts'] });
      toast({ title: 'Conta Shopee adicionada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao adicionar conta', description: error.message, variant: 'destructive' });
    },
  });
}

// Orders
export function useShopeeOrders(filters?: {
  status?: ShopeeShipmentStatus;
  startDate?: Date;
  endDate?: Date;
  carrier?: string;
  search?: string;
  accountId?: string;
}) {
  return useQuery({
    queryKey: ['shopee-orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('shopee_orders')
        .select(`
          *,
          account:shopee_accounts(id, shop_name)
        `)
        .order('purchase_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.startDate) {
        query = query.gte('purchase_date', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('purchase_date', filters.endDate.toISOString());
      }
      if (filters?.carrier) {
        query = query.eq('carrier', filters.carrier);
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId);
      }
      if (filters?.search) {
        query = query.or(`order_sn.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,tracking_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ShopeeOrder[];
    },
  });
}

export function useShopeeOrder(orderId: string) {
  return useQuery({
    queryKey: ['shopee-order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_orders')
        .select(`
          *,
          account:shopee_accounts(id, shop_name),
          status_history:shopee_order_status_history(*),
          items:shopee_order_items(*)
        `)
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ShopeeOrder | null;
    },
    enabled: !!orderId,
  });
}

// Sync Logs
export function useShopeeSyncLogs(accountId?: string) {
  return useQuery({
    queryKey: ['shopee-sync-logs', accountId],
    queryFn: async () => {
      let query = supabase
        .from('shopee_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ShopeeSyncLog[];
    },
  });
}

export function useCreateSyncLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: { account_id: string; sync_type: string; status: string; orders_synced?: number; error_message?: string }) => {
      const { data, error } = await supabase
        .from('shopee_sync_logs')
        .insert({
          account_id: log.account_id,
          sync_type: log.sync_type,
          status: log.status,
          orders_synced: log.orders_synced ?? 0,
          error_message: log.error_message,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-sync-logs'] });
    },
  });
}

// Sync action - calls edge function
export function useSyncShopeeOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke('shopee-sync-orders', {
        body: { account_id: accountId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Sincronização concluída!', description: `${data?.orders_synced || 0} pedidos sincronizados` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro na sincronização', description: error.message, variant: 'destructive' });
    },
  });
}

// Create manual order
export function useCreateManualOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (order: {
      order_sn: string;
      items: { product_name: string; sku?: string; quantity: number; unit_price: number }[];
      customer_name?: string;
      shipping_address?: string;
      order_total: number;
      status: ShopeeShipmentStatus;
      carrier?: string;
      tracking_code?: string;
      purchase_date: string;
      estimated_delivery?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Calculate a display name for the order (e.g. first product + count)
      const displayProductName = order.items.length > 0 
        ? order.items.length > 1 
          ? `${order.items[0].product_name} + ${order.items.length - 1} item(s)`
          : order.items[0].product_name
        : 'Pedido sem itens';

      // Fetch default account (first one) if available, but don't enforce it
      const { data: accounts } = await supabase
        .from('shopee_accounts')
        .select('id')
        .eq('user_id', user.id) // Ensure we get accounts for this user
        .limit(1);
      
      const accountId = accounts?.[0]?.id || null;

      const { data: createdOrder, error: orderError } = await supabase
        .from('shopee_orders')
        .insert({
          order_sn: order.order_sn,
          product_name: displayProductName,
          customer_name: order.customer_name || null,
          shipping_address: order.shipping_address || null,
          order_total: order.order_total,
          status: order.status,
          carrier: order.carrier || null,
          tracking_code: order.tracking_code || null,
          purchase_date: order.purchase_date,
          estimated_delivery: order.estimated_delivery || null,
          account_id: accountId,
          user_id: user.id, // Link to user
        })
        .select()
        .single();

      if (orderError) throw orderError;

      if (order.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('shopee_order_items')
          .insert(
            order.items.map(item => ({
              order_id: createdOrder.id,
              product_name: item.product_name,
              sku: item.sku || null,
              quantity: item.quantity,
              unit_price: item.unit_price,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Deduct stock if we have product_id and user is authenticated
      if (order.items.length > 0) {
        // Fetch default warehouse (first one)
        const { data: warehouses } = await supabase
          .from('warehouses')
          .select('id')
          .limit(1);
        
        const defaultWarehouseId = warehouses?.[0]?.id;

        if (defaultWarehouseId) {
          for (const item of order.items) {
            // Check if item has product_id (it should if selected from list)
            // If not, we can't deduct stock
            const itemAny = item as any;
            if (itemAny.product_id) {
               await supabase
                .from('stock_movements')
                .insert({
                  product_id: itemAny.product_id,
                  warehouse_from_id: defaultWarehouseId, // Deduct from default warehouse
                  quantity: item.quantity,
                  type: 'OUT',
                  reason: 'VENDA_SHOPEE',
                  reference: order.order_sn,
                  user_id: (await supabase.auth.getUser()).data.user?.id,
                });
                
                // Update stock balance
                const { data: currentBalance } = await supabase
                  .from('stock_balances')
                  .select('quantity')
                  .eq('product_id', itemAny.product_id)
                  .eq('warehouse_id', defaultWarehouseId)
                  .maybeSingle();
                  
                const newQty = Math.max(0, (currentBalance?.quantity || 0) - item.quantity);
                
                await supabase
                  .from('stock_balances')
                  .upsert(
                    { product_id: itemAny.product_id, warehouse_id: defaultWarehouseId, quantity: newQty },
                    { onConflict: 'product_id,warehouse_id' }
                  );
            }
          }
        }
      }

      return createdOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock_by_product'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast({ title: 'Pedido cadastrado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao cadastrar pedido', description: error.message, variant: 'destructive' });
    },
  });
}

// Update order with edit history
export function useUpdateShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, previousValues, ...order }: {
      id: string;
      previousValues?: Record<string, unknown>;
      order_sn?: string;
      items?: { product_name: string; sku?: string; quantity: number; unit_price: number }[];
      customer_name?: string | null;
      shipping_address?: string | null;
      order_total?: number;
      status?: ShopeeShipmentStatus;
      carrier?: string | null;
      tracking_code?: string | null;
      purchase_date?: string;
      estimated_delivery?: string | null;
      sku?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Prepare order update data
      const updateData: any = { ...order };
      
      // If items are provided, update display name
      if (order.items) {
        updateData.product_name = order.items.length > 0 
          ? order.items.length > 1 
            ? `${order.items[0].product_name} + ${order.items.length - 1} item(s)`
            : order.items[0].product_name
          : 'Pedido sem itens';
        
        // Remove items from updateData as it's not a column in shopee_orders
        delete updateData.items;
      }

      // Update the order
      const { data, error } = await supabase
        .from('shopee_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle items update if provided
      if (order.items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('shopee_order_items')
          .delete()
          .eq('order_id', id);
        
        if (deleteError) throw deleteError;

        // Insert new items
        if (order.items.length > 0) {
          const { error: insertError } = await supabase
            .from('shopee_order_items')
            .insert(
              order.items.map(item => ({
                order_id: id,
                product_name: item.product_name,
                sku: item.sku || null,
                quantity: item.quantity,
                unit_price: item.unit_price,
              }))
            );
          
          if (insertError) throw insertError;
        }
      }

      // Save edit history if we have previous values
      if (previousValues && Object.keys(order).length > 0) {
        const changes: Record<string, unknown> = {};
        for (const key of Object.keys(order)) {
          if (order[key as keyof typeof order] !== previousValues[key]) {
            changes[key] = order[key as keyof typeof order];
          }
        }
        
        if (Object.keys(changes).length > 0) {
          await supabase
            .from('shopee_order_edit_history')
            .insert([{
              order_id: id,
              user_id: user.id,
              changes: changes as unknown as import('@/integrations/supabase/types').Json,
              previous_values: previousValues as unknown as import('@/integrations/supabase/types').Json,
            }]);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-edit-history'] });
      toast({ title: 'Pedido atualizado com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar pedido', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete order
export function useDeleteShopeeOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('shopee_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: 'Pedido excluído com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir pedido', description: error.message, variant: 'destructive' });
    },
  });
}

// Get order stats
export function useShopeeOrderStats() {
  return useQuery({
    queryKey: ['shopee-order-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_orders')
        .select('status');
      
      if (error) throw error;

      const stats = {
        total: data.length,
        aguardandoEnvio: data.filter(o => o.status === 'AGUARDANDO_ENVIO').length,
        enviado: data.filter(o => o.status === 'ENVIADO').length,
        emTransporte: data.filter(o => o.status === 'EM_TRANSPORTE').length,
        entregue: data.filter(o => o.status === 'ENTREGUE').length,
        cancelado: data.filter(o => o.status === 'CANCELADO' || o.status === 'DEVOLVIDO').length,
      };

      return stats;
    },
  });
}

// Delete multiple orders
export function useDeleteMultipleShopeeOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const { error } = await supabase
        .from('shopee_orders')
        .delete()
        .in('id', orderIds);

      if (error) throw error;
    },
    onSuccess: (_, orderIds) => {
      queryClient.invalidateQueries({ queryKey: ['shopee-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shopee-order-stats'] });
      toast({ title: `${orderIds.length} pedido(s) excluído(s) com sucesso!` });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir pedidos', description: error.message, variant: 'destructive' });
    },
  });
}

// Get order edit history
export function useShopeeOrderEditHistory(orderId: string) {
  return useQuery({
    queryKey: ['shopee-order-edit-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shopee_order_edit_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data as ShopeeOrderEditHistory[];
    },
    enabled: !!orderId,
  });
}
