import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdminTab, Product, Category, RepairRequest, RepairStatus, Order, Customer } from '../types';
import { 
  LayoutDashboard, Package, ShoppingCart, Wrench, Tags, Settings, 
  Plus, Search, Edit2, Trash2, X, Check,
  DollarSign, AlertCircle,
  ArrowLeft, Filter, LogOut, BarChart3
} from 'lucide-react';
import { cn } from '../utils/cn';

const repairStatusColors: Record<RepairStatus, string> = {
  'received': 'bg-blue-500',
  'diagnosing': 'bg-yellow-500',
  'waiting-parts': 'bg-orange-500',
  'in-progress': 'bg-purple-500',
  'completed': 'bg-green-500',
  'returned': 'bg-gray-500',
  'cancelled': 'bg-red-500',
};

const orderStatusColors: Record<Order['status'], string> = {
  'pending': 'bg-yellow-500',
  'processing': 'bg-blue-500',
  'shipped': 'bg-purple-500',
  'delivered': 'bg-green-500',
  'cancelled': 'bg-red-500',
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper to get customer name by ID
const getCustomerName = (customerId: string, customers: Customer[]) => {
  const customer = customers.find(c => c.id === customerId);
  return customer?.name || 'Unknown';
};

// Helper to get category name by ID
const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Uncategorized';
};

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { setIsAdmin, orders, products, repairRequests } = useApp();

  // Calculate stats
  const stats = useMemo(() => ({
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalRepairs: repairRequests.length,
    pendingRepairs: repairRequests.filter(r => ['received', 'diagnosing', 'waiting-parts'].includes(r.status)).length,
    lowStockProducts: products.filter(p => p.stock < 5).length,
  }), [orders, products, repairRequests]);

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
    { id: 'repairs' as AdminTab, label: 'Repairs', icon: Wrench },
    { id: 'categories' as AdminTab, label: 'Categories', icon: Tags },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="bg-[#111113] border-b border-[#27272a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 text-[#a1a1aa] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Store</span>
            </button>
            <div className="h-6 w-px bg-[#27272a]" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#a855f7] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#a1a1aa] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-[#111113] border-r border-[#27272a] min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  activeTab === id
                    ? "bg-[#3b82f6] text-white"
                    : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'repairs' && <RepairsTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ stats }: { stats: any }) {
  const { orders, repairRequests, products, customers } = useApp();

  const recentOrders = orders.slice(0, 5);
  const recentRepairs = repairRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          subtitle={`${stats.lowStockProducts} low stock`}
          color="purple"
        />
        <StatCard
          title="Repair Jobs"
          value={stats.totalRepairs}
          icon={Wrench}
          subtitle={`${stats.pendingRepairs} pending`}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-[#27272a] last:border-0">
                  <div>
                    <p className="font-medium text-sm">{order.order_number}</p>
                    <p className="text-xs text-[#71717a]">{getCustomerName(order.customer_id, customers)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">${order.total}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full text-white", orderStatusColors[order.status])}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#71717a] text-sm">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Repair Requests</h3>
          <div className="space-y-3">
            {recentRepairs.length > 0 ? (
              recentRepairs.map(repair => (
                <div key={repair.id} className="flex items-center justify-between py-2 border-b border-[#27272a] last:border-0">
                  <div>
                    <p className="font-medium text-sm">{repair.repair_id}</p>
                    <p className="text-xs text-[#71717a]">{repair.device_brand} {repair.device_model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#71717a]">{getCustomerName(repair.customer_id, customers)}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full text-white", repairStatusColors[repair.status])}>
                      {repair.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#71717a] text-sm">No repair requests yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {products.filter(p => p.stock < 5).length > 0 && (
        <div className="bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          <div>
            <p className="font-medium text-sm">Low Stock Alert</p>
            <p className="text-xs text-[#a1a1aa]">
              {products.filter(p => p.stock < 5).length} products are running low on stock
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, subtitle, color }: any) {
  const colorClasses = {
    green: 'text-[#22c55e]',
    blue: 'text-[#3b82f6]',
    purple: 'text-[#a855f7]',
    orange: 'text-[#f97316]',
  };

  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#71717a]">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-[#71717a] mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-3 rounded-lg bg-opacity-10", colorClasses[color as keyof typeof colorClasses])}>
          <Icon className={cn("w-5 h-5", colorClasses[color as keyof typeof colorClasses])} />
        </div>
      </div>
    </div>
  );
}

// Products Tab
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct, categories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getCategoryName(p.category_id, categories).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#18181b] text-xs text-[#71717a] uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Price</th>
                <th className="px-6 py-3 text-left">Stock</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-[#18181b]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-[#71717a]">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-[#18181b] rounded">{getCategoryName(product.category_id, categories)}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      product.stock > 20 ? 'text-[#22c55e] bg-[#22c55e]/10' :
                      product.stock > 5 ? 'text-[#f59e0b] bg-[#f59e0b]/10' :
                      'text-[#ef4444] bg-[#ef4444]/10'
                    )}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-[#71717a] hover:text-[#3b82f6] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-[#71717a] hover:text-[#ef4444] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={(product: Partial<Product>) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, product);
            } else {
              addProduct(product as Omit<Product, 'id' | 'rating' | 'reviews' | 'created_at' | 'updated_at'>);
            }
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({ product, categories, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category_id: product?.category_id || categories[0]?.id || '',
    price: product?.price || 0,
    original_price: product?.original_price || 0,
    stock: product?.stock || 0,
    description: product?.description || '',
    image: product?.image || '',
    specs: product?.specs?.join(', ') || '',
    featured: product?.featured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      specs: formData.specs.split(',').map((s: string) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#111113] border border-[#27272a] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <h2 className="text-lg font-semibold">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-[#71717a] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Category</label>
            <select
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
            >
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#71717a] mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#71717a] mb-1">Original Price (optional)</label>
              <input
                type="number"
                value={formData.original_price}
                onChange={e => setFormData({ ...formData, original_price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Stock</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6] resize-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Specs (comma separated)</label>
            <input
              type="text"
              value={formData.specs}
              onChange={e => setFormData({ ...formData, specs: e.target.value })}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white focus:outline-none focus:border-[#3b82f6]"
              placeholder="e.g. 16GB RAM, 512GB SSD, RTX 4060"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded border-[#27272a]"
            />
            <label htmlFor="featured" className="text-sm">Featured Product</label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#18181b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Orders Tab
function OrdersTab() {
  const { orders, updateOrderStatus, customers } = useApp();

  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#18181b] text-xs text-[#71717a] uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Order ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-[#18181b]">
                <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                <td className="px-6 py-4 text-sm">{getCustomerName(order.customer_id, customers)}</td>
                <td className="px-6 py-4 text-sm text-[#71717a]">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4 text-sm font-mono">${order.total}</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                    className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Repairs Tab
function RepairsTab() {
  const { repairRequests, updateRepairStatus, deleteRepairRequest, updateRepairRequest, customers } = useApp();
  const [filter, setFilter] = useState<RepairStatus | 'all'>('all');
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);

  const filteredRepairs = filter === 'all' 
    ? repairRequests 
    : repairRequests.filter(r => r.status === filter);

  const statusOptions: RepairStatus[] = [
    'received', 'diagnosing', 'waiting-parts', 'in-progress', 'completed', 'returned', 'cancelled'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#71717a]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as RepairStatus | 'all')}
            className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#18181b] text-xs text-[#71717a] uppercase">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Device</th>
                <th className="px-6 py-3 text-left">Service</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredRepairs.map(repair => (
                <tr key={repair.id} className="hover:bg-[#18181b]">
                  <td className="px-6 py-4 text-sm font-mono">{repair.repair_id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm">{getCustomerName(repair.customer_id, customers)}</p>
                      <p className="text-xs text-[#71717a]">{customers.find(c => c.id === repair.customer_id)?.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {repair.device_brand} {repair.device_model}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#71717a]">{repair.service_type}</td>
                  <td className="px-6 py-4">
                    <select
                      value={repair.status}
                      onChange={(e) => updateRepairStatus(repair.id, e.target.value as RepairStatus)}
                      className="bg-[#18181b] border border-[#27272a] rounded px-2 py-1 text-sm"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRepair(repair)}
                        className="p-2 text-[#71717a] hover:text-[#3b82f6]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this repair request?')) {
                            deleteRepairRequest(repair.id);
                          }
                        }}
                        className="p-2 text-[#71717a] hover:text-[#ef4444]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {repairRequests.length === 0 && (
        <div className="text-center py-12 text-[#71717a]">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No repair requests yet</p>
          <p className="text-sm mt-1">Repair requests will appear here when customers submit them</p>
        </div>
      )}

      {/* Repair Detail Modal */}
      {selectedRepair && (
        <RepairDetailModal
          repair={selectedRepair}
          customers={customers}
          onClose={() => setSelectedRepair(null)}
          onUpdate={(updates: Partial<RepairRequest>) => {
            updateRepairRequest(selectedRepair.id, updates);
            setSelectedRepair(null);
          }}
        />
      )}
    </div>
  );
}

// Repair Detail Modal
function RepairDetailModal({ repair, customers, onClose, onUpdate }: any) {
  const [notes, setNotes] = useState(repair.notes || '');
  const [estimated_cost, setEstimatedCost] = useState(repair.estimated_cost || '');
  const [final_cost, setFinalCost] = useState(repair.final_cost || '');
  const [technician, setTechnician] = useState(repair.technician || '');

  const customer = customers.find((c: Customer) => c.id === repair.customer_id);

  const handleSave = () => {
    onUpdate({
      notes,
      estimated_cost: estimated_cost ? Number(estimated_cost) : undefined,
      final_cost: final_cost ? Number(final_cost) : undefined,
      technician,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#111113] border border-[#27272a] rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
          <h2 className="text-lg font-semibold">Repair Details</h2>
          <button onClick={onClose} className="text-[#71717a] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#71717a]">Customer</p>
              <p className="font-medium">{customer?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Phone</p>
              <p className="font-medium">{customer?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Device</p>
              <p className="font-medium">{repair.device_brand} {repair.device_model}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Service</p>
              <p className="font-medium">{repair.service_type}</p>
            </div>
          </div>
          <div>
            <p className="text-[#71717a] text-sm mb-1">Issue Description</p>
            <p className="text-sm bg-[#18181b] p-3 rounded-lg">{repair.issue}</p>
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Technician</label>
            <input
              type="text"
              value={technician}
              onChange={e => setTechnician(e.target.value)}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white"
              placeholder="Assign technician"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#71717a] mb-1">Estimated Cost</label>
              <input
                type="number"
                value={estimated_cost}
                onChange={e => setEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-[#71717a] mb-1">Final Cost</label>
              <input
                type="number"
                value={final_cost}
                onChange={e => setFinalCost(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white resize-none"
              placeholder="Add repair notes..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#18181b]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Categories Tab
function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleUpdate = (id: string) => {
    if (editName.trim()) {
      updateCategory(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b]"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#18181b] text-xs text-[#71717a] uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Products</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-[#18181b]">
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-white"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium">{category.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#71717a]">{category.product_count} products</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {editingId === category.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(category.id)}
                          className="p-2 text-[#22c55e]"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-[#71717a]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(category.id);
                            setEditName(category.name);
                          }}
                          className="p-2 text-[#71717a] hover:text-[#3b82f6]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete category "${category.name}"?`)) {
                              deleteCategory(category.id);
                            }
                          }}
                          className="p-2 text-[#71717a] hover:text-[#ef4444]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-[#111113] border border-[#27272a] rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
        <p className="text-sm text-[#71717a] mb-4">
          Store settings will be configurable here. Currently using default values.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Store Name</label>
            <input
              type="text"
              defaultValue="Zulfiqar Computers"
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm text-[#71717a] mb-1">Contact Email</label>
            <input
              type="email"
              defaultValue="info@zulfiqarpc.com"
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
