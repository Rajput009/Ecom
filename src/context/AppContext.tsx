import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { CartItem, Product, PCBuild, Order, RepairRequest, Category, RepairStatus, Customer } from '../types';
import { db } from '../services/database';

// Cache duration in milliseconds (30 seconds)
const CACHE_DURATION = 30 * 1000;

interface CacheTimestamps {
  products: number;
  categories: number;
  orders: number;
  repairRequests: number;
  customers: number;
}

interface AppContextType {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // PC Builder
  pcBuild: PCBuild;
  setPcBuild: React.Dispatch<React.SetStateAction<PCBuild>>;

  // Orders
  orders: Order[];
  refreshOrders: (force?: boolean) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;

  // Products
  products: Product[];
  refreshProducts: (force?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>) => Promise<Product>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Categories
  categories: Category[];
  refreshCategories: (force?: boolean) => Promise<void>;
  addCategory: (name: string, icon?: string) => Promise<void>;
  updateCategory: (categoryId: string, name: string, icon?: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Repair Requests
  repairRequests: RepairRequest[];
  refreshRepairRequests: (force?: boolean) => Promise<void>;
  addRepairRequest: (request: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'notified_customer'>) => Promise<RepairRequest>;
  updateRepairStatus: (requestId: string, status: RepairStatus) => Promise<void>;
  updateRepairRequest: (requestId: string, updates: Partial<RepairRequest>) => Promise<void>;
  deleteRepairRequest: (requestId: string) => Promise<void>;

  // Customers
  customers: Customer[];
  refreshCustomers: (force?: boolean) => Promise<void>;

  // States
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CART: 'zulfiqar_cart_v2',
  PC_BUILD: 'zulfiqar_pc_build_v2',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });
  const [pcBuild, setPcBuild] = useState<PCBuild>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PC_BUILD);
    return saved ? JSON.parse(saved) : {};
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cache timestamps using useRef to persist across renders without triggering re-renders
  const cacheTimestamps = useRef<CacheTimestamps>({
    products: 0,
    categories: 0,
    orders: 0,
    repairRequests: 0,
    customers: 0,
  });

  // Helper to check if cache is valid
  const isCacheValid = (key: keyof CacheTimestamps): boolean => {
    const timestamp = cacheTimestamps.current[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PC_BUILD, JSON.stringify(pcBuild));
  }, [pcBuild]);

  // Data Fetching with Cache
  const refreshProducts = useCallback(async (force: boolean = false) => {
    if (!force && isCacheValid('products') && products.length > 0) {
      return; // Use cached data
    }
    const data = await db.getProducts();
    setProducts(data);
    cacheTimestamps.current.products = Date.now();
  }, [products.length]);

  const refreshCategories = useCallback(async (force: boolean = false) => {
    if (!force && isCacheValid('categories') && categories.length > 0) {
      return; // Use cached data
    }
    const data = await db.getCategories();
    setCategories(data);
    cacheTimestamps.current.categories = Date.now();
  }, [categories.length]);

  const refreshOrders = useCallback(async (force: boolean = false) => {
    if (!force && isCacheValid('orders') && orders.length > 0) {
      return; // Use cached data
    }
    const data = await db.getOrders();
    setOrders(data);
    cacheTimestamps.current.orders = Date.now();
  }, [orders.length]);

  const refreshRepairRequests = useCallback(async (force: boolean = false) => {
    if (!force && isCacheValid('repairRequests') && repairRequests.length > 0) {
      return; // Use cached data
    }
    const data = await db.getRepairRequests();
    setRepairRequests(data);
    cacheTimestamps.current.repairRequests = Date.now();
  }, [repairRequests.length]);

  const refreshCustomers = useCallback(async (force: boolean = false) => {
    if (!force && isCacheValid('customers') && customers.length > 0) {
      return; // Use cached data
    }
    const data = await db.getCustomers();
    setCustomers(data);
    cacheTimestamps.current.customers = Date.now();
  }, [customers.length]);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          refreshProducts(),
          refreshCategories()
        ]);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [refreshProducts, refreshCategories]);

  // Product Actions - Force refresh after mutations
  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>) => {
    const newProduct = await db.addProduct(productData);
    await refreshProducts(true); // Force refresh
    await refreshCategories(true); // Since product count might have changed
    return newProduct;
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    await db.updateProduct(productId, updates);
    await refreshProducts(true);
    await refreshCategories(true);
  };

  const deleteProduct = async (productId: string) => {
    await db.deleteProduct(productId);
    await refreshProducts(true);
    await refreshCategories(true);
  };

  // Category Actions - Force refresh after mutations
  const addCategory = async (name: string, icon?: string) => {
    await db.addCategory(name, icon);
    await refreshCategories(true);
  };

  const updateCategory = async (categoryId: string, name: string, icon?: string) => {
    await db.updateCategory(categoryId, name, icon);
    await refreshCategories(true);
    await refreshProducts(true); // Category name might be shown in product list
  };

  const deleteCategory = async (categoryId: string) => {
    await db.deleteCategory(categoryId);
    await refreshCategories(true);
  };

  // Order Actions - Force refresh after mutations
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await db.updateOrderStatus(orderId, status);
    await refreshOrders(true);
  };

  // Repair Actions - Force refresh after mutations
  const addRepairRequest = async (request: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'notified_customer'>) => {
    const newRequest = await db.addRepairRequest(request);
    await refreshRepairRequests(true);
    return newRequest;
  };

  const updateRepairStatus = async (requestId: string, status: RepairStatus) => {
    await db.updateRepairStatus(requestId, status);
    await refreshRepairRequests(true);
  };

  const updateRepairRequest = async (requestId: string, updates: Partial<RepairRequest>) => {
    await db.updateRepairRequest(requestId, updates);
    await refreshRepairRequests(true);
  };

  const deleteRepairRequest = async (requestId: string) => {
    await db.deleteRepairRequest(requestId);
    await refreshRepairRequests(true);
  };

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        pcBuild,
        setPcBuild,
        orders,
        refreshOrders,
        updateOrderStatus,
        products,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        repairRequests,
        refreshRepairRequests,
        addRepairRequest,
        updateRepairStatus,
        updateRepairRequest,
        deleteRepairRequest,
        customers,
        refreshCustomers,
        isLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
