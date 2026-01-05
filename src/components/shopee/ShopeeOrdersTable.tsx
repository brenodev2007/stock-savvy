import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShopeeStatusBadge } from './ShopeeStatusBadge';
import { ShopeeOrderDetails } from './ShopeeOrderDetails';
import type { ShopeeOrder } from '@/types/shopee';

interface ShopeeOrdersTableProps {
  orders: ShopeeOrder[];
  isLoading?: boolean;
}

export function ShopeeOrdersTable({ orders, isLoading }: ShopeeOrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Nenhum pedido encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte sua conta Shopee e sincronize seus pedidos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Pedido</TableHead>
                <TableHead className="font-semibold">Produto</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">SKU</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Cliente</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Data</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Transportadora</TableHead>
                <TableHead className="font-semibold hidden xl:table-cell">Rastreio</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Previsão</TableHead>
                <TableHead className="font-semibold text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">{order.order_sn}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={order.product_name}>
                      {order.product_name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {order.sku || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {order.customer_name || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {format(new Date(order.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {order.carrier || '-'}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {order.tracking_code ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{order.tracking_code}</span>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <ShopeeStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {order.estimated_delivery
                      ? format(new Date(order.estimated_delivery), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ShopeeOrderDetails
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
    </>
  );
}
