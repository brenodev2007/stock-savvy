-- Fix INSERT policy to require authenticated user
DROP POLICY IF EXISTS "Users can insert orders" ON public.shopee_orders;

CREATE POLICY "Users can insert orders" 
ON public.shopee_orders 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);