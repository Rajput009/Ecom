export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  specs: string[];
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

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

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

export type RepairStatus = 
  | 'received' 
  | 'diagnosing' 
  | 'waiting-parts' 
  | 'in-progress' 
  | 'completed' 
  | 'returned' 
  | 'cancelled';

export type DeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export interface RepairRequest {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  deviceBrand: string;
  deviceModel: string;
  deviceType: DeviceType;
  issue: string;
  serviceType: string;
  status: RepairStatus;
  estimatedCost?: number;
  finalCost?: number;
  notes?: string;
  technician?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notifiedCustomer: boolean;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
  icon?: string;
}

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'repairs' | 'categories' | 'customers' | 'settings';
