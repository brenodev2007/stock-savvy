import { Package, Truck, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ShopeeStatsCardsProps {
  stats: {
    total: number;
    aguardandoEnvio: number;
    enviado: number;
    emTransporte: number;
    entregue: number;
    cancelado: number;
  } | undefined;
  isLoading?: boolean;
}

const statItems = [
  { key: 'total', label: 'Total de Pedidos', icon: ShoppingBag, color: 'text-foreground', bg: 'bg-muted' },
  { key: 'aguardandoEnvio', label: 'Aguardando Envio', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { key: 'enviado', label: 'Enviados', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'emTransporte', label: 'Em Transporte', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
  { key: 'entregue', label: 'Entregues', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { key: 'cancelado', label: 'Cancelados', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
] as const;

export function ShopeeStatsCards({ stats, isLoading }: ShopeeStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <Skeleton key={item.key} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats?.[item.key] ?? 0;

        return (
          <Card key={item.key} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', item.bg)}>
                  <Icon className={cn('h-5 w-5', item.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
