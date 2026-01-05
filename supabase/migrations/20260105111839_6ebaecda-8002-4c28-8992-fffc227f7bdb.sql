-- Create enum for shipment status
CREATE TYPE shopee_shipment_status AS ENUM (
  'AGUARDANDO_ENVIO',
  'ENVIADO', 
  'EM_TRANSPORTE',
  'ENTREGUE',
  'CANCELADO',
  'DEVOLVIDO'
);

-- Table for Shopee accounts (multi-account support)
CREATE TABLE public.shopee_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_id BIGINT NOT NULL,
  shop_name TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id)
);

-- Table for Shopee orders
CREATE TABLE public.shopee_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.shopee_accounts(id) ON DELETE CASCADE,
  order_sn TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  shipping_address TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  carrier TEXT,
  tracking_code TEXT,
  tracking_url TEXT,
  status shopee_shipment_status NOT NULL DEFAULT 'AGUARDANDO_ENVIO',
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  order_total DECIMAL(10,2),
  shopee_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_sn)
);

-- Table for order status history
CREATE TABLE public.shopee_order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.shopee_orders(id) ON DELETE CASCADE,
  status shopee_shipment_status NOT NULL,
  description TEXT,
  location TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for sync logs
CREATE TABLE public.shopee_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES public.shopee_accounts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'orders', 'tracking', 'full'
  status TEXT NOT NULL, -- 'success', 'error', 'in_progress'
  orders_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.shopee_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopee_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopee_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopee_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopee_accounts
CREATE POLICY "Users can view their own Shopee accounts" 
ON public.shopee_accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Shopee accounts" 
ON public.shopee_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Shopee accounts" 
ON public.shopee_accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Shopee accounts" 
ON public.shopee_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shopee_orders (through account ownership)
CREATE POLICY "Users can view orders from their accounts" 
ON public.shopee_orders FOR SELECT 
USING (account_id IN (SELECT id FROM public.shopee_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert orders for their accounts" 
ON public.shopee_orders FOR INSERT 
WITH CHECK (account_id IN (SELECT id FROM public.shopee_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can update orders from their accounts" 
ON public.shopee_orders FOR UPDATE 
USING (account_id IN (SELECT id FROM public.shopee_accounts WHERE user_id = auth.uid()));

-- RLS Policies for status history
CREATE POLICY "Users can view status history from their orders" 
ON public.shopee_order_status_history FOR SELECT 
USING (order_id IN (
  SELECT o.id FROM public.shopee_orders o 
  JOIN public.shopee_accounts a ON o.account_id = a.id 
  WHERE a.user_id = auth.uid()
));

CREATE POLICY "Users can insert status history for their orders" 
ON public.shopee_order_status_history FOR INSERT 
WITH CHECK (order_id IN (
  SELECT o.id FROM public.shopee_orders o 
  JOIN public.shopee_accounts a ON o.account_id = a.id 
  WHERE a.user_id = auth.uid()
));

-- RLS Policies for sync logs
CREATE POLICY "Users can view sync logs from their accounts" 
ON public.shopee_sync_logs FOR SELECT 
USING (account_id IN (SELECT id FROM public.shopee_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert sync logs for their accounts" 
ON public.shopee_sync_logs FOR INSERT 
WITH CHECK (account_id IN (SELECT id FROM public.shopee_accounts WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_shopee_orders_account ON public.shopee_orders(account_id);
CREATE INDEX idx_shopee_orders_status ON public.shopee_orders(status);
CREATE INDEX idx_shopee_orders_purchase_date ON public.shopee_orders(purchase_date);
CREATE INDEX idx_shopee_orders_tracking ON public.shopee_orders(tracking_code);
CREATE INDEX idx_shopee_status_history_order ON public.shopee_order_status_history(order_id);

-- Create trigger for updated_at
CREATE TRIGGER update_shopee_accounts_updated_at
BEFORE UPDATE ON public.shopee_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopee_orders_updated_at
BEFORE UPDATE ON public.shopee_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();