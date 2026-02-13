import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Cpu, Menu, X, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { cn } from '../utils/cn';
import { Category, Product } from '../types';
import { generateSlug } from '../utils/seo';

const getCategoryName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Product';
};

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/pc-builder', label: 'PC Builder' },
  { to: '/repair', label: 'Repair' },
] as const;

const quickSearchTerms = ['RTX 4090', 'Ryzen 9', 'DDR5', 'Gaming Laptop', 'NVMe SSD'] as const;

const SearchResultItem = memo(function SearchResultItem({
  product,
  categoryName,
  onClick,
  onAddToCart,
}: {
  product: Product;
  categoryName: string;
  onClick: (to: string) => void;
  onAddToCart: (e: React.MouseEvent) => void;
}) {
  const slug = generateSlug(product.name);
  const targetUrl = `/product/${product.id}/${slug}`;

  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-[#18181b] transition-colors group cursor-pointer"
      onClick={() => onClick(targetUrl)}
    >
      <div className="w-16 h-16 bg-[#18181b] rounded-lg overflow-hidden shrink-0 border border-[#27272a]">
        <img
          src={product.image}
          alt={`Buy ${product.name} - ${categoryName}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider px-1.5 py-0.5 bg-[#18181b] rounded">
            {categoryName}
          </span>
        </div>
        <h3 className="text-sm font-medium text-white group-hover:text-[#3b82f6] transition-colors truncate">
          {product.name}
        </h3>
        <div className="text-sm font-mono text-[#3b82f6] font-medium mt-1">
          ${product.price.toLocaleString()}
        </div>
      </div>
      <button
        onClick={onAddToCart}
        className="shrink-0 px-3 py-2 bg-[#18181b] border border-[#27272a] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#3b82f6] hover:border-[#3b82f6] transition-all"
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { cartCount, addToCart, categories, products } = useApp();
  const { user, isAdmin, signOut } = useSupabaseAuth();
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
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(query);
      if (nameMatch) return true;
      const categoryMatch = getCategoryName(product.category_id, categories).toLowerCase().includes(query);
      if (categoryMatch) return true;
      return product.specs.some(spec => spec.toLowerCase().includes(query));
    }).slice(0, 8);
  }, [searchQuery, categories, products]);

  const handleProductClick = useCallback((to: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(to);
  }, [navigate]);

  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b", isScrolled ? "bg-[#0a0a0b]/95 backdrop-blur-xl border-[#27272a]" : "bg-[#0a0a0b] border-transparent")}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group" aria-label="Zulfiqar Computers Home">
              <div className="relative">
                <div className="w-10 h-10 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center transition-all duration-300 group-hover:border-[#3b82f6]">
                  <Cpu className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22c55e] rounded-full border-2 border-[#0a0a0b]" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold text-white tracking-tight uppercase leading-none">Zulfiqar</span>
                <span className="block text-[10px] font-mono text-[#71717a] tracking-[0.3em] uppercase mt-1">Computers</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 bg-[#111113] rounded-xl p-1 border border-[#27272a]">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={cn("px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all", isActive(to) ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20" : "text-[#71717a] hover:text-white hover:bg-[#18181b]")}>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button aria-label="Search Catalog" onClick={() => setIsSearchOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-xl text-[#71717a] hover:text-white hover:bg-[#111113] border border-transparent hover:border-[#27272a] transition-all"><Search className="w-5 h-5" /></button>
              <Link to="/cart" aria-label={`Cart with ${cartCount} items`} className="relative flex items-center gap-2 px-5 h-11 bg-[#3b82f6] text-white rounded-xl hover:bg-[#2563eb] transition-all shadow-lg shadow-blue-500/20">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-mono text-sm font-bold">{cartCount}</span>
              </Link>
              
              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 h-11 px-4 bg-[#111113] border border-[#27272a] rounded-xl text-white hover:border-[#3b82f6] transition-all"
                  >
                    <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-[#71717a] transition-transform", isUserMenuOpen && "rotate-180")} />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#111113] border border-[#27272a] rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[#27272a]">
                        <p className="text-xs text-[#71717a]">Signed in as</p>
                        <p className="text-sm text-white truncate">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-[#3b82f6] hover:bg-[#18181b] transition-colors"
                        >
                          <Cpu className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-[#18181b] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 h-11 px-4 bg-[#111113] border border-[#27272a] rounded-xl text-[#71717a] hover:text-white hover:border-[#3b82f6] transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block text-xs font-medium">Sign In</span>
                </Link>
              )}
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-[#71717a] hover:text-white hover:bg-[#111113] border border-[#27272a] transition-all">{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0b] border-t border-[#27272a] p-4 animate-slide-down">
            <nav className="space-y-2">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setIsMenuOpen(false)} className={cn("block px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-xl", isActive(to) ? "bg-[#3b82f6] text-white" : "text-[#71717a] bg-[#111113]")}>{label}</Link>
              ))}
              {/* Mobile user menu */}
              {user ? (
                <>
                  <div className="px-5 py-3 text-xs text-[#71717a] border-t border-[#27272a] mt-2 pt-4">
                    Signed in as <span className="text-white">{user.email}</span>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-xl text-[#3b82f6] bg-[#111113]">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleSignOut} className="block w-full text-left px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-xl text-red-400 bg-[#111113]">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)} className="block px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-xl text-white bg-[#3b82f6]">
                  Sign In / Sign Up
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-32 px-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-2xl">
            <div className="bg-[#111113] border border-[#27272a] rounded-3xl p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                <Search className="w-6 h-6 text-[#3b82f6]" />
                <input type="text" placeholder="QUERY_SYSTEM_HARDWARE..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="flex-1 bg-transparent text-xl text-white placeholder:text-[#27272a] focus:outline-none font-mono" />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 text-[#71717a] hover:text-white"><X className="w-6 h-6" /></button>
              </div>

              {searchQuery.trim() ? (
                <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map(product => (
                    <SearchResultItem key={product.id} product={product} categoryName={getCategoryName(product.category_id, categories)} onClick={handleProductClick} onAddToCart={(e) => { e.stopPropagation(); addToCart(product); }} />
                  ))}
                  {searchResults.length === 0 && <p className="text-center py-12 text-[#71717a] font-mono text-xs">NO_MATCHING_RECORDS</p>}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[10px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.3em]">H0T_SEARCH_INDEX</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSearchTerms.map(term => <button key={term} onClick={() => setSearchQuery(term)} className="px-4 py-2.5 bg-[#18181b] border border-[#27272a] text-[#71717a] text-[10px] font-mono rounded-xl hover:border-[#3b82f6] hover:text-white transition-all">{term}</button>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
