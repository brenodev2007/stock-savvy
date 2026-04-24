import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopeeOrderEditHistory } from '@/hooks/useShopee';

interface ShopeeOrderEditHistoryProps {
  orderId: string | null;
  orderSn?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FIELD_LABELS: Record<string, string> = {
  order_sn: 'Número do Pedido',
  product_name: 'Produto',
  sku: 'SKU',
  customer_name: 'Cliente',
  shipping_address: 'Endereço',
  order_total: 'Valor Total',
  status: 'Status',
  carrier: 'Transportadora',
  tracking_code: 'Código de Rastreio',
  purchase_date: 'Data do Pedido',
  estimated_delivery: 'Previsão de Entrega',
};

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO_ENVIO: 'Aguardando Envio',
  ENVIADO: 'Enviado',
  EM_TRANSPORTE: 'Em Transporte',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
  DEVOLVIDO: 'Devolvido',
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  
  if (key === 'status' && typeof value === 'string') {
    return STATUS_LABELS[value] || value;
  }
  
  if (key === 'order_total' && typeof value === 'number') {
    return `R$ ${value.toFixed(2)}`;
  }
  
  if ((key === 'purchase_date' || key === 'estimated_delivery') && typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isValid(date)) return value;
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return value;
    }
  }
  
  return String(value);
}

function formatDateSafe(dateString: string) {
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return 'Data desconhecida';
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

export function ShopeeOrderEditHistory({ orderId, orderSn, open, onOpenChange }: ShopeeOrderEditHistoryProps) {
  const { data: history, isLoading } = useShopeeOrderEditHistory(orderId || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Edições {orderSn && <span className="text-muted-foreground font-mono">- {orderSn}</span>}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Nenhuma edição registrada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                As alterações futuras serão exibidas aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Editado em {formatDateSafe(entry.changed_at)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(entry.changes).map(([key, newValue]) => {
                      const oldValue = entry.previous_values[key];
                      const fieldLabel = FIELD_LABELS[key] || key;
                      
                      return (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-muted-foreground min-w-[140px]">
                            {fieldLabel}:
                          </span>
                          <span className="text-muted-foreground line-through">
                            {formatValue(key, oldValue)}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground font-medium">
                            {formatValue(key, newValue)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
