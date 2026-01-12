-- Update RLS policy for shopee_orders to allow INSERT without account_id
DROP POLICY IF EXISTS "Users can insert orders for their accounts" ON public.shopee_orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.shopee_orders;

CREATE POLICY "Users can insert orders" 
ON public.shopee_orders 
FOR INSERT 
WITH CHECK (true);

-- Update SELECT policy to also allow viewing orders without account
DROP POLICY IF EXISTS "Users can view orders from their accounts" ON public.shopee_orders;

CREATE POLICY "Users can view orders" 
ON public.shopee_orders 
FOR SELECT 
USING (
  account_id IS NULL OR 
  account_id IN (SELECT id FROM shopee_accounts WHERE user_id = auth.uid())
);

-- Update UPDATE policy to allow updating orders without account
DROP POLICY IF EXISTS "Users can update orders from their accounts" ON public.shopee_orders;

CREATE POLICY "Users can update orders" 
ON public.shopee_orders 
FOR UPDATE 
USING (
  account_id IS NULL OR 
  account_id IN (SELECT id FROM shopee_accounts WHERE user_id = auth.uid())
);