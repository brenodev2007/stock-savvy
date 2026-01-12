export type ShopeeShipmentStatus = 
  | 'AGUARDANDO_ENVIO'
  | 'EMPACOTADO'
  | 'ETIQUETADO'
  | 'ENVIADO'
  | 'EM_TRANSPORTE'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'DEVOLVIDO';

export interface ShopeeAccount {
  id: string;
  user_id: string;
  shop_id: number;
  shop_name: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShopeeOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface ShopeeOrder {
  id: string;
  account_id: string | null;
  order_sn: string;
  // Legacy field, now optional as items are in sub-table
  product_name?: string;
  sku?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: string;
  purchase_date: string;
  carrier?: string;
  tracking_code?: string;
  tracking_url?: string;
  status: ShopeeShipmentStatus;
  estimated_delivery?: string;
  actual_delivery?: string;
  order_total?: number;
  shopee_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  account?: Partial<ShopeeAccount> | null;
  items?: ShopeeOrderItem[];
  status_history?: ShopeeOrderStatusHistory[];
}

export interface ShopeeOrderStatusHistory {
  id: string;
  order_id: string;
  status: ShopeeShipmentStatus;
  description?: string;
  location?: string;
  occurred_at: string;
  created_at: string;
}

export interface ShopeeOrderEditHistory {
  id: string;
  order_id: string;
  user_id: string;
  changed_at: string;
  changes: Record<string, unknown>;
  previous_values: Record<string, unknown>;
}

export interface ShopeeSyncLog {
  id: string;
  account_id: string;
  sync_type: 'orders' | 'tracking' | 'full';
  status: 'success' | 'error' | 'in_progress';
  orders_synced: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export const SHIPMENT_STATUS_CONFIG: Record<ShopeeShipmentStatus, { label: string; color: string; bgColor: string }> = {
  AGUARDANDO_ENVIO: { label: 'Aguardando Envio', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  EMPACOTADO: { label: 'Empacotado', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  ETIQUETADO: { label: 'Etiquetado', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  ENVIADO: { label: 'Enviado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  EM_TRANSPORTE: { label: 'Em Transporte', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  ENTREGUE: { label: 'Entregue', color: 'text-green-700', bgColor: 'bg-green-100' },
  CANCELADO: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
  DEVOLVIDO: { label: 'Devolvido', color: 'text-red-700', bgColor: 'bg-red-100' },
};
