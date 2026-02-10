import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Product, Category, Customer, Order, OrderItem, RepairRequest, 
  OrderComplete, ProductWithCategory, OrderWithCustomer, RepairRequestWithCustomer,
  CartItem, OrderStatus, RepairStatus
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
  private useLocalStorage: boolean;

  constructor() {
    this.useLocalStorage = !isSupabaseConfigured;
    
    if (this.useLocalStorage) {
      console.warn('Supabase not configured. Using localStorage fallback.');
    } else {
      console.log('Supabase connected successfully');
    }
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async getCategories(): Promise<Category[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_categories_v2');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  }

  async addCategory(name: string, icon?: string): Promise<Category> {
    const now = new Date().toISOString();
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      icon,
      product_count: 0,
      created_at: now,
      updated_at: now,
    };

    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      categories.push(newCategory);
      localStorage.setItem('zulfiqar_categories_v2', JSON.stringify(categories));
      return newCategory;
    }

    const { data, error } = await supabase!.from('categories').insert(newCategory).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(categoryId: string, name: string, icon?: string): Promise<void> {
    const updates = { name, icon, updated_at: new Date().toISOString() };

    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      const index = categories.findIndex(c => c.id === categoryId);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        localStorage.setItem('zulfiqar_categories_v2', JSON.stringify(categories));
      }
      return;
    }

    const { error } = await supabase!.from('categories').update(updates).eq('id', categoryId);
    if (error) throw error;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c.id !== categoryId);
      localStorage.setItem('zulfiqar_categories_v2', JSON.stringify(filtered));
      return;
    }

    // With FK constraint ON DELETE RESTRICT, this will fail if products exist
    const { error } = await supabase!.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(): Promise<Product[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_products_v2');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getProductsWithCategories(): Promise<ProductWithCategory[]> {
    if (this.useLocalStorage) {
      const products = await this.getProducts();
      const categories = await this.getCategories();
      return products.map(p => ({
        ...p,
        category_name: categories.find(c => c.id === p.category_id)?.name || 'Uncategorized'
      }));
    }

    const { data, error } = await supabase!.from('products_with_categories').select('*');
    if (error) throw error;
    return data || [];
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (this.useLocalStorage) {
      const products = await this.getProducts();
      return products.filter(p => p.category_id === categoryId);
    }

    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>): Promise<Product> {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      rating: 0,
      reviews: 0,
      created_at: now,
      updated_at: now,
    };

    if (this.useLocalStorage) {
      const products = await this.getProducts();
      products.push(newProduct);
      localStorage.setItem('zulfiqar_products_v2', JSON.stringify(products));
      return newProduct;
    }

    const { data, error } = await supabase!.from('products').insert(newProduct).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<void> {
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (this.useLocalStorage) {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...fullUpdates };
        localStorage.setItem('zulfiqar_products_v2', JSON.stringify(products));
      }
      return;
    }

    const { error } = await supabase!.from('products').update(fullUpdates).eq('id', productId);
    if (error) throw error;
  }

  async deleteProduct(productId: string): Promise<void> {
    if (this.useLocalStorage) {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== productId);
      localStorage.setItem('zulfiqar_products_v2', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase!.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  async getCustomers(): Promise<Customer[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_customers_v2');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('customers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    if (this.useLocalStorage) {
      const customers = await this.getCustomers();
      return customers.find(c => c.id === customerId) || null;
    }

    const { data, error } = await supabase!.from('customers').select('*').eq('id', customerId).single();
    if (error) return null;
    return data;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '');
    
    if (this.useLocalStorage) {
      const customers = await this.getCustomers();
      return customers.find(c => c.phone.replace(/\D/g, '') === normalizedPhone) || null;
    }

    const { data, error } = await supabase!
      .from('customers')
      .select('*')
      .ilike('phone', `%${normalizedPhone}%`)
      .single();
    if (error) return null;
    return data;
  }

  async addCustomer(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };

    if (this.useLocalStorage) {
      const customers = await this.getCustomers();
      customers.push(newCustomer);
      localStorage.setItem('zulfiqar_customers_v2', JSON.stringify(customers));
      return newCustomer;
    }

    const { data, error } = await supabase!.from('customers').insert(newCustomer).select().single();
    if (error) throw error;
    return data;
  }

  async updateCustomer(customerId: string, updates: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<void> {
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (this.useLocalStorage) {
      const customers = await this.getCustomers();
      const index = customers.findIndex(c => c.id === customerId);
      if (index !== -1) {
        customers[index] = { ...customers[index], ...fullUpdates };
        localStorage.setItem('zulfiqar_customers_v2', JSON.stringify(customers));
      }
      return;
    }

    const { error } = await supabase!.from('customers').update(fullUpdates).eq('id', customerId);
    if (error) throw error;
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  async getOrders(): Promise<Order[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_orders_v2');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getOrdersWithCustomers(): Promise<OrderWithCustomer[]> {
    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      const customers = await this.getCustomers();
      return orders.map(o => {
        const customer = customers.find(c => c.id === o.customer_id);
        return {
          ...o,
          customer_name: customer?.name || 'Unknown',
          customer_email: customer?.email,
          customer_phone: customer?.phone || '',
        };
      });
    }

    const { data, error } = await supabase!
      .from('orders_with_customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getOrderById(orderId: string): Promise<OrderComplete | null> {
    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) return null;

      const customers = await this.getCustomers();
      const customer = customers.find(c => c.id === order.customer_id);
      const orderItems = await this.getOrderItems(orderId);

      return {
        ...order,
        customer_name: customer?.name || 'Unknown',
        customer_email: customer?.email,
        customer_phone: customer?.phone || '',
        items: orderItems,
      };
    }

    // Use the stored procedure for complete order details
    const { data, error } = await supabase!
      .rpc('get_order_details', { order_uuid: orderId });
    
    if (error || !data) return null;
    return data[0] as OrderComplete;
  }

  async addOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Order> {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      order_number: `ORD-${Date.now().toString(36).toUpperCase()}`, // Fallback, DB will generate proper one
      created_at: now,
      updated_at: now,
    };

    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      orders.unshift(newOrder);
      localStorage.setItem('zulfiqar_orders_v2', JSON.stringify(orders));
      return newOrder;
    }

    const { data, error } = await supabase!.from('orders').insert(newOrder).select().single();
    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const updates: Partial<Order> = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (status === 'delivered') {
      updates.completed_at = new Date().toISOString();
    }

    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        localStorage.setItem('zulfiqar_orders_v2', JSON.stringify(orders));
      }
      return;
    }

    const { error } = await supabase!.from('orders').update(updates).eq('id', orderId);
    if (error) throw error;
  }

  async updateOrderTracking(orderId: string, trackingNumber: string): Promise<void> {
    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index].tracking_number = trackingNumber;
        orders[index].updated_at = new Date().toISOString();
        localStorage.setItem('zulfiqar_orders_v2', JSON.stringify(orders));
      }
      return;
    }

    const { error } = await supabase!
      .from('orders')
      .update({ tracking_number: trackingNumber, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) throw error;
  }

  // ============================================================================
  // ORDER ITEMS
  // ============================================================================

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_order_items_v2');
      const items = saved ? JSON.parse(saved) : [];
      return items.filter((item: OrderItem) => item.order_id === orderId);
    }

    const { data, error } = await supabase!
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  }

  async addOrderItem(item: Omit<OrderItem, 'id' | 'created_at'>): Promise<OrderItem> {
    const newItem: OrderItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_order_items_v2');
      const items = saved ? JSON.parse(saved) : [];
      items.push(newItem);
      localStorage.setItem('zulfiqar_order_items_v2', JSON.stringify(items));
      return newItem;
    }

    const { data, error } = await supabase!.from('order_items').insert(newItem).select().single();
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
    // 1. Create or find customer
    let customer = await this.getCustomerByPhone(customerData.phone);
    if (!customer) {
      customer = await this.addCustomer(customerData);
    }

    // 2. Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = subtotal + shippingCost + tax;

    // 3. Create order
    const order = await this.addOrder({
      customer_id: customer.id,
      total,
      shipping_cost: shippingCost,
      tax,
      status: 'pending',
      payment_status: 'pending',
    });

    // 4. Create order items
    const orderItems: OrderItem[] = [];
    for (const cartItem of cartItems) {
      const orderItem = await this.addOrderItem({
        order_id: order.id,
        product_id: cartItem.product.id,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
        name: cartItem.product.name,
      });
      orderItems.push(orderItem);

      // 5. Update product stock
      await this.updateProduct(cartItem.product.id, {
        stock: Math.max(0, cartItem.product.stock - cartItem.quantity)
      });
    }

    return {
      ...order,
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
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_repairs_v2');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!
      .from('repair_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRepairsWithCustomers(): Promise<RepairRequestWithCustomer[]> {
    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const customers = await this.getCustomers();
      return repairs.map(r => {
        const customer = customers.find(c => c.id === r.customer_id);
        return {
          ...r,
          customer_name: customer?.name || 'Unknown',
          customer_phone: customer?.phone || '',
          customer_email: customer?.email,
        };
      });
    }

    const { data, error } = await supabase!
      .from('repairs_with_customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getRepairById(repairId: string): Promise<RepairRequestWithCustomer | null> {
    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const repair = repairs.find(r => r.id === repairId || r.repair_id === repairId);
      if (!repair) return null;

      const customer = await this.getCustomerById(repair.customer_id);
      return {
        ...repair,
        customer_name: customer?.name || 'Unknown',
        customer_phone: customer?.phone || '',
        customer_email: customer?.email,
      };
    }

    const { data, error } = await supabase!
      .from('repairs_with_customers')
      .select('*')
      .eq('id', repairId)
      .single();
    
    if (error) return null;
    return data;
  }

  async getRepairByIdAndPhone(repairId: string, phone: string): Promise<RepairRequestWithCustomer | null> {
    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, '');
    
    if (this.useLocalStorage) {
      const repairs = await this.getRepairsWithCustomers();
      return repairs.find(r => {
        const rPhone = r.customer_phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, '');
        return (r.id === repairId || r.repair_id === repairId) && rPhone === normalizedPhone;
      }) || null;
    }

    // Get repair with customer join
    const { data: repairs, error } = await supabase!
      .from('repairs_with_customers')
      .select('*')
      .eq('repair_id', repairId);
    
    if (error || !repairs || repairs.length === 0) return null;
    
    // Find matching phone
    const repair = repairs.find(r => {
      const rPhone = r.customer_phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, '');
      return rPhone === normalizedPhone;
    });
    
    return repair || null;
  }

  async addRepairRequest(
    repair: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'completed_at' | 'notified_customer'>
  ): Promise<RepairRequestWithCustomer> {
    const now = new Date().toISOString();
    const newRepair: RepairRequest = {
      ...repair,
      id: crypto.randomUUID(),
      repair_id: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      notified_customer: false,
      created_at: now,
      updated_at: now,
    };

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      repairs.unshift(newRepair);
      localStorage.setItem('zulfiqar_repairs_v2', JSON.stringify(repairs));
      
      const customer = await this.getCustomerById(repair.customer_id);
      
      // Send WhatsApp confirmation
      const repairWithCustomer: RepairRequestWithCustomer = {
        ...newRepair,
        customer_name: customer?.name || 'Unknown',
        customer_phone: customer?.phone || '',
        customer_email: customer?.email,
      };
      await whatsappService.sendRepairConfirmation(repairWithCustomer);
      
      return {
        ...newRepair,
        customer_name: customer?.name || 'Unknown',
        customer_phone: customer?.phone || '',
        customer_email: customer?.email,
      };
    }

    const { data, error } = await supabase!.from('repair_requests').insert(newRepair).select().single();
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
    const updates: Partial<RepairRequest> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed' || status === 'returned') {
      updates.completed_at = new Date().toISOString();
    }

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const index = repairs.findIndex(r => r.id === repairId);
      if (index !== -1) {
        repairs[index] = { ...repairs[index], ...updates };
        localStorage.setItem('zulfiqar_repairs_v2', JSON.stringify(repairs));
        
        // Send WhatsApp notification
        const repair = repairs[index];
        const customer = await this.getCustomerById(repair.customer_id);
        await this.sendRepairNotification({
          ...repair,
          customer_name: customer?.name || 'Unknown',
          customer_phone: customer?.phone || '',
        });
      }
      return;
    }

    const { data, error } = await supabase!
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
    const fullUpdates = { ...updates, updated_at: new Date().toISOString() };

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const index = repairs.findIndex(r => r.id === repairId);
      if (index !== -1) {
        repairs[index] = { ...repairs[index], ...fullUpdates };
        localStorage.setItem('zulfiqar_repairs_v2', JSON.stringify(repairs));
      }
      return;
    }

    const { error } = await supabase!.from('repair_requests').update(fullUpdates).eq('id', repairId);
    if (error) throw error;
  }

  async deleteRepairRequest(repairId: string): Promise<void> {
    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const filtered = repairs.filter(r => r.id !== repairId);
      localStorage.setItem('zulfiqar_repairs_v2', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase!.from('repair_requests').delete().eq('id', repairId);
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
    return !this.useLocalStorage;
  }

  // ============================================================================
  // MIGRATION HELPERS (v1 to v2)
  // ============================================================================

  async migrateFromV1(): Promise<void> {
    if (!this.useLocalStorage) {
      console.log('Migration only needed for localStorage mode');
      return;
    }

    // Check if already migrated
    const v2Exists = localStorage.getItem('zulfiqar_products_v2');
    if (v2Exists) {
      console.log('Already migrated to v2');
      return;
    }

    console.log('Starting migration from v1 to v2...');

    // Migrate categories
    const v1Categories = localStorage.getItem('zulfiqar_categories');
    if (v1Categories) {
      const categories: any[] = JSON.parse(v1Categories);
      const migratedCategories: Category[] = categories.map(c => ({
        id: c.id || crypto.randomUUID(),
        name: c.name,
        icon: c.icon,
        product_count: c.productCount || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      localStorage.setItem('zulfiqar_categories_v2', JSON.stringify(migratedCategories));
      console.log(`Migrated ${migratedCategories.length} categories`);
    }

    // Migrate products
    const v1Products = localStorage.getItem('zulfiqar_products');
    if (v1Products) {
      const products: any[] = JSON.parse(v1Products);
      const categories: Category[] = JSON.parse(localStorage.getItem('zulfiqar_categories_v2') || '[]');
      
      const migratedProducts: Product[] = products.map(p => {
        // Find category by name and get its ID
        const category = categories.find(c => c.name === p.category);
        return {
          id: p.id || crypto.randomUUID(),
          name: p.name,
          category_id: category?.id || '00000000-0000-0000-0000-000000000000',
          price: p.price,
          original_price: p.originalPrice,
          image: p.image,
          description: p.description,
          specs: p.specs || [],
          stock: p.stock,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          featured: p.featured,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
      localStorage.setItem('zulfiqar_products_v2', JSON.stringify(migratedProducts));
      console.log(`Migrated ${migratedProducts.length} products`);
    }

    // Migrate repairs (requires customer creation)
    const v1Repairs = localStorage.getItem('zulfiqar_repairs');
    if (v1Repairs) {
      const repairs: any[] = JSON.parse(v1Repairs);
      const migratedCustomers: Customer[] = [];
      const migratedRepairs: RepairRequest[] = [];

      for (const r of repairs) {
        // Create customer for each repair
        const customer: Customer = {
          id: crypto.randomUUID(),
          name: r.customerName,
          email: r.email,
          phone: r.phone,
          address: '',
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: r.updatedAt || new Date().toISOString(),
        };
        migratedCustomers.push(customer);

        const repair: RepairRequest = {
          id: r.id || crypto.randomUUID(),
          repair_id: r.id?.startsWith('REP-') ? r.id : `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          customer_id: customer.id,
          device_brand: r.deviceBrand,
          device_model: r.deviceModel,
          device_type: r.deviceType,
          issue: r.issue,
          service_type: r.serviceType,
          status: r.status,
          estimated_cost: r.estimatedCost,
          final_cost: r.finalCost,
          notes: r.notes,
          technician: r.technician,
          notified_customer: r.notifiedCustomer || false,
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: r.updatedAt || new Date().toISOString(),
          completed_at: r.completedAt,
        };
        migratedRepairs.push(repair);
      }

      localStorage.setItem('zulfiqar_customers_v2', JSON.stringify(migratedCustomers));
      localStorage.setItem('zulfiqar_repairs_v2', JSON.stringify(migratedRepairs));
      console.log(`Migrated ${migratedRepairs.length} repairs and created ${migratedCustomers.length} customers`);
    }

    console.log('Migration complete!');
  }
}

// Export singleton instance
export const db = new DatabaseService();
