import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse, Warehouse } from '@/hooks/useWarehouses';
import { useStockBalances } from '@/hooks/useStockBalances';
import { WarehouseForm } from '@/components/warehouses/WarehouseForm';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useCanCreate } from '@/hooks/usePlanLimits';
import { PlanLimitBanner } from '@/components/plans/PlanLimitBanner';
import { toast } from 'sonner';

export default function Warehouses() {
  const { data: warehouses, isLoading } = useWarehouses();
  const { data: stockBalances } = useStockBalances();
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();
  const { canCreate, message: limitMessage, usage: warehouseUsage } = useCanCreate('warehouses');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Warehouse | null>(null);

  const itemsByWarehouse: Record<string, number> = {};
  stockBalances?.forEach((balance) => {
    itemsByWarehouse[balance.warehouse_id] = (itemsByWarehouse[balance.warehouse_id] ?? 0) + balance.quantity;
  });

  const handleSubmit = async (data: any) => {
    if (editingWarehouse) {
      await updateWarehouse.mutateAsync({ id: editingWarehouse.id, ...data });
    } else {
      await createWarehouse.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingWarehouse(null);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteWarehouse.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Depósitos" subtitle="Gerencie locais de armazenamento">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Depósitos" subtitle="Gerencie locais de armazenamento">
      <PlanLimitBanner usage={warehouseUsage} resourceName="depósitos" className="mb-6" />
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{warehouses?.length || 0} depósito(s) cadastrado(s)</p>
        <Button 
          disabled={!canCreate}
          title={limitMessage || undefined}
          onClick={() => { 
            if (!canCreate) {
              toast.error(limitMessage);
              return;
            }
            setEditingWarehouse(null); 
            setFormOpen(true); 
          }} 
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />Novo Depósito
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {warehouses?.map((warehouse, index) => (
          <div key={warehouse.id} className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(warehouse)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(warehouse)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{warehouse.name}</h3>
            {warehouse.address && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />{warehouse.address}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{itemsByWarehouse[warehouse.id] ?? 0} itens</span>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${warehouse.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                {warehouse.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <WarehouseForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingWarehouse(null); }} warehouse={editingWarehouse} onSubmit={handleSubmit} isLoading={createWarehouse.isPending || updateWarehouse.isPending} />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
