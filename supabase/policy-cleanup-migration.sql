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

ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id_unique
ON public.customers(user_id)
WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.link_customer_to_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS trg_link_customer_to_user ON public.customers;
CREATE TRIGGER trg_link_customer_to_user
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.link_customer_to_user();

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
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON public.customers;

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
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

DROP POLICY IF EXISTS "Allow public read access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow authenticated update on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.order_items;
DROP POLICY IF EXISTS "Admin can manage order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order_items" ON public.order_items;

DROP POLICY IF EXISTS "Allow public read access to repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow public insert on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Public can create repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Public can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow authenticated update on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Allow admin update on repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can manage everything" ON public.repair_requests;
DROP POLICY IF EXISTS "Admin can manage repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Authenticated users can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Users can view own repair_requests" ON public.repair_requests;

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

-- Customer-owned access model
CREATE POLICY "Authenticated users can insert customers" ON public.customers
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (user_id IS NULL OR user_id = auth.uid())
    );

CREATE POLICY "Users can view own customer record" ON public.customers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage customers" ON public.customers
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

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

CREATE POLICY "Admin can manage orders" ON public.orders
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

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

CREATE POLICY "Admin can manage order_items" ON public.order_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

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
CREATE OR REPLACE FUNCTION public.create_complete_order(
    p_customer_id UUID,
    p_shipping_cost DECIMAL(10, 2) DEFAULT 0,
    p_tax DECIMAL(10, 2) DEFAULT 0,
    p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    total DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_user_id UUID := auth.uid();
    v_is_admin BOOLEAN := FALSE;
    v_item JSONB;
    v_product RECORD;
    v_order RECORD;
    v_quantity INTEGER;
    v_subtotal NUMERIC := 0;
BEGIN
    IF v_auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.id = v_auth_user_id
    ) INTO v_is_admin;

    IF NOT EXISTS (
        SELECT 1
        FROM public.customers c
        WHERE c.id = p_customer_id
          AND (c.user_id = v_auth_user_id OR v_is_admin)
    ) THEN
        RAISE EXCEPTION 'Customer access denied';
    END IF;

    IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order items are required';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);
        IF v_quantity <= 0 THEN
            RAISE EXCEPTION 'Invalid item quantity';
        END IF;

        SELECT p.id, p.name, p.price, p.stock
        INTO v_product
        FROM public.products p
        WHERE p.id = (v_item->>'product_id')::UUID
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product not found';
        END IF;

        IF v_product.stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product.id;
        END IF;

        v_subtotal := v_subtotal + (v_product.price * v_quantity);
    END LOOP;

    INSERT INTO public.orders (customer_id, total, shipping_cost, tax, status, payment_status)
    VALUES (
        p_customer_id,
        v_subtotal + COALESCE(p_shipping_cost, 0) + COALESCE(p_tax, 0),
        COALESCE(p_shipping_cost, 0),
        COALESCE(p_tax, 0),
        'pending',
        'pending'
    )
    RETURNING id, order_number, total, created_at
    INTO v_order;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        v_quantity := COALESCE((v_item->>'quantity')::INTEGER, 0);

        SELECT p.id, p.name, p.price, p.stock
        INTO v_product
        FROM public.products p
        WHERE p.id = (v_item->>'product_id')::UUID
        FOR UPDATE;

        IF v_product.stock < v_quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product.id;
        END IF;

        UPDATE public.products
        SET stock = stock - v_quantity
        WHERE id = v_product.id;

        INSERT INTO public.order_items (order_id, product_id, quantity, price, name)
        VALUES (v_order.id, v_product.id, v_quantity, v_product.price, v_product.name);
    END LOOP;

    RETURN QUERY
    SELECT v_order.id, v_order.order_number, v_order.total, v_order.created_at;
END;
$$;

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
REVOKE ALL ON FUNCTION public.create_complete_order(UUID, DECIMAL, DECIMAL, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_repair_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_complete_order(UUID, DECIMAL, DECIMAL, JSONB) TO authenticated;

COMMIT;
