import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  movementsToday: number;
  warehousesCount: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  unit: string;
  min_stock: number;
  currentStock: number;
  cost: number;
  price: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      // Get products, warehouses, stock, movements
      const [productsRes, warehousesRes, stockRes, movementsRes] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/stock/balances'),
        api.get('/stock/movements')
      ]);

      const products = productsRes.data;
      const warehouses = warehousesRes.data;
      const stockBalances = stockRes.data;
      const movements = movementsRes.data;

      // Calculate stats
      const totalValue = stockBalances.reduce((sum: number, balance: any) => {
        const product = products.find((p: any) => p.id === balance.product_id);
        return sum + (balance.quantity * (product?.cost || 0));
      }, 0);

      // Count low stock
      const productStocks: Record<string, { quantity: number; minStock: number }> = {};
      stockBalances.forEach((balance: any) => {
        const product = products.find((p: any) => p.id === balance.product_id);
        if (product) {
          if (!productStocks[product.id]) {
            productStocks[product.id] = { quantity: 0, minStock: product.min_stock || 0 };
          }
          productStocks[product.id].quantity += balance.quantity;
        }
      });

      const lowStockCount = Object.values(productStocks).filter(
        (stock) => stock.quantity < stock.minStock
      ).length;

      // Count today's movements
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const movementsToday = movements.filter((m: any) => 
        new Date(m.created_at) >= today
      ).length;

      return {
        totalProducts: products.length,
        totalValue,
        lowStockCount,
        movementsToday,
        warehousesCount: warehouses.length,
      } as DashboardStats;
    },
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ['low_stock_products'],
    queryFn: async () => {
      const [productsRes, stockRes] = await Promise.all([
        api.get('/products'),
        api.get('/stock/balances')
      ]);

      const products = productsRes.data;
      const stockBalances = stockRes.data;

      // Aggregate by product
      const productStocks: Record<string, { product: any; currentStock: number }> = {};

      stockBalances.forEach((balance: any) => {
        const product = products.find((p: any) => p.id === balance.product_id);
        if (product) {
          if (!productStocks[product.id]) {
            productStocks[product.id] = { product, currentStock: 0 };
          }
          productStocks[product.id].currentStock += balance.quantity;
        }
      });

      // Filter low stock and return with proper types
      return Object.values(productStocks)
        .filter((item) => item.currentStock < item.product.min_stock)
        .map((item) => ({
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          unit: item.product.unit,
          min_stock: item.product.min_stock,
          cost: item.product.cost,
          price: item.product.price,
          currentStock: item.currentStock,
        } as LowStockProduct));
    },
  });
}
