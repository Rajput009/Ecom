-- ============================================================================
-- CUSTOMER AUTHENTICATION MIGRATION
-- Purpose: Add user_id linking for customer accounts and enforce ownership-safe RLS
-- Run this in Supabase SQL Editor after enabling Email auth in the dashboard
-- ============================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Add user_id column to customers table
-- --------------------------------------------------------------------------
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_user_id_unique
ON public.customers(user_id)
WHERE user_id IS NOT NULL;

-- --------------------------------------------------------------------------
-- 2. Create function to auto-link customer to authenticated user
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_customer_to_user()
RETURNS TRIGGER AS $$
BEGIN
    -- If customer.user_id is not provided, link it to the current authenticated user
    IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Apply the trigger (drop first if exists)
DROP TRIGGER IF EXISTS trg_link_customer_to_user ON public.customers;
CREATE TRIGGER trg_link_customer_to_user
    BEFORE INSERT ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.link_customer_to_user();

-- --------------------------------------------------------------------------
-- 3. Update RLS policies for customer-specific access
-- --------------------------------------------------------------------------

-- Drop legacy and previous customer-auth policies for idempotency
DROP POLICY IF EXISTS "Public can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view own customer record" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated users can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order_items" ON public.order_items;
DROP POLICY IF EXISTS "Authenticated users can insert repair_requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Users can view own repair_requests" ON public.repair_requests;

-- Customers: Authenticated users can insert their own profile and read only their row
CREATE POLICY "Authenticated users can insert customers" ON public.customers
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (user_id IS NULL OR user_id = auth.uid())
    );

CREATE POLICY "Users can view own customer record" ON public.customers
    FOR SELECT USING (user_id = auth.uid());

-- Orders: users can only insert/read orders tied to their own customer row
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

-- Order items: users can only insert/read items for their own orders
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

-- Repair requests: users can only insert/read requests tied to their customer row
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

-- --------------------------------------------------------------------------
-- 4. Keep admin policies intact (they use FOR ALL, so they override)
-- The existing "Admin can manage X" policies will still work for admins
-- --------------------------------------------------------------------------

-- Ensure admin policies exist (idempotent)
DROP POLICY IF EXISTS "Admin can manage customers" ON public.customers;
CREATE POLICY "Admin can manage customers" ON public.customers
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders" ON public.orders
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admin can manage order_items" ON public.order_items;
CREATE POLICY "Admin can manage order_items" ON public.order_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

DROP POLICY IF EXISTS "Admin can manage repair_requests" ON public.repair_requests;
CREATE POLICY "Admin can manage repair_requests" ON public.repair_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- --------------------------------------------------------------------------
-- 5. Optional: Safe profile view (customer-table only, no auth.users exposure)
-- --------------------------------------------------------------------------
DROP VIEW IF EXISTS public.user_profiles;
CREATE VIEW public.user_profiles AS
SELECT 
    c.user_id,
    c.id as customer_id,
    c.name,
    c.email,
    c.phone,
    c.address,
    c.created_at as customer_created,
    c.updated_at as customer_updated
FROM public.customers c
WHERE c.user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- 1. Enable Email auth in Supabase Dashboard → Authentication → Providers
-- 2. Configure email templates if needed (Confirmation, Password Reset)
-- 3. For existing customers, you can manually link them to users:
--    UPDATE customers SET user_id = 'user-uuid' WHERE email = 'customer@email.com';
-- ============================================================================
