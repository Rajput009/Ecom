import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, HardDrive, Monitor, Fan, MemoryStick, ShoppingCart, Wrench, Shield, Truck, Headphones } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { SEO } from '../components/SEO';

const features = [
  { icon: Truck, title: 'Fast Shipping', desc: 'Free delivery over $500' },
  { icon: Shield, title: 'Genuine Parts', desc: 'Authorized distributor' },
  { icon: Headphones, title: 'Tech Support', desc: 'Expert assistance 24/7' },
] as const;

export function HomePage() {
  const { products, categories, isLoading } = useApp();

  const featuredProducts = useMemo(() =>
    products.filter(p => p.featured).slice(0, 4),
    [products]
  );

  const newArrivals = useMemo(() =>
    [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8),
    [products]
  );

  const homeCategories = useMemo(() => {
    return categories.slice(0, 6).map(cat => {
      let icon = Cpu;
      if (cat.name.includes('Graphics')) icon = Monitor;
      if (cat.name.includes('Memory')) icon = MemoryStick;
      if (cat.name.includes('Storage')) icon = HardDrive;
      if (cat.name.includes('Cooling')) icon = Fan;
      if (cat.name.includes('Power')) icon = Zap;
      return { ...cat, icon };
    });
  }, [categories]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zulfiqar Computers",
    "url": "https://zulfiqar-computers.com",
    "logo": "https://zulfiqar-computers.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-XXX-XXXXXXX",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["English", "Urdu"]
    },
    "sameAs": [
      "https://facebook.com/zulfiqarcomputers",
      "https://instagram.com/zulfiqarcomputers"
    ]
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">SYSTEM_INITIALIZING...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-16">
      <SEO
        title="High-Performance PC Components & Expert Repair"
        description="Pakistan's premier destination for gaming GPUs, CPUs, DDR5 RAM, and custom liquid cooling. Expert PC repair services in Lahore."
        schema={organizationSchema}
      />

      <div className="fixed inset-0 bg-circuit opacity-50 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-6">
                <span className="w-2 h-2 bg-[#22c55e] rounded-full animate-pulse" />
                <span className="text-xs font-mono text-[#a1a1aa]">SYSTEM ONLINE</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Build Your
                <span className="block text-[#3b82f6]">Ultimate Rig</span>
              </h1>
              <p className="text-[#a1a1aa] text-lg mb-8 max-w-md">
                Premium PC components for enthusiasts. From high-performance GPUs to custom cooling solutions. Delivered across Pakistan.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                  <ShoppingCart className="w-4 h-4" /> Shop Components <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/pc-builder" className="inline-flex items-center gap-2 px-6 py-3 bg-[#18181b] text-white font-medium rounded-lg border border-[#27272a] hover:border-[#3b82f6] transition-all">
                  <Cpu className="w-4 h-4" /> PC Builder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections remain same but with semantic updates */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-[#3b82f6] pl-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {homeCategories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} className="group bg-[#111113] border border-[#27272a] rounded-xl p-4 hover:border-[#3b82f6] transition-all duration-300">
                <div className="w-10 h-10 bg-[#18181b] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/10 transition-colors">
                  <cat.icon className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">{cat.name}</h3>
                <span className="text-[10px] text-[#71717a] font-mono">{cat.product_count} PRODUCTS_INDEXED</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-[#3b82f6] pl-4">Featured Components</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.length > 0 ? featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            )) : (
              <div className="col-span-full py-12 text-center text-[#71717a] font-mono text-sm border border-dashed border-[#27272a] rounded-2xl uppercase">SYSTEM_RESTOCKING...</div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-[#3b82f6] pl-4">Latest Arrival</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
