import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ShopeeOrdersTable } from '@/components/shopee/ShopeeOrdersTable';
import { ShopeeFilters, type ShopeeFiltersState } from '@/components/shopee/ShopeeFilters';
import { ShopeeStatsCards } from '@/components/shopee/ShopeeStatsCards';
import { ShopeeAccountsManager } from '@/components/shopee/ShopeeAccountsManager';
import { ShopeeSyncStatus } from '@/components/shopee/ShopeeSyncStatus';
import { ShopeeOrderForm } from '@/components/shopee/ShopeeOrderForm';
import { useShopeeOrders, useShopeeOrderStats, useDeleteMultipleShopeeOrders } from '@/hooks/useShopee';


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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function ShopeeShipments() {
  
  const [filters, setFilters] = useState<ShopeeFiltersState>({
    search: '',
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    carrier: undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { data: orders, isLoading: ordersLoading } = useShopeeOrders({
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    carrier: filters.carrier,
    search: filters.search,
  });

  const { data: stats, isLoading: statsLoading } = useShopeeOrderStats();
  const deleteMultiple = useDeleteMultipleShopeeOrders();
  // Get unique carriers for filter
  const carriers = useMemo(() => {
    if (!orders) return [];
    const unique = [...new Set(orders.map(o => o.carrier).filter(Boolean))] as string[];
    return unique.sort();
  }, [orders]);

  // Pagination
  const totalPages = Math.ceil((orders?.length || 0) / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    if (!orders) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: ShopeeFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleBulkDeleteConfirm = () => {
    deleteMultiple.mutate(selectedIds, {
      onSettled: () => {
        setShowBulkDeleteDialog(false);
        setSelectedIds([]);
      },
    });
  };


  return (
    <AppLayout
      title="Envios Shopee"
      subtitle="Controle e acompanhamento de pedidos da Shopee"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <ShopeeStatsCards stats={stats} isLoading={statsLoading} />

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="sync">Sincronização</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Pedido Manual
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir {selectedIds.length} selecionado(s)
                </Button>
              )}
            </div>
            <ShopeeOrderForm
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
            />
            <ShopeeFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              carriers={carriers}
            />

            {/* Orders Table */}
            <ShopeeOrdersTable 
              orders={paginatedOrders} 
              isLoading={ordersLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Results count */}
            {orders && orders.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} de {orders.length} pedidos
              </p>
            )}
          </TabsContent>

          <TabsContent value="accounts">
            <ShopeeAccountsManager />
          </TabsContent>

          <TabsContent value="sync">
            <ShopeeSyncStatus />
          </TabsContent>
        </Tabs>

        {/* Bulk Delete Dialog */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pedidos selecionados</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{selectedIds.length}</strong> pedido(s)? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMultiple.isPending}
              >
                {deleteMultiple.isPending ? 'Excluindo...' : `Excluir ${selectedIds.length} pedido(s)`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
