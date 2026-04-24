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
import { OrdersTable } from '@/components/orders/OrdersTable';
import { OrderFilters, type OrderFiltersState } from '@/components/orders/OrderFilters';
import { OrderStatsCards } from '@/components/orders/OrderStatsCards';

import { ShopeeSyncStatus as OrderSyncStatus } from '@/components/orders/OrderSyncStatus';
import { ShopeeOrderForm as OrderForm } from '@/components/orders/OrderForm';
import { useShopeeOrders as useOrders, useShopeeOrderStats as useOrderStats, useDeleteMultipleShopeeOrders as useDeleteMultipleOrders } from '@/hooks/useShopee';
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

export default function Sales() {
  const [filters, setFilters] = useState<OrderFiltersState>({
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

  const { data: orders, isLoading: ordersLoading } = useOrders({
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    carrier: filters.carrier,
    search: filters.search,
  });

  const { data: stats, isLoading: statsLoading } = useOrderStats();
  const deleteMultiple = useDeleteMultipleOrders();

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

  const handleFiltersChange = (newFilters: OrderFiltersState) => {
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
          <Card className="bg-primary/5 border-primary/20 shadow-sm hover:shadow-md transition-all">
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
          <Card className="bg-rose-50 border-rose-100 dark:bg-rose-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-rose-100 rounded-lg">
                <Clock className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-rose-600 uppercase font-bold tracking-wider">Atrasados</p>
                <h3 className="text-2xl font-black">{stats?.atrasados || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950/20 shadow-sm hover:shadow-md transition-all">
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
          <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 shadow-sm hover:shadow-md transition-all">
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
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="orders" className="gap-2 px-4 rounded-lg data-[state=active]:shadow-sm"><ShoppingCart className="h-4 w-4" /> Meus Pedidos</TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2 px-4 rounded-lg data-[state=active]:shadow-sm"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none rounded-lg">
                <Download className="h-4 w-4" /> Exportar CSV
              </Button>
              <Button size="sm" onClick={() => setIsFormOpen(true)} className="gap-2 flex-1 md:flex-none bg-primary hover:opacity-90 shadow-lg shadow-primary/20 rounded-lg">
                <Plus className="h-4 w-4" /> Novo Pedido
              </Button>
            </div>
          </div>

          <TabsContent value="orders" className="space-y-6 animate-in fade-in duration-500 outline-none">
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 font-bold">
                    <Filter className="h-4 w-4 text-primary" /> Filtros de Pesquisa
                  </CardTitle>
                  {selectedIds.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)} className="h-8 rounded-lg animate-in zoom-in duration-200">
                      Excluir {selectedIds.length} selecionados
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4 border-b bg-background/50">
                  <OrderFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    carriers={carriers}
                  />
                </div>
                
                <OrdersTable 
                  orders={paginatedOrders} 
                  isLoading={ordersLoading}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />

                <div className="p-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t">
                   <p className="text-xs text-muted-foreground font-medium">
                    Mostrando <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> a <strong>{Math.min(currentPage * ITEMS_PER_PAGE, orders?.length || 0)}</strong> de <strong>{orders?.length || 0}</strong> pedidos
                  </p>
                  
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={cn("rounded-lg", currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted')}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={cn("rounded-lg", currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-muted')}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed outline-none">
            <BarChart3 className="h-16 w-16 text-muted-foreground opacity-20" />
            <div>
                <h3 className="text-lg font-bold">Relatórios Detalhados</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Acesse a aba de Relatórios para uma visão completa de performance por produto e lucratividade.
                </p>
            </div>
            <Button variant="outline" className="rounded-lg" onClick={() => window.location.href='/reports'}>Ver Relatórios</Button>
          </TabsContent>
        </Tabs>

        <OrderForm open={isFormOpen} onOpenChange={setIsFormOpen} />

        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Excluir pedidos selecionados</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{selectedIds.length}</strong> pedido(s)? 
                Esta ação não pode ser desfeita e afetará seu estoque.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              >
                Excluir {selectedIds.length} pedido(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Resumo Omnichannel no final da página */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Visão Geral Omnichannel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-muted/30 border-none shadow-sm hover:shadow-md transition-all rounded-2xl group">
              <CardContent className="p-8 text-center">
                <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-bold text-lg">Integrações Universais</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Conecte Amazon, Mercado Livre, Shopify e Nuvemshop de forma centralizada.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-sm hover:shadow-md transition-all rounded-2xl group">
              <CardContent className="p-8 text-center">
                <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <PackageCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-bold text-lg">Estoque Centralizado</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Venda em qualquer canal e tenha a baixa automática em todo o seu ecossistema.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-sm hover:shadow-md transition-all rounded-2xl group">
              <CardContent className="p-8 text-center">
                <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-bold text-lg">Analytics Global</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Identifique qual plataforma gera mais lucro e otimize seu investimento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
