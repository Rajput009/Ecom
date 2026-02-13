-- ============================================================================
-- POLICY CLEANUP MIGRATION (IDEMPOTENT)
-- Purpose:
-- 1) Remove legacy/insecure policies
-- 2) Recreate least-privilege RLS policies
-- 3) Recreate secure tracking RPC functions and grants
-- Run this in Supabase SQL Editor for existing projects.
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- Ensure admin table exists (policy dependency)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------------
-- Ensure RLS is enabled
-- --------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Drop legacy and duplicate policies
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated insert on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated update on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated delete on categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin insert on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin update on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin delete on categories" ON public.categories;

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update on products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete on products" ON public.products;
DROP POLICY IF EXISTS "Public can read products" ON public.products;
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin can update products" ON public.products;
DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin update on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete on products" ON public.products;

DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
DROP POLICY IF EXISTS "Public can create customers" ON public.customers;
DROP POLICY IF EXISTS "Public can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated update on customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.customers;
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;

DROP POLICY IF EXISTS "Allow public read access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow authenticated delete on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin update on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin delete on orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.orders;
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public read access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated update on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.order_items;
DROP POLICY IF EXISTS "Admin can manage order_items" ON public.order_items;

DROP POLICY IF EXISTS "Allow public read access to repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow public insert on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Public can create repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Public can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow authenticated update on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow admin update on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.repair_requests;
DROP POLICY IF EXISTS "Admin can manage repair_requests" ON public.repair_requests;

DROP POLICY IF EXISTS "Admin users can view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can manage admins" ON public.admin_users;

-- --------------------------------------------------------------------------
-- Recreate final policy set
-- --------------------------------------------------------------------------
-- Catalog: public read, admin write
CREATE POLICY "Public can read categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert categories" ON public.categories
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can update categories" ON public.categories
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can delete categories" ON public.categories
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Public can read products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON public.products
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can update products" ON public.products
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can delete products" ON public.products
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Checkout/service intake: public insert, admin full manage
CREATE POLICY "Public can insert customers" ON public.customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage customers" ON public.customers
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage orders" ON public.orders
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Public can insert order_items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage order_items" ON public.order_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Public can insert repair_requests" ON public.repair_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage repair_requests" ON public.repair_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admin user table controls
CREATE POLICY "Admin users can view admin list" ON public.admin_users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid())
    );

CREATE POLICY "Super admin can manage admins" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.id = auth.uid() AND au.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.id = auth.uid() AND au.role = 'super_admin'
        )
    );

-- --------------------------------------------------------------------------
-- Secure tracking RPCs
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_order_status(p_order_number TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order JSONB;
BEGIN
    SELECT jsonb_build_object(
        'order_number', o.order_number,
        'status', o.status,
        'total', o.total,
        'tracking_number', o.tracking_number,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'completed_at', o.completed_at,
        'customer_name', c.name
    )
    INTO v_order
    FROM public.orders o
    JOIN public.customers c ON o.customer_id = c.id
    WHERE o.order_number = p_order_number
      AND c.phone = p_phone
    LIMIT 1;

    RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_repair_status(p_repair_id TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_repair JSONB;
BEGIN
    SELECT jsonb_build_object(
        'repair_id', r.repair_id,
        'device_brand', r.device_brand,
        'device_model', r.device_model,
        'status', r.status,
        'issue', r.issue,
        'service_type', r.service_type,
        'notes', r.notes,
        'estimated_cost', r.estimated_cost,
        'final_cost', r.final_cost,
        'created_at', r.created_at,
        'updated_at', r.updated_at,
        'completed_at', r.completed_at,
        'customer_name', c.name
    )
    INTO v_repair
    FROM public.repair_requests r
    JOIN public.customers c ON r.customer_id = c.id
    WHERE r.repair_id = p_repair_id
      AND c.phone = p_phone
    LIMIT 1;

    RETURN v_repair;
END;
$$;

REVOKE ALL ON FUNCTION public.get_order_status(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_repair_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_repair_status(TEXT, TEXT) TO anon, authenticated;

COMMIT;

