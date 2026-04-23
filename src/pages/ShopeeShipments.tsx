import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  Store, 
  Truck, 
  PackageCheck, 
  Clock, 
  AlertCircle,
  BarChart3,
  Filter,
  Download,
  MoreVertical,
  Zap,
  ShoppingCart,
  LineChart
} from 'lucide-react';
import { ShopeeOrdersTable } from '@/components/shopee/ShopeeOrdersTable';
import { ShopeeFilters, type ShopeeFiltersState } from '@/components/shopee/ShopeeFilters';
import { ShopeeStatsCards } from '@/components/shopee/ShopeeStatsCards';

import { ShopeeSyncStatus } from '@/components/shopee/ShopeeSyncStatus';
import { ShopeeOrderForm } from '@/components/shopee/ShopeeOrderForm';
import { useShopeeOrders, useShopeeOrderStats, useDeleteMultipleShopeeOrders } from '@/hooks/useShopee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  const carriers = useMemo(() => {
    if (!orders) return [];
    const unique = [...new Set(orders.map(o => o.carrier).filter(Boolean))] as string[];
    return unique.sort();
  }, [orders]);

  const totalPages = Math.ceil((orders?.length || 0) / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    if (!orders) return [];
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

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
    <AppLayout title="Gestão de Vendas E-commerce" subtitle="Central de comando universal para pedidos de qualquer plataforma">
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Banner de Status Operacional */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <PackageCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">A Enviar</p>
                <h3 className="text-2xl font-black">{stats?.aguardandoEnvio || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">Atrasados</p>
                <h3 className="text-2xl font-black">{stats?.atrasados || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">Em Trânsito</p>
                <h3 className="text-2xl font-black">{stats?.emTransito || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Finalizados</p>
                <h3 className="text-2xl font-black">{stats?.entregue || 0}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="orders" className="gap-2"><ShoppingCart className="h-4 w-4" /> Meus Pedidos</TabsTrigger>

              <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <Button size="sm" onClick={() => setIsFormOpen(true)} className="gap-2 flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/20">
                <Plus className="h-4 w-4" /> Novo Pedido
              </Button>
            </div>
          </div>

          <TabsContent value="orders" className="space-y-6 animate-in fade-in duration-500">


            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filtros Avançados
                  </CardTitle>
                  {selectedIds.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)} className="h-8">
                      Excluir {selectedIds.length} selecionados
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <ShopeeFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    carriers={carriers}
                  />
                </div>
                
                <ShopeeOrdersTable 
                  orders={paginatedOrders} 
                  isLoading={ordersLoading}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />

                <div className="p-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
                   <p className="text-xs text-muted-foreground">
                    Mostrando <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> a <strong>{Math.min(currentPage * ITEMS_PER_PAGE, orders?.length || 0)}</strong> de <strong>{orders?.length || 0}</strong> pedidos
                  </p>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value="analytics" className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-xl border-2 border-dashed">
            <BarChart3 className="h-16 w-16 text-muted-foreground opacity-20" />
            <div>
                <h3 className="text-lg font-bold">Relatórios Detalhados</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Acesse a aba de Relatórios para uma visão completa de performance por produto e lucratividade.
                </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href='/reports'}>Ver Relatórios</Button>
          </TabsContent>
        </Tabs>

        <ShopeeOrderForm open={isFormOpen} onOpenChange={setIsFormOpen} />

        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pedidos selecionados</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{selectedIds.length}</strong> pedido(s)? 
                Esta ação não pode ser desfeita e afetará seu estoque.
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

        {/* Resumo Omnichannel no final da página */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Visão Geral Omnichannel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <Store className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-semibold">Integrações Universais</p>
                <p className="text-sm text-muted-foreground mt-1">Conecte Amazon, Mercado Livre, Shopify e Nuvemshop.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <PackageCheck className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-semibold">Estoque Centralizado</p>
                <p className="text-sm text-muted-foreground mt-1">Vendeu em um canal, baixou em todos os outros automaticamente.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 text-center">
                <LineChart className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="font-semibold">Analytics Global</p>
                <p className="text-sm text-muted-foreground mt-1">Veja qual plataforma traz mais faturamento para o seu negócio.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
