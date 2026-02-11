import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Cpu, Menu, X, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { Category, Product } from '../types';

// Helper to get category name by ID
const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Product';
};

// Static data outside component
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/pc-builder', label: 'PC Builder' },
  { to: '/repair', label: 'Repair' },
] as const;

const quickSearchTerms = ['RTX 4090', 'Ryzen 9', 'DDR5', 'Gaming Laptop', 'NVMe SSD'] as const;

// Memoized search result item
const SearchResultItem = memo(function SearchResultItem({
  product,
  categoryName,
  onClick,
  onAddToCart,
}: {
  product: Product;
  categoryName: string;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-[#18181b] transition-colors group cursor-pointer"
      onClick={onClick}
    >
      <div className="w-16 h-16 bg-[#18181b] rounded-lg overflow-hidden shrink-0 border border-[#27272a]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider px-1.5 py-0.5 bg-[#18181b] rounded">
            {categoryName}
          </span>
          {product.featured && (
            <span className="text-[10px] font-mono text-[#3b82f6] uppercase tracking-wider px-1.5 py-0.5 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded">
              Featured
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-white group-hover:text-[#3b82f6] transition-colors truncate">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-mono text-[#3b82f6] font-medium">
            ${product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <span className="text-xs text-[#52525b] line-through">
              ${product.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onAddToCart}
        className="shrink-0 px-3 py-2 bg-[#18181b] border border-[#27272a] text-white text-xs font-medium rounded-lg hover:bg-[#3b82f6] hover:border-[#3b82f6] transition-all"
      >
        Add
      </button>
    </div>
  );
});

export const Header = memo(function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, addToCart, categories, products } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(query);
      if (nameMatch) return true;
      const categoryMatch = getCategoryName(product.category_id, categories).toLowerCase().includes(query);
      if (categoryMatch) return true;
      const descMatch = product.description.toLowerCase().includes(query);
      if (descMatch) return true;
      return product.specs.some(spec => spec.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [searchQuery, categories, products]);

  const handleProductClick = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate('/products');
  }, [navigate]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleAddToCart = useCallback((product: Product) => (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  }, [addToCart]);

  const handleQuickTermClick = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => { setIsSearchOpen(false); setSearchQuery(''); }, []);
  const clearSearch = useCallback(() => setSearchQuery(''), []);

  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b", isScrolled ? "bg-[#0a0a0b]/95 backdrop-blur-xl border-[#27272a]" : "bg-[#0a0a0b] border-transparent")}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center transition-all duration-300 group-hover:border-[#3b82f6] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Cpu className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#0a0a0b] animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white tracking-tight">ZULFIQAR</h1>
                <p className="text-[10px] font-mono text-[#71717a] tracking-wider">COMPUTERS</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 bg-[#111113] rounded-lg p-1 border border-[#27272a]">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={cn("relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200", isActive(to) ? "bg-[#18181b] text-white" : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]/50")}>
                  {label}
                  {isActive(to) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#3b82f6] rounded-full" />}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={openSearch} className="w-10 h-10 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#18181b] transition-all"><Search className="w-5 h-5" /></button>
              <Link to="/track-repair" className="hidden md:flex items-center gap-2 px-3 py-2 text-[#71717a] hover:text-white hover:bg-[#18181b] rounded-lg transition-all text-sm">Track Repair</Link>
              <Link to="/cart" className="relative flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-mono text-sm font-medium">{cartCount}</span>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#0a0a0b]" />}
              </Link>
              <button onClick={toggleMenu} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#71717a] hover:text-white hover:bg-[#18181b] transition-all">{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#111113] border-t border-[#27272a] shadow-2xl">
            <nav className="p-4 space-y-1">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className={cn("block px-4 py-3 text-sm font-medium rounded-lg transition-all", isActive(to) ? "bg-[#3b82f6] text-white" : "text-[#a1a1aa] hover:bg-[#18181b] hover:text-white")}>{label}</Link>
              ))}
              <Link to="/track-repair" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-sm font-medium rounded-lg text-[#a1a1aa] hover:bg-[#18181b] hover:text-white transition-all">Track Repair</Link>
            </nav>
          </div>
        )}
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeSearch} />
          <div className="relative w-full max-w-2xl animate-slide-down">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center gap-3 bg-[#111113] border border-[#27272a] rounded-xl p-4 shadow-2xl">
                <Search className="w-5 h-5 text-[#71717a]" />
                <input type="text" placeholder="Search products, specs, categories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="flex-1 bg-transparent text-white placeholder:text-[#52525b] focus:outline-none text-base" />
                {searchQuery && <button type="button" onClick={clearSearch} className="p-1 text-[#71717a] hover:text-white transition-colors"><X className="w-4 h-4" /></button>}
                <kbd className="hidden sm:block px-2 py-1 bg-[#18181b] border border-[#27272a] rounded text-[10px] font-mono text-[#71717a]">ESC</kbd>
              </div>
            </form>
            {searchQuery.trim() && (
              <div className="mt-2 bg-[#111113] border border-[#27272a] rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-[#27272a]">
                    {searchResults.map((product) => (
                      <SearchResultItem key={product.id} product={product} categoryName={getCategoryName(product.category_id, categories)} onClick={handleProductClick} onAddToCart={handleAddToCart(product)} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#71717a]">No items found</div>
                )}
                <button onClick={handleSearchSubmit} className="w-full flex items-center justify-center gap-2 p-4 bg-[#18181b] text-[#3b82f6] text-sm font-medium hover:bg-[#3b82f6]/10 transition-colors border-t border-[#27272a]">View all results <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}
            {!searchQuery.trim() && (
              <div className="mt-2 bg-[#111113] border border-[#27272a] rounded-xl p-4">
                <p className="text-[10px] font-mono text-[#71717a] uppercase mb-3">Quick Search</p>
                <div className="flex flex-wrap gap-2">
                  {quickSearchTerms.map(term => <button key={term} onClick={() => handleQuickTermClick(term)} className="px-3 py-1.5 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs rounded-lg hover:border-[#3b82f6] hover:text-white transition-all">{term}</button>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
