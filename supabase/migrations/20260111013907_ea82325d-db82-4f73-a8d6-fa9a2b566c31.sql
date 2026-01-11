-- Create table for order edit history
CREATE TABLE public.shopee_order_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.shopee_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changes JSONB NOT NULL,
  previous_values JSONB NOT NULL
);

-- Enable RLS
ALTER TABLE public.shopee_order_edit_history ENABLE ROW LEVEL SECURITY;

-- Users can view edit history for orders they have access to
CREATE POLICY "Users can view edit history for their orders"
ON public.shopee_order_edit_history
FOR SELECT
USING (
  order_id IN (
    SELECT o.id FROM shopee_orders o
    LEFT JOIN shopee_accounts a ON o.account_id = a.id
    WHERE o.account_id IS NULL OR a.user_id = auth.uid()
  )
);

-- Users can insert edit history for orders they have access to
CREATE POLICY "Users can insert edit history for their orders"
ON public.shopee_order_edit_history
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  order_id IN (
    SELECT o.id FROM shopee_orders o
    LEFT JOIN shopee_accounts a ON o.account_id = a.id
    WHERE o.account_id IS NULL OR a.user_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_shopee_order_edit_history_order_id ON public.shopee_order_edit_history(order_id);
CREATE INDEX idx_shopee_order_edit_history_changed_at ON public.shopee_order_edit_history(changed_at DESC);