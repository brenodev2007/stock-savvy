import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Package,
  Warehouse,
  AlertTriangle,
  Settings2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStockBalances, StockBalance } from '@/hooks/useStockBalances';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useProducts } from '@/hooks/useProducts';
import { useCreateMovement } from '@/hooks/useMovements';
import { StockAdjustmentForm } from '@/components/inventory/StockAdjustmentForm';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type SortField = 'product' | 'warehouse' | 'quantity' | 'status';
type SortOrder = 'asc' | 'desc';

export default function Inventory() {
  const { data: stockBalances, isLoading } = useStockBalances();
  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  const createMovement = useCreateMovement();

  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('product');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockBalance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    if (!stockBalances) return [];

    let filtered = stockBalances.filter((item) => {
      const matchesSearch =
        item.product?.name.toLowerCase().includes(search.toLowerCase()) ||
        item.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.warehouse?.name.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === 'all' || item.warehouse_id === warehouseFilter;

      const isLowStock = item.quantity > 0 && item.quantity < (item.product?.min_stock ?? 0);
      const isOutOfStock = item.quantity === 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'low' && isLowStock) ||
        (statusFilter === 'out' && isOutOfStock) ||
        (statusFilter === 'ok' && !isLowStock && !isOutOfStock);

      return matchesSearch && matchesWarehouse && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'product':
          comparison = (a.product?.name ?? '').localeCompare(b.product?.name ?? '');
          break;
        case 'warehouse':
          comparison = (a.warehouse?.name ?? '').localeCompare(b.warehouse?.name ?? '');
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'status':
          const getStatusOrder = (item: StockBalance) => {
            if (item.quantity === 0) return 0;
            if (item.quantity < (item.product?.min_stock ?? 0)) return 1;
            return 2;
          };
          comparison = getStatusOrder(a) - getStatusOrder(b);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [stockBalances, search, warehouseFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil((filteredAndSortedData?.length || 0) / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(start, start + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  const stats = useMemo(() => {
    if (!stockBalances) return { total: 0, lowStock: 0, outOfStock: 0 };
    return {
      total: stockBalances.length,
      lowStock: stockBalances.filter(
        (s) => s.quantity > 0 && s.quantity < (s.product?.min_stock ?? 0)
      ).length,
      outOfStock: stockBalances.filter((s) => s.quantity === 0).length,
    };
  }, [stockBalances]);

  const openAdjustment = (stock: StockBalance) => {
    setSelectedStock(stock);
    setAdjustmentOpen(true);
  };

  const handleAdjustment = async (data: { newQuantity: number; reason: string }) => {
    if (!selectedStock) return;

    await createMovement.mutateAsync({
      product_id: selectedStock.product_id,
      warehouse_to_id: selectedStock.warehouse_id,
      quantity: data.newQuantity,
      type: 'ADJUST',
      reason: data.reason,
      reference: `ADJ-${Date.now()}`,
    });

    setAdjustmentOpen(false);
    setSelectedStock(null);
  };

  const getStockStatus = (item: StockBalance) => {
    if (item.quantity === 0) {
      return { label: 'Sem estoque', color: 'destructive' };
    }
    if (item.quantity < (item.product?.min_stock ?? 0)) {
      return { label: 'Estoque baixo', color: 'warning' };
    }
    return { label: 'OK', color: 'success' };
  };

  if (isLoading) {
    return (
      <AppLayout title="Inventário" subtitle="Controle e ajuste de estoque">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Inventário" subtitle="Controle e ajuste de estoque">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Itens no estoque</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">Estoque baixo</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <Package className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">Sem estoque</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto, SKU ou depósito..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={warehouseFilter} onValueChange={(v) => { setWarehouseFilter(v); resetPage(); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Warehouse className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Depósito" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os depósitos</SelectItem>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); resetPage(); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="out">Sem estoque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">
            Nenhum item encontrado
          </p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou adicione produtos ao estoque.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-center">
                    <button
                      onClick={() => handleSort('product')}
                      className="inline-flex items-center gap-1 hover:text-foreground mx-auto"
                    >
                      Produto
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center">
                    <button
                      onClick={() => handleSort('warehouse')}
                      className="inline-flex items-center gap-1 hover:text-foreground mx-auto"
                    >
                      Depósito
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center">
                    <button
                      onClick={() => handleSort('quantity')}
                      className="inline-flex items-center gap-1 hover:text-foreground mx-auto"
                    >
                      Quantidade
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center">Estoque Mínimo</th>
                  <th className="text-center">
                    <button
                      onClick={() => handleSort('status')}
                      className="inline-flex items-center gap-1 hover:text-foreground mx-auto"
                    >
                      Status
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-center">Valor</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const status = getStockStatus(item);
                  const value = item.quantity * (item.product?.cost ?? 0);
                  return (
                    <tr key={item.id}>
                      <td className="text-center">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-foreground">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.product?.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-muted-foreground">
                        {item.warehouse?.name}
                      </td>
                      <td className="text-center font-medium">
                        {item.quantity} {item.product?.unit}
                      </td>
                      <td className="text-center text-muted-foreground">
                        {item.product?.min_stock} {item.product?.unit}
                      </td>
                      <td className="text-center">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                            status.color === 'success' && 'bg-success/10 text-success border-success/20',
                            status.color === 'warning' && 'bg-warning/10 text-warning border-warning/20',
                            status.color === 'destructive' && 'bg-destructive/10 text-destructive border-destructive/20'
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="text-center font-medium">
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openAdjustment(item)}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {paginatedData.map((item) => {
              const status = getStockStatus(item);
              const value = item.quantity * (item.product?.cost ?? 0);
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.product?.sku}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
                        status.color === 'success' && 'bg-success/10 text-success border-success/20',
                        status.color === 'warning' && 'bg-warning/10 text-warning border-warning/20',
                        status.color === 'destructive' && 'bg-destructive/10 text-destructive border-destructive/20'
                      )}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Depósito</p>
                      <p className="font-medium">{item.warehouse?.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantidade</p>
                      <p className="font-medium">{item.quantity} {item.product?.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mín.</p>
                      <p className="font-medium">{item.product?.min_stock} {item.product?.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-medium">
                        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => openAdjustment(item)}
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Ajustar Estoque
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Mostrando {filteredAndSortedData.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} itens
              </p>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-[80px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </span>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline mr-1">Próximo</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <StockAdjustmentForm
        open={adjustmentOpen}
        onOpenChange={setAdjustmentOpen}
        stockBalance={selectedStock}
        onSubmit={handleAdjustment}
        isLoading={createMovement.isPending}
      />
    </AppLayout>
  );
}
