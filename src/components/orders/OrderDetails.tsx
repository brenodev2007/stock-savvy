import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, MapPin, Phone, User, Truck, Package, Calendar } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShopeeStatusBadge } from './ShopeeStatusBadge';
import { useShopeeOrder } from '@/hooks/useShopee';
import { SHIPMENT_STATUS_CONFIG, type ShopeeShipmentStatus } from '@/types/shopee';
import { cn } from '@/lib/utils';

interface ShopeeOrderDetailsProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOrder: ShopeeShipmentStatus[] = [
  'AGUARDANDO_ENVIO',
  'ENVIADO',
  'EM_TRANSPORTE',
  'ENTREGUE',
];

export function ShopeeOrderDetails({ orderId, open, onOpenChange }: ShopeeOrderDetailsProps) {
  const { data: order, isLoading } = useShopeeOrder(orderId || '');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Pedido</SheetTitle>
          <SheetDescription>
            {order ? `Pedido #${order.order_sn}` : 'Carregando...'}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : order ? (
          <div className="mt-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <ShopeeStatusBadge status={order.status} className="text-sm" />
              {order.tracking_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Rastrear
                  </a>
                </Button>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-4">Linha do Tempo</h4>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />
                {order.status !== 'CANCELADO' && order.status !== 'DEVOLVIDO' ? (
                  statusOrder.map((status, index) => {
                    const isCompleted = statusOrder.indexOf(order.status) >= index;
                    const isCurrent = order.status === status;
                    const config = SHIPMENT_STATUS_CONFIG[status];
                    
                    const historyItem = order.status_history?.find(h => h.status === status);
                    
                    return (
                      <div key={status} className="relative flex items-start gap-4 pb-4 last:pb-0">
                        <div
                          className={cn(
                            'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2',
                            isCompleted
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted bg-background'
                          )}
                        >
                          {isCompleted && (
                            <div className="h-2 w-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium text-sm',
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          )}>
                            {config.label}
                          </p>
                          {historyItem && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(historyItem.occurred_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              {historyItem.location && ` • ${historyItem.location}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-destructive">
                        {SHIPMENT_STATUS_CONFIG[order.status].label}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-3">Produto</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{order.product_name}</span>
                </div>
                {order.sku && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>SKU: {order.sku}</span>
                  </div>
                )}
                {order.order_total && (
                  <div className="text-sm font-medium text-primary mt-2">
                    R$ {order.order_total.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-3">Cliente</h4>
              <div className="space-y-2">
                {order.customer_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.customer_name}
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.customer_phone}
                  </div>
                )}
                {order.shipping_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{order.shipping_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-medium mb-3">Envio</h4>
              <div className="space-y-2">
                {order.carrier && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    {order.carrier}
                  </div>
                )}
                {order.tracking_code && (
                  <div className="flex items-center gap-2 text-sm">
                    Rastreio: {order.tracking_code}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Compra: {format(new Date(order.purchase_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </div>
                {order.estimated_delivery && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Previsão: {format(new Date(order.estimated_delivery), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
                {order.actual_delivery && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Calendar className="h-4 w-4" />
                    Entregue: {format(new Date(order.actual_delivery), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                )}
              </div>
            </div>

            {/* Last update */}
            <p className="text-xs text-muted-foreground text-center">
              Última atualização: {format(new Date(order.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center text-muted-foreground">
            Pedido não encontrado
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
