-- Add DELETE policy for shopee_orders
CREATE POLICY "Users can delete orders from their accounts"
ON public.shopee_orders
FOR DELETE
USING (account_id IN (
  SELECT id FROM shopee_accounts WHERE user_id = auth.uid()
));

-- Also allow deleting orders without account_id (manual orders)
DROP POLICY IF EXISTS "Users can delete orders from their accounts" ON public.shopee_orders;

CREATE POLICY "Users can delete their orders"
ON public.shopee_orders
FOR DELETE
USING (
  account_id IS NULL OR
  account_id IN (
    SELECT id FROM shopee_accounts WHERE user_id = auth.uid()
  )
);