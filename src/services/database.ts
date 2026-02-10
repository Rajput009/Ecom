import { createClient } from '@supabase/supabase-js';
import { Product, Category, RepairRequest, RepairStatus, Order } from '../types';
import { whatsappService } from './whatsapp';

// Supabase configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

// Create Supabase client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database service class
class DatabaseService {
  private useLocalStorage: boolean;

  constructor() {
    this.useLocalStorage = !isSupabaseConfigured;
    
    if (this.useLocalStorage) {
      console.warn('Supabase not configured. Using localStorage fallback.');
    } else {
      console.log('Supabase connected');
    }
  }

  // ==================== PRODUCTS ====================
  
  async getProducts(): Promise<Product[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_products');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('products').select('*');
    if (error) throw error;
    return data || [];
  }

  async addProduct(product: Omit<Product, 'id' | 'rating' | 'reviews'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      rating: 0,
      reviews: 0,
    };

    if (this.useLocalStorage) {
      const products = await this.getProducts();
      products.push(newProduct);
      localStorage.setItem('zulfiqar_products', JSON.stringify(products));
      return newProduct;
    }

    const { data, error } = await supabase!.from('products').insert(newProduct).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    if (this.useLocalStorage) {
      const products = await this.getProducts();
      const index = products.findIndex(p => p.id === productId);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        localStorage.setItem('zulfiqar_products', JSON.stringify(products));
      }
      return;
    }

    const { error } = await supabase!.from('products').update(updates).eq('id', productId);
    if (error) throw error;
  }

  async deleteProduct(productId: string): Promise<void> {
    if (this.useLocalStorage) {
      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== productId);
      localStorage.setItem('zulfiqar_products', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase!.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  // ==================== CATEGORIES ====================

  async getCategories(): Promise<Category[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_categories');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('categories').select('*');
    if (error) throw error;
    return data || [];
  }

  async addCategory(name: string): Promise<Category> {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      productCount: 0,
    };

    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      categories.push(newCategory);
      localStorage.setItem('zulfiqar_categories', JSON.stringify(categories));
      return newCategory;
    }

    const { data, error } = await supabase!.from('categories').insert(newCategory).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(categoryId: string, name: string): Promise<void> {
    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      const index = categories.findIndex(c => c.id === categoryId);
      if (index !== -1) {
        const oldName = categories[index].name;
        categories[index].name = name;
        localStorage.setItem('zulfiqar_categories', JSON.stringify(categories));
        
        // Update products with old category name
        const products = await this.getProducts();
        products.forEach(p => {
          if (p.category === oldName) p.category = name;
        });
        localStorage.setItem('zulfiqar_products', JSON.stringify(products));
      }
      return;
    }

    const { error } = await supabase!.from('categories').update({ name }).eq('id', categoryId);
    if (error) throw error;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (this.useLocalStorage) {
      const categories = await this.getCategories();
      const category = categories.find(c => c.id === categoryId);
      
      if (category && category.productCount > 0) {
        // Move products to Uncategorized
        const products = await this.getProducts();
        products.forEach(p => {
          if (p.category === category.name) p.category = 'Uncategorized';
        });
        localStorage.setItem('zulfiqar_products', JSON.stringify(products));
      }
      
      const filtered = categories.filter(c => c.id !== categoryId);
      localStorage.setItem('zulfiqar_categories', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase!.from('categories').delete().eq('id', categoryId);
    if (error) throw error;
  }

  // ==================== REPAIR REQUESTS ====================

  async getRepairRequests(): Promise<RepairRequest[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_repairs');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('repair_requests').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addRepairRequest(
    request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'notifiedCustomer'>
  ): Promise<RepairRequest> {
    const now = new Date().toISOString();
    const newRequest: RepairRequest = {
      ...request,
      id: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: 'received',
      createdAt: now,
      updatedAt: now,
      notifiedCustomer: false,
    };

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      repairs.unshift(newRequest);
      localStorage.setItem('zulfiqar_repairs', JSON.stringify(repairs));
      
      // Send WhatsApp confirmation
      await whatsappService.sendRepairConfirmation(newRequest);
      
      return newRequest;
    }

    const { data, error } = await supabase!.from('repair_requests').insert(newRequest).select().single();
    if (error) throw error;

    // Send WhatsApp confirmation
    await whatsappService.sendRepairConfirmation(data);

    return data;
  }

  async updateRepairStatus(repairId: string, status: RepairStatus): Promise<void> {
    const now = new Date().toISOString();
    const updates: Partial<RepairRequest> = {
      status,
      updatedAt: now,
    };

    if (status === 'completed' || status === 'returned') {
      updates.completedAt = now;
    }

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const index = repairs.findIndex(r => r.id === repairId);
      if (index !== -1) {
        repairs[index] = { ...repairs[index], ...updates };
        localStorage.setItem('zulfiqar_repairs', JSON.stringify(repairs));
        
        // Send WhatsApp notification
        await this.sendRepairNotification(repairs[index]);
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
      await this.sendRepairNotification(data);
    }
  }

  async updateRepairRequest(repairId: string, updates: Partial<RepairRequest>): Promise<void> {
    const now = new Date().toISOString();
    const fullUpdates = { ...updates, updatedAt: now };

    if (this.useLocalStorage) {
      const repairs = await this.getRepairRequests();
      const index = repairs.findIndex(r => r.id === repairId);
      if (index !== -1) {
        repairs[index] = { ...repairs[index], ...fullUpdates };
        localStorage.setItem('zulfiqar_repairs', JSON.stringify(repairs));
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
      localStorage.setItem('zulfiqar_repairs', JSON.stringify(filtered));
      return;
    }

    const { error } = await supabase!.from('repair_requests').delete().eq('id', repairId);
    if (error) throw error;
  }

  async getRepairByIdAndPhone(repairId: string, phone: string): Promise<RepairRequest | null> {
    const repairs = await this.getRepairRequests();
    
    // Normalize phone numbers for comparison
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, '');
    
    return repairs.find(r => {
      const rPhone = r.phone.replace(/\D/g, '').replace(/^0/, '').replace(/^92/, '');
      return r.id === repairId && rPhone === normalizedPhone;
    }) || null;
  }

  // Send appropriate WhatsApp notification based on status
  private async sendRepairNotification(repair: RepairRequest): Promise<void> {
    switch (repair.status) {
      case 'completed':
        await whatsappService.sendRepairComplete(repair);
        break;
      case 'returned':
        await whatsappService.sendTextMessage(
          repair.phone,
          `✅ Your repair ${repair.id} is ready for pickup!\n\nPlease visit us at:\n📍 Main Boulevard, Lahore\n⏰ Open 10 AM - 10 PM\n\nBring your token number.`
        );
        break;
      case 'cancelled':
        await whatsappService.sendTextMessage(
          repair.phone,
          `⚠️ Repair ${repair.id} has been cancelled.\n\nPlease contact us for more information:\n📞 0300-1234567`
        );
        break;
      default:
        // For other status updates
        await whatsappService.sendStatusUpdate(repair);
    }
  }

  // ==================== ORDERS ====================

  async getOrders(): Promise<Order[]> {
    if (this.useLocalStorage) {
      const saved = localStorage.getItem('zulfiqar_orders');
      return saved ? JSON.parse(saved) : [];
    }

    const { data, error } = await supabase!.from('orders').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async addOrder(order: Order): Promise<void> {
    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      orders.unshift(order);
      localStorage.setItem('zulfiqar_orders', JSON.stringify(orders));
      return;
    }

    const { error } = await supabase!.from('orders').insert(order);
    if (error) throw error;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (this.useLocalStorage) {
      const orders = await this.getOrders();
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index].status = status;
        localStorage.setItem('zulfiqar_orders', JSON.stringify(orders));
      }
      return;
    }

    const { error } = await supabase!.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
  }

  // ==================== UTILITY ====================

  isConfigured(): boolean {
    return !this.useLocalStorage;
  }
}

// Export singleton
export const db = new DatabaseService();
