import { Package, Truck, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OrderStatsCardsProps {
  stats: {
    total: number;
    aguardandoEnvio: number;
    enviado: number;
    emTransito: number;
    entregue: number;
    cancelado: number;
    atrasados?: number;
  } | undefined;
  isLoading?: boolean;
}

const statItems = [
  { key: 'total', label: 'Total Pedidos', icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
  { key: 'aguardandoEnvio', label: 'Pendentes', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  { key: 'enviado', label: 'Enviados', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'emTransito', label: 'Em Trânsito', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { key: 'entregue', label: 'Entregues', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { key: 'cancelado', label: 'Cancelados', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
] as const;

export function OrderStatsCards({ stats, isLoading }: OrderStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <Skeleton key={item.key} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats?.[item.key as keyof typeof stats] ?? 0;

        return (
          <Card key={item.key} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white dark:bg-zinc-900">
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className={cn('rounded-xl p-3', item.bg)}>
                  <Icon className={cn('h-6 w-6', item.color)} />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
