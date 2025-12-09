import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMovements, useCreateMovement, MovementType } from '@/hooks/useMovements';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import { MovementForm } from '@/components/movements/MovementForm';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeConfig = {
  IN: { label: 'Entrada', icon: ArrowDownLeft, color: 'text-success bg-success/10' },
  OUT: { label: 'Saída', icon: ArrowUpRight, color: 'text-destructive bg-destructive/10' },
  TRANSFER: { label: 'Transferência', icon: ArrowRightLeft, color: 'text-info bg-info/10' },
  ADJUST: { label: 'Ajuste', icon: ArrowRightLeft, color: 'text-warning bg-warning/10' },
};

export default function Movements() {
  const { data: movements, isLoading } = useMovements();
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const createMovement = useCreateMovement();

  const [formOpen, setFormOpen] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [search, setSearch] = useState('');

  const openForm = (type: MovementType) => {
    setMovementType(type);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    await createMovement.mutateAsync(data);
    setFormOpen(false);
  };

  const filteredMovements = movements?.filter((m) =>
    m.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    m.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
    m.reference?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout title="Movimentações" subtitle="Registre entradas, saídas e transferências">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Movimentações" subtitle="Registre entradas, saídas e transferências">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por produto ou referência..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openForm('IN')}><ArrowDownLeft className="mr-2 h-4 w-4 text-success" />Entrada</Button>
          <Button variant="outline" onClick={() => openForm('OUT')}><ArrowUpRight className="mr-2 h-4 w-4 text-destructive" />Saída</Button>
          <Button onClick={() => openForm('TRANSFER')}><ArrowRightLeft className="mr-2 h-4 w-4" />Transferência</Button>
        </div>
      </div>

      {filteredMovements?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowRightLeft className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">Nenhuma movimentação encontrada</p>
          <p className="text-sm text-muted-foreground">Registre sua primeira movimentação acima.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Produto</th>
                <th>Origem</th>
                <th>Destino</th>
                <th className="text-right">Qtd</th>
                <th>Referência</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements?.map((movement) => {
                const config = typeConfig[movement.type];
                const Icon = config.icon;
                return (
                  <tr key={movement.id}>
                    <td>
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
                        <Icon className="h-3 w-3" />{config.label}
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{movement.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{movement.warehouse_from?.name || '-'}</td>
                    <td className="text-muted-foreground">{movement.warehouse_to?.name || '-'}</td>
                    <td className="text-right font-medium">{movement.quantity}</td>
                    <td><code className="rounded bg-muted px-1.5 py-0.5 text-xs">{movement.reference || '-'}</code></td>
                    <td className="text-muted-foreground text-sm">{format(new Date(movement.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <MovementForm open={formOpen} onOpenChange={setFormOpen} type={movementType} products={products || []} warehouses={warehouses || []} onSubmit={handleSubmit} isLoading={createMovement.isPending} />
    </AppLayout>
  );
}
