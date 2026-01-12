-- Create shopee_order_items table for storing multiple items per order
CREATE TABLE IF NOT EXISTS public.shopee_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.shopee_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopee_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view order items" 
ON public.shopee_order_items 
FOR SELECT 
USING (
  order_id IN (
    SELECT id FROM shopee_orders 
    WHERE account_id IS NULL OR account_id IN (SELECT id FROM shopee_accounts WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert order items" 
ON public.shopee_order_items 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update order items" 
ON public.shopee_order_items 
FOR UPDATE 
USING (
  order_id IN (
    SELECT id FROM shopee_orders 
    WHERE account_id IS NULL OR account_id IN (SELECT id FROM shopee_accounts WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can delete order items" 
ON public.shopee_order_items 
FOR DELETE 
USING (
  order_id IN (
    SELECT id FROM shopee_orders 
    WHERE account_id IS NULL OR account_id IN (SELECT id FROM shopee_accounts WHERE user_id = auth.uid())
  )
);