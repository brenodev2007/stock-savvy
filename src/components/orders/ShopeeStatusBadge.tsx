import { cn } from '@/lib/utils';
import { SHIPMENT_STATUS_CONFIG, type ShopeeShipmentStatus } from '@/types/shopee';
import { Package, Truck, CheckCircle, XCircle, Clock, RotateCcw, Box, Tag } from 'lucide-react';

interface ShopeeStatusBadgeProps {
  status: ShopeeShipmentStatus;
  className?: string;
}

const statusIcons: Record<ShopeeShipmentStatus, React.ReactNode> = {
  AGUARDANDO_ENVIO: <Clock className="h-3 w-3" />,
  EMPACOTADO: <Box className="h-3 w-3" />,
  ETIQUETADO: <Tag className="h-3 w-3" />,
  ENVIADO: <Package className="h-3 w-3" />,
  EM_TRANSPORTE: <Truck className="h-3 w-3" />,
  ENTREGUE: <CheckCircle className="h-3 w-3" />,
  CANCELADO: <XCircle className="h-3 w-3" />,
  DEVOLVIDO: <RotateCcw className="h-3 w-3" />,
};

export function ShopeeStatusBadge({ status, className }: ShopeeStatusBadgeProps) {
  const config = SHIPMENT_STATUS_CONFIG[status];
  
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight shadow-sm',
        config.bgColor,
        config.color,
        className
      )}
    >
      {statusIcons[status]}
      {config.label}
    </span>
  );
}
