import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ClipboardList, History } from 'lucide-react';

export default function Inventory() {
  return (
    <AppLayout title="Inventário" subtitle="Contagem e conciliação de estoque">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
          <ClipboardList className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Controle de Inventário
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Realize contagens cíclicas ou inventários completos,
          registre divergências e mantenha seu estoque sempre atualizado.
        </p>
        <div className="flex gap-3">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Nova Contagem
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
