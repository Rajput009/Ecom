import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, X, ChevronDown, Grid3X3, List, Star, ShoppingCart, Cpu, Zap, HardDrive, Monitor, Fan, MemoryStick } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product, Category } from '../types';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { SEO } from '../components/SEO';
import { generateSlug } from '../utils/seo';

const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Uncategorized';
};

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { products, categories, isLoading, addToCart } = useApp();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'featured';
  const priceRange = searchParams.get('price') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

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
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
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

  const seoTitle = useMemo(() => {
    if (searchQuery) return `Search results for "${searchQuery}"`;
    if (selectedCategory !== 'All') return `${selectedCategory} - Buy Online in Pakistan`;
    return 'Premium PC Components & Hardware Store';
  }, [searchQuery, selectedCategory]);

  const seoDescription = useMemo(() => {
    if (selectedCategory !== 'All') return `Shop the latest ${selectedCategory} at Zulfiqar Computers. Best prices on genuine hardware in Pakistan.`;
    return 'Browse our wide range of high-performance PC components, including GPUs, CPUs, Motherboards, and more.';
  }, [selectedCategory]);

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
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">LOAD_INVENTORY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20 pb-16">
      <SEO title={seoTitle} description={seoDescription} />
      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-3">
              <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-[#71717a] uppercase tracking-widest">
                {searchQuery ? `QUERY_ACTIVE: "${searchQuery}"` : 'SYSTEM_INVENTORY'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'Product Catalog' : selectedCategory}
            </h1>
            <p className="text-[#a1a1aa] mt-1 font-mono text-xs uppercase tracking-widest">
              {filteredProducts.length} RECORDS_MATCHED
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-bold uppercase tracking-widest transition-all">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="relative">
              <select value={sortBy} onChange={(e) => updateFilter('sort', e.target.value)} className="appearance-none px-4 py-2.5 pr-10 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white font-bold uppercase tracking-widest focus:outline-none focus:border-[#3b82f6] cursor-pointer">
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className={cn(showFilters ? 'fixed inset-0 z-[60] bg-black/90 p-6 overscroll-none' : 'hidden md:block w-64 shrink-0')}>
            {showFilters && <button onClick={() => setShowFilters(false)} className="absolute top-4 right-4 p-2 text-white"><X className="w-6 h-6" /></button>}
            <div className="space-y-8">
              <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6">
                <h3 className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-[0.2em] mb-4">CATEGORIES</h3>
                <div className="space-y-1">
                  <button onClick={() => updateFilter('category', 'All')} className={cn("w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all", selectedCategory === 'All' ? 'bg-[#3b82f6] text-white' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white')}>
                    <Grid3X3 className="w-4 h-4" /> ALL_UNITS
                  </button>
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <button key={cat.id} onClick={() => updateFilter('category', cat.name)} className={cn("w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all", selectedCategory === cat.name ? 'bg-[#3b82f6] text-white' : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-white')}>
                        <Icon className="w-4 h-4" /> {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-[#111113] border border-[#27272a] border-dashed rounded-3xl">
                <Cpu className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
                <p className="text-[#71717a] font-mono text-xs uppercase tracking-widest">ZERO_MATCHES_RETURNED</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
