import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { RecentMovements } from '@/components/dashboard/RecentMovements';
import { Package, DollarSign, AlertTriangle, ArrowLeftRight, Warehouse } from 'lucide-react';
import { useDashboardStats, useLowStockProducts } from '@/hooks/useDashboard';
import { useMovements } from '@/hooks/useMovements';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: lowStockProducts } = useLowStockProducts();
  const { data: recentMovements } = useMovements(5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  if (statsLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Visão geral do estoque">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      </AppLayout>
    );
  }

  // Transform data for components
  const lowStockFormatted = lowStockProducts?.map((p) => ({
    id: p.id, name: p.name, sku: p.sku, unit: p.unit, minStock: p.min_stock, currentStock: p.currentStock,
    createdAt: new Date(), updatedAt: new Date(), cost: 0, price: 0,
  })) || [];

  const movementsFormatted = recentMovements?.map((m) => ({
    id: m.id, productId: m.product_id, quantity: m.quantity, type: m.type,
    userId: m.user_id, reason: m.reason, reference: m.reference,
    timestamp: new Date(m.created_at),
    product: m.product ? { id: m.product.id, sku: m.product.sku, name: m.product.name, unit: 'un', cost: 0, price: 0, minStock: 0, createdAt: new Date(), updatedAt: new Date() } : undefined,
  })) || [];

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do estoque">
      <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total de Produtos" value={stats?.totalProducts || 0} icon={Package} />
        <StatCard title="Total em Dinheiro" value={formatCurrency(stats?.totalValue || 0)} icon={DollarSign} variant="primary" />
        <StatCard title="Estoque Baixo" value={stats?.lowStockCount || 0} subtitle="itens abaixo do mínimo" icon={AlertTriangle} variant="warning" />
        <StatCard title="Mudanças Hoje" value={stats?.movementsToday || 0} icon={ArrowLeftRight} />
        <StatCard title="Locais" value={stats?.warehousesCount || 0} icon={Warehouse} />
      </div>

      <div className="mt-4 md:mt-6 grid gap-4 md:gap-6 lg:grid-cols-2">
        <LowStockAlert products={lowStockFormatted} />
        <RecentMovements movements={movementsFormatted} />
      </div>
    </AppLayout>
  );
}
