import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { RecentMovements } from '@/components/dashboard/RecentMovements';
import {
  Package,
  DollarSign,
  AlertTriangle,
  ArrowLeftRight,
  Warehouse,
  Calendar,
} from 'lucide-react';
import {
  mockDashboardStats,
  mockMovements,
  getLowStockProducts,
} from '@/data/mockData';

export default function Dashboard() {
  const stats = mockDashboardStats;
  const lowStockProducts = getLowStockProducts();
  const recentMovements = mockMovements;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral do estoque">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total de Produtos"
          value={stats.totalProducts}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Valor em Estoque"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Estoque Baixo"
          value={stats.lowStockCount}
          subtitle="itens abaixo do mínimo"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Vencendo"
          value={stats.expiringCount}
          subtitle="próximos 30 dias"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Movimentações Hoje"
          value={stats.movementsToday}
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Depósitos Ativos"
          value={stats.warehousesCount}
          icon={Warehouse}
        />
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LowStockAlert products={lowStockProducts} />
        <RecentMovements movements={recentMovements} />
      </div>
    </AppLayout>
  );
}
