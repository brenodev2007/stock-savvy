import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

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
  } | null;
  warehouse_to?: {
    id: string;
    name: string;
  } | null;
}

interface UseMovementsOptions {
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

export function useMovements(options?: number | UseMovementsOptions) {
  const limit = typeof options === 'number' ? options : options?.limit;
  const startDate = typeof options === 'object' ? options.startDate : undefined;
  const endDate = typeof options === 'object' ? options.endDate : undefined;

  return useQuery({
    queryKey: ['movements', limit, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(id, name, sku),
          warehouse_from:warehouses!stock_movements_warehouse_from_id_fkey(id, name),
          warehouse_to:warehouses!stock_movements_warehouse_to_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as StockMovement[];
    },
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          ...movement,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update stock balances based on movement type
      if (movement.type === 'IN' && movement.warehouse_to_id) {
        await updateStock(movement.product_id, movement.warehouse_to_id, movement.quantity);
      } else if (movement.type === 'OUT' && movement.warehouse_from_id) {
        await updateStock(movement.product_id, movement.warehouse_from_id, -movement.quantity);
      } else if (movement.type === 'TRANSFER' && movement.warehouse_from_id && movement.warehouse_to_id) {
        await updateStock(movement.product_id, movement.warehouse_from_id, -movement.quantity);
        await updateStock(movement.product_id, movement.warehouse_to_id, movement.quantity);
      } else if (movement.type === 'ADJUST' && movement.warehouse_to_id) {
        // For adjustments, set the absolute quantity
        const { error: adjustError } = await supabase
          .from('stock_balances')
          .upsert(
            { product_id: movement.product_id, warehouse_id: movement.warehouse_to_id, quantity: movement.quantity },
            { onConflict: 'product_id,warehouse_id' }
          );
        if (adjustError) throw adjustError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock_balances'] });
      queryClient.invalidateQueries({ queryKey: ['stock_by_product'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
      toast.success('Movimentação registrada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao registrar movimentação: ' + error.message);
    },
  });
}

async function updateStock(productId: string, warehouseId: string, quantityDelta: number) {
  // Get current stock
  const { data: current } = await supabase
    .from('stock_balances')
    .select('quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .maybeSingle();

  const currentQty = current?.quantity ?? 0;
  const newQty = Math.max(0, currentQty + quantityDelta);

  const { error } = await supabase
    .from('stock_balances')
    .upsert(
      { product_id: productId, warehouse_id: warehouseId, quantity: newQty },
      { onConflict: 'product_id,warehouse_id' }
    );
  
  if (error) throw error;
}
