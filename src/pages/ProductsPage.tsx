import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, Grid3X3, List, Star, ShoppingCart, Cpu, Zap, HardDrive, Monitor, Fan, MemoryStick } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

// Helper to get category name by ID
const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Uncategorized';
};

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, categories, isLoading, addToCart } = useApp();

  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'featured';
  const priceRange = searchParams.get('price') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        getCategoryName(p.category_id, categories).toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.specs.some(spec => spec.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => getCategoryName(p.category_id, categories) === selectedCategory);
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [products, categories, selectedCategory, sortBy, priceRange, searchQuery]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === 'all' || value === 'featured') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $100', value: '0-100' },
    { label: '$100 - $500', value: '100-500' },
    { label: '$500 - $1000', value: '500-1000' },
    { label: 'Over $1000', value: '1000-' },
  ];

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Newest', value: 'newest' },
  ];

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('graphics')) return Monitor;
    if (lower.includes('processor')) return Cpu;
    if (lower.includes('memory')) return MemoryStick;
    if (lower.includes('storage')) return HardDrive;
    if (lower.includes('cooling')) return Fan;
    if (lower.includes('power')) return Zap;
    return Cpu;
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">LOAD_INVENTORY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-3">
              <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-[#71717a]">
                {searchQuery ? `SEARCH: "${searchQuery}"` : 'BROWSE_INVENTORY'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <p className="text-[#71717a] mt-1 font-mono text-sm">
              {filteredProducts.length} ITEMS_FOUND
              {searchQuery && (
                <button onClick={() => updateFilter('search', 'all')} className="ml-3 text-[#3b82f6] hover:text-[#60a5fa] underline">Clear Search</button>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white font-mono hover:border-[#3b82f6] transition-colors">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => updateFilter('sort', e.target.value)} className="appearance-none px-4 py-2 pr-10 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#3b82f6] hover:border-[#3f3f46] transition-colors cursor-pointer">
                {sortOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#18181b]">{opt.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] pointer-events-none" />
            </div>
            <div className="hidden md:flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded transition-colors", viewMode === 'grid' ? 'bg-[#3b82f6] text-white' : 'text-[#71717a] hover:text-white')}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-2 rounded transition-colors", viewMode === 'list' ? 'bg-[#3b82f6] text-white' : 'text-[#71717a] hover:text-white')}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className={cn(showFilters ? 'fixed inset-0 z-50 bg-black/80 md:relative md:bg-transparent' : 'hidden', 'md:block')}>
            <div className={cn(showFilters ? 'absolute right-0 top-0 h-full w-80 bg-[#111113] border-l border-[#27272a] p-6 overflow-y-auto' : '', 'md:relative md:w-64 md:p-0 md:bg-transparent md:border-0')}>
              {showFilters && (
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <h2 className="text-lg font-semibold text-white font-mono">FILTERS</h2>
                  <button onClick={() => setShowFilters(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#18181b] text-[#71717a] hover:text-white"><X className="w-5 h-5" /></button>
                </div>
              )}
              <div className="space-y-6">
                <div className="bg-[#111113] border border-[#27272a] rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 font-mono text-xs uppercase tracking-wider">Categories</h3>
                  <div className="space-y-1">
                    <button onClick={() => { updateFilter('category', 'All'); setShowFilters(false); }} className={cn("w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition-all", selectedCategory === 'All' ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white')}>
                      <Grid3X3 className="w-4 h-4" /> All Categories
                    </button>
                    {categories.map((cat: Category) => {
                      const Icon = getCategoryIcon(cat.name);
                      return (
                        <button key={cat.id} onClick={() => { updateFilter('category', cat.name); setShowFilters(false); }} className={cn("w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm transition-all", selectedCategory === cat.name ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white')}>
                          <Icon className="w-4 h-4" /> {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-[#111113] border border-[#27272a] rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-4 font-mono text-xs uppercase tracking-wider">Price Range</h3>
                  <div className="space-y-1">
                    {priceRanges.map(range => (
                      <button key={range.value} onClick={() => { updateFilter('price', range.value); setShowFilters(false); }} className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all font-mono", priceRange === range.value ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white')}>
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product, i) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ProductCard product={product} onViewDetails={setSelectedProduct} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex gap-4 bg-[#111113] border border-[#27272a] rounded-xl p-4 hover:border-[#3b82f6] transition-all cursor-pointer group" onClick={() => setSelectedProduct(product)}>
                    <div className="w-32 h-32 bg-[#18181b] rounded-lg overflow-hidden shrink-0"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider mb-1">{getCategoryName(product.category_id, categories)}</p>
                      <h3 className="font-medium text-white mb-2 group-hover:text-[#3b82f6] transition-colors">{product.name}</h3>
                      <p className="text-sm text-[#71717a] line-clamp-2 mb-3">{product.description}</p>
                      {product.specs && <div className="flex flex-wrap gap-2 mb-3">{product.specs.slice(0, 3).map((spec) => <span key={spec} className="text-[10px] font-mono text-[#71717a] bg-[#18181b] px-2 py-1 rounded">{spec}</span>)}</div>}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2"><span className="text-xl font-bold text-white font-mono">${product.price.toLocaleString()}</span>{product.original_price && <span className="text-sm text-[#71717a] line-through font-mono">${product.original_price.toLocaleString()}</span>}</div>
                        <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded-lg hover:bg-[#2563eb] transition-colors"><ShoppingCart className="w-4 h-4" /> Add</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-[#111113] border border-[#27272a] rounded-xl">
                <div className="w-16 h-16 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-4"><Cpu className="w-8 h-8 text-[#71717a]" /></div>
                <p className="text-[#71717a] font-mono text-sm">NO_PRODUCTS_FOUND</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="relative">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center text-[#71717a] hover:text-white hover:border-[#3b82f6] transition-all"><X className="w-5 h-5" /></button>
              <div className="aspect-video bg-[#18181b]"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" /></div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider px-2 py-1 bg-[#18181b] rounded">{getCategoryName(selectedProduct.category_id, categories)}</span>
                {selectedProduct.featured && <span className="text-[10px] font-mono text-[#3b82f6] uppercase tracking-wider px-2 py-1 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded">Featured</span>}
              </div>
              <h2 className="text-2xl font-bold text-white mt-2 mb-2">{selectedProduct.name}</h2>
              <div className="flex items-center gap-2 mb-4"><div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={cn("w-4 h-4", i < Math.floor(selectedProduct.rating) ? 'text-[#3b82f6] fill-[#3b82f6]' : 'text-[#27272a]')} />)}</div><span className="text-sm text-[#71717a] font-mono">{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span></div>
              <p className="text-[#a1a1aa] mb-6">{selectedProduct.description}</p>
              <div className="mb-6"><h3 className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-3">Specifications</h3><div className="flex flex-wrap gap-2">{selectedProduct.specs.map((spec, i) => <span key={i} className="px-3 py-1.5 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-sm rounded-lg font-mono">{spec}</span>)}</div></div>
              <div className="flex items-center gap-2 mb-6"><span className={cn("w-2 h-2 rounded-full", selectedProduct.stock > 10 ? "bg-[#22c55e]" : selectedProduct.stock > 0 ? "bg-[#f59e0b]" : "bg-[#ef4444]")} /><span className="text-sm font-mono text-[#a1a1aa]">{selectedProduct.stock > 10 ? 'IN STOCK' : selectedProduct.stock > 0 ? `${selectedProduct.stock} UNITS LEFT` : 'OUT OF STOCK'}</span></div>
              <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                <div><span className="text-3xl font-bold text-white font-mono">${selectedProduct.price.toLocaleString()}</span>{selectedProduct.original_price && <span className="ml-2 text-lg text-[#71717a] line-through font-mono">${selectedProduct.original_price.toLocaleString()}</span>}</div>
                <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-semibold rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"><ShoppingCart className="w-5 h-5" /> Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
