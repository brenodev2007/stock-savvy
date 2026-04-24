import { useState } from 'react';
import { format, isValid } from 'date-fns';
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
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderDetails } from './OrderDetails';
import { OrderForm } from './OrderForm';
import { OrderEditHistory } from './OrderEditHistory';
import { useDeleteOrder } from '@/hooks/useOrders';
import type { Order } from '@/types/orders';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

function formatDateSafe(dateString: string | null | undefined) {
  if (!dateString) return '-';
  try {
    if (dateString.includes('T')) {
      const date = new Date(dateString);
      if (!isValid(date)) return '-';
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    }
    const date = new Date(dateString + 'T12:00:00');
    if (!isValid(date)) {
      const fallbackDate = new Date(dateString);
      if (!isValid(fallbackDate)) return '-';
      return format(fallbackDate, 'dd/MM/yyyy', { locale: ptBR });
    }
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
}

export function OrdersTable({ orders, isLoading, selectedIds = [], onSelectionChange }: OrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);
  const deleteOrder = useDeleteOrder();

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
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
        <div className="rounded-2xl bg-muted/50 p-6 mb-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-30" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Nenhum pedido encontrado</h3>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
          Comece cadastrando um novo pedido manualmente para gerenciar suas vendas.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl" onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-none hover:bg-muted/30">
                <TableHead className="w-12 py-5 pl-6">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    className={cn("rounded-md", isSomeSelected ? 'bg-primary/50 border-primary/50' : '')}
                  />
                </TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5">Identificador</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5">Produto Principal</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5 hidden md:table-cell">SKU</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5 hidden lg:table-cell">Cliente</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5 hidden md:table-cell text-center">Data</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5 text-center">Status</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider py-5 text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="group hover:bg-muted/20 border-b border-muted/20 transition-colors">
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onCheckedChange={(checked) => handleSelectOne(order.id, !!checked)}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">{order.order_sn}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate font-medium text-sm" title={order.product_name}>
                      {order.product_name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs font-mono">
                    {order.sku || '-'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {order.customer_name || '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-xs text-center">
                    {formatDateSafe(order.purchase_date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        onClick={() => setEditingOrder(order)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-all"
                        onClick={() => setDeletingOrder(order)}
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

      <OrderDetails
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />

      <OrderForm
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />

      <OrderEditHistory
        orderId={historyOrder?.id || null}
        orderSn={historyOrder?.order_sn}
        open={!!historyOrder}
        onOpenChange={(open) => !open && setHistoryOrder(null)}
      />

      <AlertDialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Excluir pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pedido <strong>{deletingOrder?.order_sn}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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

import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
