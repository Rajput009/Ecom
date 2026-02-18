-- ============================================================================
-- SECURE TRACKING FUNCTIONS & RLS HARDENING
-- Run this in Supabase SQL Editor to secure an existing database
-- ============================================================================

-- 1. SECURE ORDER TRACKING FUNCTION
-- Returns only one order when order_number + phone match.
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

-- 2. SECURE REPAIR TRACKING FUNCTION
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

-- 3. TIGHTEN RLS POLICIES
-- Remove public access from sensitive tables and enforce user ownership.
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id_unique
ON public.customers(user_id)
WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Allow public read access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read access to repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Public can read customers" ON public.customers;
DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
DROP POLICY IF EXISTS "Public can read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can read repair_requests" ON public.repair_requests;

DROP POLICY IF EXISTS "Public can create customers" ON public.customers;
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Users can view own repair_requests" ON public.repair_requests;

CREATE POLICY "Authenticated users can insert customers" ON public.customers
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (user_id IS NULL OR user_id = auth.uid())
    );

CREATE POLICY "Users can view own customer record" ON public.customers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert orders" ON public.orders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.customers c
            WHERE c.id = customer_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.customers c
            WHERE c.id = customer_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can insert order_items" ON public.order_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.customers c ON c.id = o.customer_id
            WHERE o.id = order_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own order_items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.orders o
            JOIN public.customers c ON o.customer_id = c.id
            WHERE o.id = order_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can insert repair_requests" ON public.repair_requests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.customers c
            WHERE c.id = customer_id
              AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own repair_requests" ON public.repair_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.customers c
            WHERE c.id = customer_id
              AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can manage everything" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.repair_requests;
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can manage order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admin can manage repair_requests" ON public.repair_requests;

CREATE POLICY "Admin can manage customers" ON public.customers
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can manage orders" ON public.orders
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can manage order_items" ON public.order_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can manage repair_requests" ON public.repair_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));
