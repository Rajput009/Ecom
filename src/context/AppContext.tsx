import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product, PCBuild, Order, RepairRequest, Category, RepairStatus } from '../types';
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
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => Product;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  
  // Categories (Admin)
  categories: Category[];
  addCategory: (name: string) => void;
  updateCategory: (categoryId: string, name: string) => void;
  deleteCategory: (categoryId: string) => void;
  
  // Repair Requests (Admin)
  repairRequests: RepairRequest[];
  addRepairRequest: (request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'notifiedCustomer'>) => RepairRequest;
  updateRepairStatus: (requestId: string, status: RepairStatus) => void;
  updateRepairRequest: (requestId: string, updates: Partial<RepairRequest>) => void;
  deleteRepairRequest: (requestId: string) => void;
  
  // Admin
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'zulfiqar_products',
  ORDERS: 'zulfiqar_orders',
  REPAIRS: 'zulfiqar_repairs',
  CATEGORIES: 'zulfiqar_categories',
};

// Initial categories
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Graphics Cards', productCount: 0 },
  { id: 'cat-2', name: 'Processors', productCount: 0 },
  { id: 'cat-3', name: 'Memory', productCount: 0 },
  { id: 'cat-4', name: 'Storage', productCount: 0 },
  { id: 'cat-5', name: 'Motherboards', productCount: 0 },
  { id: 'cat-6', name: 'Power Supplies', productCount: 0 },
  { id: 'cat-7', name: 'Cases', productCount: 0 },
  { id: 'cat-8', name: 'Cooling', productCount: 0 },
  { id: 'cat-9', name: 'Monitors', productCount: 0 },
  { id: 'cat-10', name: 'Peripherals', productCount: 0 },
  { id: 'cat-11', name: 'Laptops', productCount: 0 },
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
    // Calculate initial product counts
    return initialCategories.map(cat => ({
      ...cat,
      productCount: initialProducts.filter(p => p.category === cat.name).length
    }));
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-001',
        customer: 'Ahmed Khan',
        email: 'ahmed@email.com',
        phone: '+92 300 1234567',
        address: '123 Main Street, Lahore',
        items: [],
        total: 2499,
        status: 'processing',
        date: '2024-01-15'
      },
      {
        id: 'ORD-002',
        customer: 'Sara Ali',
        email: 'sara@email.com',
        phone: '+92 321 7654321',
        address: '456 Tech Plaza, Karachi',
        items: [],
        total: 1599,
        status: 'shipped',
        date: '2024-01-14'
      },
      {
        id: 'ORD-003',
        customer: 'Usman Malik',
        email: 'usman@email.com',
        phone: '+92 333 9876543',
        address: '789 IT Tower, Islamabad',
        items: [],
        total: 899,
        status: 'pending',
        date: '2024-01-16'
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
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  // Product Admin functions
  const addProduct = (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${generateId()}`,
      rating: 0,
      reviews: 0,
    };
    setProducts(prev => [newProduct, ...prev]);
    
    // Update category count
    setCategories(prev =>
      prev.map(cat =>
        cat.name === product.category
          ? { ...cat, productCount: cat.productCount + 1 }
          : cat
      )
    );
    
    return newProduct;
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === productId ? { ...product, ...updates } : product
      )
    );
    
    // Update category counts if category changed
    if (updates.category) {
      updateCategoryCounts();
    }
  };

  const deleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    // Update category count
    if (product) {
      setCategories(prev =>
        prev.map(cat =>
          cat.name === product.category
            ? { ...cat, productCount: Math.max(0, cat.productCount - 1) }
            : cat
        )
      );
    }
  };

  // Category Admin functions
  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: `cat-${generateId()}`,
      name,
      productCount: 0,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (categoryId: string, name: string) => {
    const oldCategory = categories.find(c => c.id === categoryId);
    if (!oldCategory) return;
    
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, name } : cat
      )
    );
    
    // Update products with old category name
    setProducts(prev =>
      prev.map(product =>
        product.category === oldCategory.name
          ? { ...product, category: name }
          : product
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.productCount > 0) {
      // Move products to "Uncategorized" or prevent deletion
      const uncategorized = categories.find(c => c.name === 'Uncategorized');
      if (!uncategorized) {
        addCategory('Uncategorized');
      }
      setProducts(prev =>
        prev.map(product =>
          product.category === category.name
            ? { ...product, category: 'Uncategorized' }
            : product
        )
      );
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const updateCategoryCounts = () => {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        productCount: products.filter(p => p.category === cat.name).length
      }))
    );
  };

  // Repair Request functions
  const addRepairRequest = (request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'notifiedCustomer'>) => {
    const newRequest: RepairRequest = {
      ...request,
      id: `REP-${generateId().toUpperCase()}`,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notifiedCustomer: false,
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
              updatedAt: new Date().toISOString(),
              completedAt: status === 'returned' || status === 'cancelled' 
                ? new Date().toISOString() 
                : request.completedAt,
            }
          : request
      )
    );
  };

  const updateRepairRequest = (requestId: string, updates: Partial<RepairRequest>) => {
    setRepairRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, ...updates, updatedAt: new Date().toISOString() }
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
