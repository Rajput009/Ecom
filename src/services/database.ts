import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product, Category, Customer, Order, OrderItem, RepairRequest,
  OrderComplete, ProductWithCategory, OrderWithCustomer, RepairRequestWithCustomer,
  CartItem, OrderStatus, RepairStatus, SecureOrderStatus, SecureRepairStatus
} from '../types';
import { whatsappService } from './whatsapp';

// Supabase configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

// Create Supabase client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

class DatabaseService {
  constructor() {
    if (!isSupabaseConfigured) {
      console.error('Supabase not configured. Application may not function correctly.');
    } else {
      console.log('Supabase connected successfully');
    }
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async getCategories(): Promise<Category[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  }

  async addCategory(name: string, icon?: string): Promise<Category> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const newCategory = {
      name,
      icon,
      product_count: 0,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('categories').insert(newCategory).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(categoryId: string, name: string, icon?: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const updates = { name, icon, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('categories').update(updates).eq('id', categoryId);
    if (error) throw error;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    // With FK constraint ON DELETE RESTRICT, this will fail if products exist
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(): Promise<Product[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getProductsWithCategories(): Promise<ProductWithCategory[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('products_with_categories').select('*');
    if (error) throw error;
    return data || [];
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>): Promise<Product> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const newProduct = {
      ...product,
      rating: 0,
      reviews: 0,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('products').insert(newProduct).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('products').update(fullUpdates).eq('id', productId);
    if (error) throw error;
  }

  async deleteProduct(productId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  async getCustomers(): Promise<Customer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('customers').select('*').eq('id', customerId).single();
    if (error) return null;
    return data;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    if (!supabase) return null;
    const normalizedPhone = phone.trim();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', normalizedPhone)
      .maybeSingle();
    if (error) return null;
    return data;
  }

  async getCustomerByUserId(userId: string): Promise<Customer | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) return null;
    return data;
  }

  async addCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const newCustomer = {
      ...customer,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('customers').insert(newCustomer).select().single();
    if (error) throw error;
    return data;
  }

  async updateCustomer(customerId: string, updates: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('customers').update(fullUpdates).eq('id', customerId);
    if (error) throw error;
  }

  private async getAuthenticatedUserId(): Promise<string | null> {
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  async findOrCreateCurrentCustomer(
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Customer> {
    if (!supabase) throw new Error('Supabase not configured');

    const userId = await this.getAuthenticatedUserId();
    if (!userId) {
      throw new Error('Authentication required');
    }

    const existingByUser = await this.getCustomerByUserId(userId);
    if (existingByUser) {
      const needsUpdate =
        existingByUser.name !== customerData.name ||
        (existingByUser.email || '') !== (customerData.email || '') ||
        existingByUser.phone !== customerData.phone ||
        (existingByUser.address || '') !== (customerData.address || '');

      if (needsUpdate) {
        await this.updateCustomer(existingByUser.id, {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
        });
        return {
          ...existingByUser,
          ...customerData,
        };
      }
      return existingByUser;
    }

    const customerByPhone = await this.getCustomerByPhone(customerData.phone);
    if (customerByPhone) {
      await this.updateCustomer(customerByPhone.id, {
        name: customerData.name,
        email: customerData.email,
        address: customerData.address,
        user_id: userId,
      });
      return {
        ...customerByPhone,
        ...customerData,
        user_id: userId,
      };
    }

    return this.addCustomer({
      ...customerData,
      user_id: userId,
    });
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  async getOrders(): Promise<Order[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getOrdersWithCustomers(): Promise<OrderWithCustomer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('orders_with_customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getOrderById(orderId: string): Promise<OrderComplete | null> {
    if (!supabase) return null;
    // Use the stored procedure for complete order details
    const { data, error } = await supabase
      .rpc('get_order_details', { order_uuid: orderId });

    if (error || !data) return null;
    return data[0] as OrderComplete;
  }

  async addOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Order> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const newOrder = {
      ...order,
      order_number: `TEMP-${Date.now().toString(36).toUpperCase()}`, // DB trigger will override
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const updates: Partial<Order> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'delivered') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
    if (error) throw error;
  }

  async updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('orders')
      .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
  }

  async trackOrder(orderNumber: string, phone: string): Promise<SecureOrderStatus | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('get_order_status', {
      p_order_number: orderNumber,
      p_phone: phone
    });
    if (error) return null;
    return data as SecureOrderStatus;
  }

  // ============================================================================
  // ORDER ITEMS
  // ============================================================================

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  }

  async addOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
    if (!supabase) throw new Error('Supabase not configured');
    const newItem = {
      ...item,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('order_items').insert(newItem).select().single();
    if (error) throw error;
    return data;
  }

  // Helper: Create complete order with items
  async createCompleteOrder(
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>,
    cartItems: CartItem[],
    shippingCost: number = 0,
    tax: number = 0
  ): Promise<OrderComplete> {
    if (!supabase) throw new Error('Supabase not configured');
    if (!cartItems.length) {
      throw new Error('Cart is empty');
    }

    const customer = await this.findOrCreateCurrentCustomer(customerData);
    const rpcItems = cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const { data, error } = await supabase.rpc('create_complete_order', {
      p_customer_id: customer.id,
      p_shipping_cost: shippingCost,
      p_tax: tax,
      p_items: rpcItems,
    });
    if (error || !data || !Array.isArray(data) || !data[0]?.order_id) {
      throw error || new Error('Failed to create order');
    }
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', data[0].order_id)
      .single();
    if (orderError || !orderRow) {
      throw orderError || new Error('Order was created but could not be loaded');
    }

    const orderItems = await this.getOrderItems(orderRow.id);

    return {
      ...orderRow,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      items: orderItems,
    };
  }

  // ============================================================================
  // REPAIR REQUESTS
  // ============================================================================

  async getRepairRequests(): Promise<RepairRequest[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('repair_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRepairsWithCustomers(): Promise<RepairRequestWithCustomer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('repairs_with_customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRepairById(repairId: string): Promise<RepairRequestWithCustomer | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('repairs_with_customers')
      .select('*')
      .eq('id', repairId)
      .single();

    if (error) return null;
    return data;
  }

  async getRepairByIdAndPhone(repairId: string, phone: string): Promise<SecureRepairStatus | null> {
    return this.trackRepair(repairId, phone);
  }

  async trackRepair(repairId: string, phone: string): Promise<SecureRepairStatus | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('get_repair_status', {
      p_repair_id: repairId,
      p_phone: phone
    });
    if (error) return null;
    return data as SecureRepairStatus;
  }

  async addRepairRequest(
    repair: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'completed_at' | 'notified_customer'>
  ): Promise<RepairRequestWithCustomer> {
    if (!supabase) throw new Error('Supabase not configured');
    const now = new Date().toISOString();
    const newRepair = {
      ...repair,
      repair_id: `TEMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, // DB trigger will override
      notified_customer: false,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('repair_requests').insert(newRepair).select().single();
    if (error) throw error;

    const customer = await this.getCustomerById(repair.customer_id);

    // Send WhatsApp confirmation
    await whatsappService.sendRepairConfirmation({
      ...data,
      customer_name: customer?.name || 'Unknown',
      customer_phone: customer?.phone || '',
    });

    return {
      ...data,
      customer_name: customer?.name || 'Unknown',
      customer_phone: customer?.phone || '',
      customer_email: customer?.email,
    };
  }

  async updateRepairStatus(repairId: string, status: RepairStatus): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const updates: Partial<RepairRequest> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed' || status === 'returned') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('repair_requests')
      .update(updates)
      .eq('id', repairId)
      .select()
      .single();

    if (error) throw error;

    // Send WhatsApp notification
    if (data) {
      const customer = await this.getCustomerById(data.customer_id);
      await this.sendRepairNotification({
        ...data,
        customer_name: customer?.name || 'Unknown',
        customer_phone: customer?.phone || '',
      });
    }
  }

  async updateRepairRequest(repairId: string, updates: Partial<Omit<RepairRequest, 'id' | 'created_at'>>): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('repair_requests').update(fullUpdates).eq('id', repairId);
    if (error) throw error;
  }

  async deleteRepairRequest(repairId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.from('repair_requests').delete().eq('id', repairId);
    if (error) throw error;
  }

  // Send appropriate WhatsApp notification based on status
  private async sendRepairNotification(repair: RepairRequestWithCustomer): Promise<void> {
    switch (repair.status) {
      case 'completed':
        await whatsappService.sendRepairComplete(repair);
        break;
      case 'returned':
        await whatsappService.sendTextMessage(
          repair.customer_phone,
          `✅ Your repair ${repair.repair_id} is ready for pickup!\n\nPlease visit us at:\n📍 Main Boulevard, Lahore\n⏰ Open 10 AM - 10 PM\n\nBring your token number.`
        );
        break;
      case 'cancelled':
        await whatsappService.sendTextMessage(
          repair.customer_phone,
          `⚠️ Repair ${repair.repair_id} has been cancelled.\n\nPlease contact us for more information:\n📞 0300-1234567`
        );
        break;
      default:
        await whatsappService.sendStatusUpdate(repair);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isConfigured(): boolean {
    return isSupabaseConfigured;
  }
}

// Export singleton instance
export const db = new DatabaseService();
