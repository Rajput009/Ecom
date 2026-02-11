-- ============================================================================
-- SECURE TRACKING FUNCTIONS & RLS HARDENING
-- Run this in Supabase SQL Editor to secure your production database
-- ============================================================================

-- 1. SECURE ORDER TRACKING FUNCTION
-- This allows a user to get THEIR specific order status without browsing the table
CREATE OR REPLACE FUNCTION get_order_status(p_order_number TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Necessary to bypass RLS for this specific authenticated lookup
SET search_path = public
AS $$
DECLARE
    v_order JSONB;
BEGIN
        'order_number', o.order_number,
        'status', o.status,
        'total', o.total,
        'tracking_number', o.tracking_number,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'completed_at', o.completed_at,
        'customer_name', c.name
    ) INTO v_order
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.order_number = p_order_number 
    AND c.phone = p_phone;

    IF v_order IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN v_order;
END;
$$;

-- 2. SECURE REPAIR TRACKING FUNCTION
CREATE OR REPLACE FUNCTION get_repair_status(p_repair_id TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_repair JSONB;
BEGIN
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
    ) INTO v_repair
    FROM repair_requests r
    JOIN customers c ON r.customer_id = c.id
    WHERE r.repair_id = p_repair_id 
    AND c.phone = p_phone;

    IF v_repair IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN v_repair;
END;
$$;

-- 3. TIGHTEN RLS POLICIES
-- Remove the 'Public Read' access that was exposing your customer list
DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to repair_requests" ON repair_requests;

-- Ensure Admins (from admin_users table) still have full access
CREATE POLICY "Admins can manage everything" ON customers FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage everything" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage everything" ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage everything" ON repair_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Keep Public INSERT active (so people can still buy things)
-- Note: Insertion is safe as it doesn't leak existing data
CREATE POLICY "Public can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create repair_requests" ON repair_requests FOR INSERT WITH CHECK (true);
