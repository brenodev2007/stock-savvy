-- Add user_id column to shopee_orders
ALTER TABLE shopee_orders ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to allow access based on user_id
CREATE POLICY "Users can view their own orders via user_id" ON shopee_orders
FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can insert their own orders via user_id" ON shopee_orders
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own orders via user_id" ON shopee_orders
FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can delete their own orders via user_id" ON shopee_orders
FOR DELETE USING (
  auth.uid() = user_id
);
