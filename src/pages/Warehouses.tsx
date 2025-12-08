import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { mockWarehouses, mockStockBalances } from '@/data/mockData';
import { Building2, MapPin, Package, Plus } from 'lucide-react';

export default function Warehouses() {
  // Calculate total items per warehouse
  const itemsByWarehouse: Record<string, number> = {};
  mockStockBalances.forEach((balance) => {
    itemsByWarehouse[balance.warehouseId] =
      (itemsByWarehouse[balance.warehouseId] ?? 0) + balance.quantity;
  });

  return (
    <AppLayout title="Depósitos" subtitle="Gerencie locais de armazenamento">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {mockWarehouses.length} depósito(s) cadastrado(s)
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Depósito
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockWarehouses.map((warehouse, index) => (
          <div
            key={warehouse.id}
            className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  warehouse.isActive
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {warehouse.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {warehouse.name}
            </h3>

            {warehouse.address && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {warehouse.address}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {itemsByWarehouse[warehouse.id] ?? 0} itens em estoque
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
