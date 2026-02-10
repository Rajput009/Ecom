-- ============================================================================
-- SUPABASE AUTH SETUP FOR ADMIN ACCESS
-- Run this in Supabase SQL Editor after enabling Auth
-- ============================================================================

-- Create a table to store admin role assignments
-- This extends the default auth.users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin users to view admin list
CREATE POLICY "Admin users can view admin list" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid()
        )
    );

-- Create policy to allow super_admin to manage admins
CREATE POLICY "Super admin can manage admins" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Create function to automatically add user to admin_users on signup
-- (if needed, you can manually insert instead)
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user (make them super_admin)
    IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
        INSERT INTO public.admin_users (id, email, role)
        VALUES (NEW.id, NEW.email, 'super_admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (optional - remove if you want manual admin creation)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users
--     FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_admin_user();

-- ============================================================================
-- MANUAL ADMIN USER CREATION
-- Replace 'admin@zulfiqarpc.com' with your actual admin email
-- Run this AFTER you sign up via the app or use Supabase Dashboard
-- ============================================================================

-- Option 1: Create admin via SQL (after user exists in auth.users)
-- First, sign up the user via the app, then run:
/*
INSERT INTO public.admin_users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@zulfiqarpc.com'
ON CONFLICT (id) DO NOTHING;
*/

-- Option 2: Check current admins
-- SELECT * FROM public.admin_users;

-- Option 3: Remove admin access
-- DELETE FROM public.admin_users WHERE email = 'admin@zulfiqarpc.com';

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR ADMIN ACCESS
-- These ensure only authenticated admins can modify data
-- ============================================================================

-- Update products table policy for admin access
DROP POLICY IF EXISTS "Allow authenticated insert on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated update on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete on products" ON products;

CREATE POLICY "Allow admin insert on products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Allow admin update on products" ON products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Allow admin delete on products" ON products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

-- Update categories table policy
DROP POLICY IF EXISTS "Allow authenticated insert on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated update on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated delete on categories" ON categories;

CREATE POLICY "Allow admin insert on categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Allow admin update on categories" ON categories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Allow admin delete on categories" ON categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

-- Update orders table policy
DROP POLICY IF EXISTS "Allow authenticated update on orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated delete on orders" ON orders;

CREATE POLICY "Allow admin update on orders" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Allow admin delete on orders" ON orders
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

-- Update repair_requests table policy
DROP POLICY IF EXISTS "Allow authenticated update on repair_requests" ON repair_requests;

CREATE POLICY "Allow admin update on repair_requests" ON repair_requests
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

-- ============================================================================
-- END OF SUPABASE AUTH SETUP
-- ============================================================================
