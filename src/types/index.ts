// ============================================================================
// Zulfiqar Computers - TypeScript Type Definitions
// Production-Ready Schema (v2.0)
// ============================================================================

// ============================================================================
// CORE TYPES
// ============================================================================

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type RepairStatus = 'received' | 'diagnosing' | 'waiting-parts' | 'in-progress' | 'completed' | 'returned' | 'cancelled';
export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';
export type AdminTab = 'dashboard' | 'products' | 'orders' | 'repairs' | 'categories' | 'customers' | 'settings';

// ============================================================================
// CATEGORY
// ============================================================================

export interface Category {
  id: string;
  name: string;
  icon?: string;
  product_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PRODUCT
// ============================================================================

export interface Product {
  id: string;
  name: string;
  category_id: string;  // Foreign key to categories
  price: number;
  original_price?: number;
  image: string;
  description: string;
  specs: string[];
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

// Extended product with joined category data
export interface ProductWithCategory extends Product {
  category_name: string;
}

// ============================================================================
// CUSTOMER
// ============================================================================

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CART (Frontend-only, not stored in DB)
// ============================================================================

export interface CartItem {
  product: Product;
  quantity: number;
}

// ============================================================================
// ORDER
// ============================================================================

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;  // Foreign key to customers
  total: number;
  shipping_cost: number;
  tax: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Extended order with joined customer data
export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address?: string;
}

// Minimal order data for public tracking (via secure RPC)
export interface SecureOrderStatus {
  order_number: string;
  status: OrderStatus;
  total: number;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  customer_name: string;
}

// ============================================================================
// ORDER ITEM
// ============================================================================

export interface OrderItem {
  id: string;
  order_id: string;    // Foreign key to orders
  product_id: string;  // Foreign key to products
  quantity: number;
  price: number;       // Price at time of order (snapshot)
  name: string;        // Product name at time of order (snapshot)
  created_at: string;
}

// Extended order item with product details
export interface OrderItemWithProduct extends OrderItem {
  product?: Product;
}

// Complete order with all related data
export interface OrderComplete extends OrderWithCustomer {
  items: OrderItem[];
}

// ============================================================================
// REPAIR REQUEST
// ============================================================================

export interface RepairRequest {
  id: string;
  repair_id: string;   // Human-readable ID like "REP-ABC123"
  customer_id: string; // Foreign key to customers
  device_brand: string;
  device_model: string;
  device_type: DeviceType;
  issue: string;
  service_type: string;
  status: RepairStatus;
  estimated_cost?: number;
  final_cost?: number;
  notes?: string;
  technician?: string;
  notified_customer: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Extended repair with joined customer data
export interface RepairRequestWithCustomer extends RepairRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
}

// Minimal repair data for public tracking (via secure RPC)
export interface SecureRepairStatus {
  repair_id: string;
  device_brand: string;
  device_model: string;
  status: RepairStatus;
  issue: string;
  service_type: string;
  notes?: string;
  estimated_cost?: number;
  final_cost?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  customer_name: string;
}

// ============================================================================
// PC BUILDER (Frontend-only feature)
// ============================================================================

export interface PCComponent {
  id: string;
  type: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'storage' | 'psu' | 'case' | 'cooler';
  name: string;
  brand: string;
  price: number;
  image: string;
  specs: string[];
  wattage: number;
  compatibility?: string[];
}

export interface PCBuild {
  cpu?: PCComponent;
  gpu?: PCComponent;
  ram?: PCComponent;
  motherboard?: PCComponent;
  storage?: PCComponent;
  psu?: PCComponent;
  case?: PCComponent;
  cooler?: PCComponent;
}

// ============================================================================
// FORM DATA TYPES (For frontend forms)
// ============================================================================

export interface ProductFormData {
  name: string;
  category_id: string;
  price: number;
  original_price?: number;
  image: string;
  description: string;
  specs: string[];
  stock: number;
  featured?: boolean;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface OrderFormData {
  customer: CustomerFormData;
  items: CartItem[];
  shipping_cost: number;
  tax: number;
  payment_method?: string;
}

export interface RepairFormData {
  customer: CustomerFormData;
  device_brand: string;
  device_model: string;
  device_type: DeviceType;
  issue: string;
  service_type: string;
  estimated_cost?: number;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalRepairs: number;
  pendingRepairs: number;
  lowStockProducts: number;
  recentOrders: OrderWithCustomer[];
  recentRepairs: RepairRequestWithCustomer[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ProductFilters {
  category_id?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  customer_id?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RepairFilters {
  status?: RepairStatus;
  customer_id?: string;
  device_type?: DeviceType;
}
