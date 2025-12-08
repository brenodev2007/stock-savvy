import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Plus } from 'lucide-react';

export default function Movements() {
  return (
    <AppLayout title="Movimentações" subtitle="Registre entradas, saídas e transferências">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <ArrowDownLeft className="h-8 w-8 text-success" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <ArrowUpRight className="h-8 w-8 text-destructive" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-info/10">
            <ArrowRightLeft className="h-8 w-8 text-info" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Movimentações de Estoque
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Registre entradas de mercadorias, saídas por vendas ou consumo,
          e transferências entre depósitos.
        </p>
        <div className="flex gap-3">
          <Button variant="outline">
            <ArrowDownLeft className="mr-2 h-4 w-4" />
            Nova Entrada
          </Button>
          <Button variant="outline">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Nova Saída
          </Button>
          <Button>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transferência
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
