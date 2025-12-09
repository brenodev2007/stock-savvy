import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  expiringCount: number;
  movementsToday: number;
  warehousesCount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get active warehouses
      const { count: warehousesCount } = await supabase
        .from('warehouses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get stock balances with product info
      const { data: stockData } = await supabase
        .from('stock_balances')
        .select(`
          quantity,
          product:products(id, min_stock, cost)
        `);

      // Calculate totals
      let totalValue = 0;
      let lowStockCount = 0;
      const productStocks: Record<string, { quantity: number; minStock: number }> = {};

      stockData?.forEach((balance: any) => {
        if (balance.product) {
          totalValue += balance.quantity * (balance.product.cost || 0);
          
          // Aggregate stock by product
          if (!productStocks[balance.product.id]) {
            productStocks[balance.product.id] = {
              quantity: 0,
              minStock: balance.product.min_stock || 0,
            };
          }
          productStocks[balance.product.id].quantity += balance.quantity;
        }
      });

      // Count low stock products
      Object.values(productStocks).forEach((stock) => {
        if (stock.quantity < stock.minStock) {
          lowStockCount++;
        }
      });

      // Get movements today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: movementsToday } = await supabase
        .from('stock_movements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get expiring lots (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const { count: expiringCount } = await supabase
        .from('product_lots')
        .select('*', { count: 'exact', head: true })
        .lte('expiry_date', thirtyDaysFromNow.toISOString())
        .gte('expiry_date', new Date().toISOString())
        .gt('quantity', 0);

      return {
        totalProducts: totalProducts || 0,
        totalValue,
        lowStockCount,
        expiringCount: expiringCount || 0,
        movementsToday: movementsToday || 0,
        warehousesCount: warehousesCount || 0,
      } as DashboardStats;
    },
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['low_stock_products'],
    queryFn: async () => {
      const { data: stockData } = await supabase
        .from('stock_balances')
        .select(`
          quantity,
          product:products(id, name, sku, min_stock, unit)
        `);

      // Aggregate by product
      const productStocks: Record<string, { 
        product: any; 
        currentStock: number;
      }> = {};

      stockData?.forEach((balance: any) => {
        if (balance.product) {
          if (!productStocks[balance.product.id]) {
            productStocks[balance.product.id] = {
              product: balance.product,
              currentStock: 0,
            };
          }
          productStocks[balance.product.id].currentStock += balance.quantity;
        }
      });

      // Filter low stock
      return Object.values(productStocks)
        .filter((item) => item.currentStock < item.product.min_stock)
        .map((item) => ({
          ...item.product,
          currentStock: item.currentStock,
        }));
    },
  });
}
