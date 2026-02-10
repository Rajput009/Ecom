import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product, PCBuild, Order, RepairRequest, Category, RepairStatus, Customer } from '../types';
import { products as initialProducts } from '../data/products';

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
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Products (Admin)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Categories (Admin)
  categories: Category[];
  addCategory: (name: string, icon?: string) => void;
  updateCategory: (categoryId: string, name: string, icon?: string) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Repair Requests (Admin)
  repairRequests: RepairRequest[];
  addRepairRequest: (request: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'status' | 'notified_customer'>) => RepairRequest;
  updateRepairStatus: (requestId: string, status: RepairStatus) => void;
  updateRepairRequest: (requestId: string, updates: Partial<RepairRequest>) => void;
  deleteRepairRequest: (requestId: string) => void;
  
  // Customers (Admin)
  customers: Customer[];
  
  // Admin
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys (v2 for new schema)
const STORAGE_KEYS = {
  PRODUCTS: 'zulfiqar_products_v2',
  ORDERS: 'zulfiqar_orders_v2',
  REPAIRS: 'zulfiqar_repairs_v2',
  CATEGORIES: 'zulfiqar_categories_v2',
  CUSTOMERS: 'zulfiqar_customers_v2',
};

// Initial categories with icons
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Graphics Cards', icon: 'gpu', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-2', name: 'Processors', icon: 'cpu', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-3', name: 'Memory', icon: 'memory', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-4', name: 'Storage', icon: 'hard-drive', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-5', name: 'Motherboards', icon: 'motherboard', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-6', name: 'Power Supplies', icon: 'power', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-7', name: 'Cases', icon: 'box', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-8', name: 'Cooling', icon: 'fan', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-9', name: 'Monitors', icon: 'monitor', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-10', name: 'Peripherals', icon: 'mouse', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cat-11', name: 'Laptops', icon: 'laptop', product_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load from localStorage or use initial data
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pcBuild, setPcBuild] = useState<PCBuild>({});
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (saved) return JSON.parse(saved);
    // Calculate initial product counts based on category_id
    return initialCategories.map(cat => ({
      ...cat,
      product_count: initialProducts.filter(p => p.category_id === cat.id).length
    }));
  });
  
  const [customers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'ord-001',
        order_number: 'ORD-20240210-0001',
        customer_id: 'cust-001',
        total: 2499,
        shipping_cost: 0,
        tax: 199.92,
        status: 'processing',
        payment_status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'ord-002',
        order_number: 'ORD-20240209-0001',
        customer_id: 'cust-002',
        total: 1599,
        shipping_cost: 25,
        tax: 127.92,
        status: 'shipped',
        payment_status: 'completed',
        tracking_number: 'TRK123456789',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'ord-003',
        order_number: 'ORD-20240208-0001',
        customer_id: 'cust-003',
        total: 899,
        shipping_cost: 25,
        tax: 71.92,
        status: 'pending',
        payment_status: 'pending',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
  });
  
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPAIRS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdmin, setIsAdmin] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPAIRS, JSON.stringify(repairRequests));
  }, [repairRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
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
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order functions
  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId 
          ? { 
              ...order, 
              status, 
              updated_at: new Date().toISOString(),
              completed_at: status === 'delivered' ? new Date().toISOString() : order.completed_at
            } 
          : order
      )
    );
  };

  // Product Admin functions
  const addProduct = (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: `prod-${generateId()}`,
      rating: 0,
      reviews: 0,
      created_at: now,
      updated_at: now,
    };
    setProducts(prev => [newProduct, ...prev]);
    
    // Update category count
    setCategories(prev =>
      prev.map(cat =>
        cat.id === product.category_id
          ? { ...cat, product_count: cat.product_count + 1 }
          : cat
      )
    );
    
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    const oldProduct = products.find(p => p.id === productId);
    
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, ...updates, updated_at: new Date().toISOString() } : product
      )
    );
    
    // Update category counts if category changed
    if (updates.category_id && oldProduct && updates.category_id !== oldProduct.category_id) {
      setCategories(prev =>
        prev.map(cat => {
          if (cat.id === oldProduct.category_id) {
            return { ...cat, product_count: Math.max(0, cat.product_count - 1) };
          }
          if (cat.id === updates.category_id) {
            return { ...cat, product_count: cat.product_count + 1 };
          }
          return cat;
        })
      );
    }
  };

  const deleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    // Update category count
    if (product) {
      setCategories(prev =>
        prev.map(cat =>
          cat.id === product.category_id
            ? { ...cat, product_count: Math.max(0, cat.product_count - 1) }
            : cat
        )
      );
    }
  };

  // Category Admin functions
  const addCategory = (name: string, icon?: string) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      id: `cat-${generateId()}`,
      name,
      icon,
      product_count: 0,
      created_at: now,
      updated_at: now,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (categoryId: string, name: string, icon?: string) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, name, icon, updated_at: new Date().toISOString() } : cat
      )
    );
    // Note: With FK constraints, we don't need to update products - the relationship is by ID
  };

  const deleteCategory = (categoryId: string) => {
    // Check if products exist in this category
    const productsInCategory = products.filter(p => p.category_id === categoryId);
    
    if (productsInCategory.length > 0) {
      // Move products to "Uncategorized" category
      const uncategorized = categories.find(c => c.name === 'Uncategorized');
      let uncategorizedId = uncategorized?.id;
      
      if (!uncategorizedId) {
        // Create Uncategorized category
        const now = new Date().toISOString();
        const newUncategorized: Category = {
          id: `cat-${generateId()}`,
          name: 'Uncategorized',
          icon: 'help-circle',
          product_count: productsInCategory.length,
          created_at: now,
          updated_at: now,
        };
        uncategorizedId = newUncategorized.id;
        setCategories(prev => [...prev, newUncategorized]);
      } else {
        // Update count
        setCategories(prev =>
          prev.map(cat =>
            cat.id === uncategorizedId
              ? { ...cat, product_count: cat.product_count + productsInCategory.length }
              : cat
          )
        );
      }
      
      // Update all products in this category
      setProducts(prev =>
        prev.map(product =>
          product.category_id === categoryId
            ? { ...product, category_id: uncategorizedId!, updated_at: new Date().toISOString() }
            : product
        )
      );
    }
    
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  // Repair Request functions
  const addRepairRequest = (request: Omit<RepairRequest, 'id' | 'repair_id' | 'created_at' | 'updated_at' | 'status' | 'notified_customer'>) => {
    const now = new Date().toISOString();
    const newRequest: RepairRequest = {
      ...request,
      id: crypto.randomUUID(),
      repair_id: `REP-${generateId().toUpperCase()}`,
      status: 'received',
      notified_customer: false,
      created_at: now,
      updated_at: now,
    };
    setRepairRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const updateRepairStatus = (requestId: string, status: RepairStatus) => {
    setRepairRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? {
              ...request,
              status,
              updated_at: new Date().toISOString(),
              completed_at: status === 'completed' || status === 'returned' || status === 'cancelled'
                ? new Date().toISOString() 
                : request.completed_at,
            }
          : request
      )
    );
  };

  const updateRepairRequest = (requestId: string, updates: Partial<RepairRequest>) => {
    setRepairRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, ...updates, updated_at: new Date().toISOString() }
          : request
      )
    );
  };

  const deleteRepairRequest = (requestId: string) => {
    setRepairRequests(prev => prev.filter(r => r.id !== requestId));
  };

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
        addOrder,
        updateOrderStatus,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        repairRequests,
        addRepairRequest,
        updateRepairStatus,
        updateRepairRequest,
        deleteRepairRequest,
        customers,
        isAdmin,
        setIsAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
