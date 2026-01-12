-- Create shopee_order_items table
CREATE TABLE IF NOT EXISTS public.shopee_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.shopee_orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    sku TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Copy existing data to items table
INSERT INTO public.shopee_order_items (order_id, product_name, sku, unit_price, quantity)
SELECT 
    id as order_id,
    product_name,
    sku,
    COALESCE(order_total, 0) as unit_price,
    1 as quantity
FROM public.shopee_orders;

-- Make product_name nullable in parent table as it's now in items
ALTER TABLE public.shopee_orders ALTER COLUMN product_name DROP NOT NULL;
