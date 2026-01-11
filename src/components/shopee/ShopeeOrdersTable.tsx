import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Eye, ExternalLink, Pencil, Trash2, History } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ShopeeStatusBadge } from './ShopeeStatusBadge';
import { ShopeeOrderDetails } from './ShopeeOrderDetails';
import { ShopeeOrderForm } from './ShopeeOrderForm';
import { ShopeeOrderEditHistory } from './ShopeeOrderEditHistory';
import { useDeleteShopeeOrder } from '@/hooks/useShopee';
import type { ShopeeOrder } from '@/types/shopee';

interface ShopeeOrdersTableProps {
  orders: ShopeeOrder[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function ShopeeOrdersTable({ orders, isLoading, selectedIds = [], onSelectionChange }: ShopeeOrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<ShopeeOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<ShopeeOrder | null>(null);
  const [historyOrder, setHistoryOrder] = useState<ShopeeOrder | null>(null);
  const deleteOrder = useDeleteShopeeOrder();

  const handleDeleteConfirm = () => {
    if (deletingOrder) {
      deleteOrder.mutate(deletingOrder.id, {
        onSettled: () => setDeletingOrder(null),
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? orders.map(o => o.id) : []);
    }
  };

  const handleSelectOne = (orderId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, orderId]);
      } else {
        onSelectionChange(selectedIds.filter(id => id !== orderId));
      }
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < orders.length;

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
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                </TableHead>
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
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOne(order.id, !!checked)}
                      aria-label={`Selecionar pedido ${order.order_sn}`}
                    />
                  </TableCell>
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
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHistoryOrder(order)}
                        title="Histórico de edições"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOrder(order)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingOrder(order)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      <ShopeeOrderForm
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />

      <ShopeeOrderEditHistory
        orderId={historyOrder?.id || null}
        orderSn={historyOrder?.order_sn}
        open={!!historyOrder}
        onOpenChange={(open) => !open && setHistoryOrder(null)}
      />

      <AlertDialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido <strong>{deletingOrder?.order_sn}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteOrder.isPending}
            >
              {deleteOrder.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
