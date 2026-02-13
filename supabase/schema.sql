-- ============================================================================
-- Zulfiqar Computers E-Commerce Database Schema
-- Production-Ready PostgreSQL Schema for Supabase
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    product_count INTEGER NOT NULL DEFAULT 0 CHECK (product_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for category name lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. PRODUCTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(10, 2) CHECK (original_price >= 0),
    image VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    specs TEXT[] DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Full-text search index (optional, for future search feature)
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update category product_count on product insert
CREATE OR REPLACE FUNCTION update_category_product_count_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_category_count_insert ON products;
CREATE TRIGGER trg_category_count_insert
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_product_count_insert();

-- Trigger to update category product_count on product delete
CREATE OR REPLACE FUNCTION update_category_product_count_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_category_count_delete ON products;
CREATE TRIGGER trg_category_count_delete
    AFTER DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_product_count_delete();

-- Trigger to update category product_count on product category change
CREATE OR REPLACE FUNCTION update_category_product_count_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
        UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_category_count_update ON products;
CREATE TRIGGER trg_category_count_update
    AFTER UPDATE OF category_id ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_category_product_count_update();

-- ============================================================================
-- 3. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for customer lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    shipping_cost DECIMAL(10, 2) DEFAULT 0 CHECK (shipping_cost >= 0),
    tax DECIMAL(10, 2) DEFAULT 0 CHECK (tax >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for order queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when status changes to delivered
CREATE OR REPLACE FUNCTION set_order_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_order_completed_at ON orders;
CREATE TRIGGER trg_order_completed_at
    BEFORE UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_completed_at();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Apply order number generation trigger
DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- 5. ORDER ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for order item queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- 6. REPAIR REQUESTS TABLE
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type') THEN
        CREATE TYPE device_type AS ENUM ('mobile', 'tablet', 'laptop', 'desktop');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'repair_status') THEN
        CREATE TYPE repair_status AS ENUM ('received', 'diagnosing', 'waiting-parts', 'in-progress', 'completed', 'returned', 'cancelled');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS repair_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repair_id VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    device_brand VARCHAR(100) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    device_type device_type NOT NULL,
    issue TEXT NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    status repair_status NOT NULL DEFAULT 'received',
    estimated_cost DECIMAL(10, 2) CHECK (estimated_cost >= 0),
    final_cost DECIMAL(10, 2) CHECK (final_cost >= 0),
    notes TEXT,
    technician VARCHAR(100),
    notified_customer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for repair queries
CREATE INDEX IF NOT EXISTS idx_repair_requests_customer_id ON repair_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_status ON repair_requests(status);
CREATE INDEX IF NOT EXISTS idx_repair_requests_repair_id ON repair_requests(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_requests_created_at ON repair_requests(created_at DESC);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_repair_requests_updated_at ON repair_requests;
CREATE TRIGGER update_repair_requests_updated_at
    BEFORE UPDATE ON repair_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set completed_at when status changes
CREATE OR REPLACE FUNCTION set_repair_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'returned') AND OLD.status NOT IN ('completed', 'returned') THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_repair_completed_at ON repair_requests;
CREATE TRIGGER trg_repair_completed_at
    BEFORE UPDATE OF status ON repair_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_repair_completed_at();

-- Function to generate repair ID
CREATE OR REPLACE FUNCTION generate_repair_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.repair_id := 'REP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply repair ID generation trigger
DROP TRIGGER IF EXISTS trg_generate_repair_id ON repair_requests;
CREATE TRIGGER trg_generate_repair_id
    BEFORE INSERT ON repair_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_repair_id();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Admin users table used by policy checks
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies to keep migration idempotent
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated insert on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated update on categories" ON categories;
DROP POLICY IF EXISTS "Allow authenticated delete on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated update on products" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete on products" ON products;
DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read access to orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access to repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow public insert on customers" ON customers;
DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert on repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Allow authenticated update on customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated update on orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated delete on orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated update on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated update on repair_requests" ON repair_requests;
DROP POLICY IF EXISTS "Admin users can view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Super admin can manage admins" ON public.admin_users;

-- Categories: public read, admin writes
CREATE POLICY "Public can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert categories" ON categories
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can update categories" ON categories
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can delete categories" ON categories
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Products: public read, admin writes
CREATE POLICY "Public can read products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert products" ON products
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can update products" ON products
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

CREATE POLICY "Admin can delete products" ON products
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Customers: public insert, no public reads; admin full access
CREATE POLICY "Public can insert customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage customers" ON customers
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Orders: public insert, no public reads; admin full access
CREATE POLICY "Public can insert orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage orders" ON orders
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Order items: public insert, no public reads; admin full access
CREATE POLICY "Public can insert order_items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage order_items" ON order_items
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Repair requests: public insert, no public reads; admin full access
CREATE POLICY "Public can insert repair_requests" ON repair_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage repair_requests" ON repair_requests
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users au WHERE au.id = auth.uid()));

-- Admin users policies
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

-- ============================================================================
-- 8. UNCATEGORIZED CATEGORY (Fallback for deleted categories)
-- ============================================================================

-- Insert Uncategorized category if it doesn't exist
INSERT INTO categories (id, name, icon, product_count)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Uncategorized',
    'help-circle',
    0
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 9. VIEWS FOR COMMON QUERIES (Optional - for better performance)
-- ============================================================================

-- View: Products with category names
CREATE OR REPLACE VIEW products_with_categories AS
SELECT 
    p.*,
    c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id;

-- View: Orders with customer info
CREATE OR REPLACE VIEW orders_with_customers AS
SELECT 
    o.*,
    c.name as customer_name,
    c.email as customer_email,
    c.phone as customer_phone
FROM orders o
JOIN customers c ON o.customer_id = c.id;

-- View: Repair requests with customer info
CREATE OR REPLACE VIEW repairs_with_customers AS
SELECT 
    r.*,
    c.name as customer_name,
    c.phone as customer_phone
FROM repair_requests r
JOIN customers c ON r.customer_id = c.id;

-- ============================================================================
-- 10. STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

-- Procedure: Get order details with items
CREATE OR REPLACE FUNCTION get_order_details(order_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_phone VARCHAR,
    total DECIMAL,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    items JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        c.name,
        c.email,
        c.phone,
        o.total,
        o.status,
        o.created_at,
        (
            SELECT json_agg(
                json_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'name', oi.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            )
            FROM order_items oi
            WHERE oi.order_id = o.id
        ) as items
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = order_uuid;
END;
$$ LANGUAGE plpgsql;

-- Secure procedure: Get order status by order number + customer phone
CREATE OR REPLACE FUNCTION get_order_status(p_order_number TEXT, p_phone TEXT)
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
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.order_number = p_order_number
      AND c.phone = p_phone
    LIMIT 1;

    RETURN v_order;
END;
$$;

-- Secure procedure: Get repair status by repair id + customer phone
CREATE OR REPLACE FUNCTION get_repair_status(p_repair_id TEXT, p_phone TEXT)
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
    FROM repair_requests r
    JOIN customers c ON r.customer_id = c.id
    WHERE r.repair_id = p_repair_id
      AND c.phone = p_phone
    LIMIT 1;

    RETURN v_repair;
END;
$$;

REVOKE ALL ON FUNCTION get_order_status(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION get_repair_status(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_order_status(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_repair_status(TEXT, TEXT) TO anon, authenticated;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
