import { ArrowDownLeft, ArrowRight, ArrowRightLeft, ArrowUpRight, Pencil } from 'lucide-react';
import { StockMovement, MovementType } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentMovementsProps {
  movements: StockMovement[];
}

const movementIcons: Record<MovementType, typeof ArrowUpRight> = {
  IN: ArrowDownLeft,
  OUT: ArrowUpRight,
  TRANSFER: ArrowRightLeft,
  ADJUST: Pencil,
};

const movementLabels: Record<MovementType, string> = {
  IN: 'Entrada',
  OUT: 'Saída',
  TRANSFER: 'Transferência',
  ADJUST: 'Ajuste',
};

const movementColors: Record<MovementType, string> = {
  IN: 'text-success bg-success/10',
  OUT: 'text-destructive bg-destructive/10',
  TRANSFER: 'text-info bg-info/10',
  ADJUST: 'text-warning bg-warning/10',
};

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Movimentações Recentes</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Ver todas
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {movements.map((movement) => {
          const Icon = movementIcons[movement.type];
          return (
            <div
              key={movement.id}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  movementColors[movement.type]
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      {movement.product?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {movementLabels[movement.type]} • {movement.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold',
                        movement.type === 'IN' && 'text-success',
                        movement.type === 'OUT' && 'text-destructive',
                        movement.type === 'TRANSFER' && 'text-info',
                        movement.type === 'ADJUST' && 'text-warning'
                      )}
                    >
                      {movement.type === 'OUT' ? '-' : '+'}
                      {movement.quantity} un
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(movement.timestamp, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {movements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma movimentação recente.
          </p>
        </div>
      )}
    </div>
  );
}
