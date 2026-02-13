import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, HardDrive, Monitor, Fan, MemoryStick, ShoppingCart, Shield, Truck, Headphones } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { SEO } from '../components/SEO';
import { AnimatedIconMap, AnimatedIconProps } from '../components/AnimatedIcons';

const features = [
  { icon: Truck, title: 'Fast Shipping', desc: 'Free delivery over $500' },
  { icon: Shield, title: 'Genuine Parts', desc: 'Authorized distributor' },
  { icon: Headphones, title: 'Tech Support', desc: 'Expert assistance 24/7' },
] as const;

// Map category names to animated icons
const getAnimatedIcon = (categoryName: string): React.FC<AnimatedIconProps> | null => {
  const name = categoryName.toLowerCase();
  if (name.includes('processor') || name.includes('cpu')) return AnimatedIconMap.cpu;
  if (name.includes('graphics') || name.includes('gpu')) return AnimatedIconMap.gpu;
  if (name.includes('memory') || name.includes('ram')) return AnimatedIconMap.ram;
  if (name.includes('storage') || name.includes('ssd') || name.includes('hdd')) return AnimatedIconMap.storage;
  if (name.includes('motherboard')) return AnimatedIconMap.motherboard;
  if (name.includes('power') || name.includes('psu')) return AnimatedIconMap.psu;
  if (name.includes('cooling') || name.includes('cooler')) return AnimatedIconMap.cooler;
  if (name.includes('case') || name.includes('chassis')) return AnimatedIconMap.case;
  return null;
};

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
      const animatedIcon = getAnimatedIcon(cat.name);
      return { ...cat, icon, animatedIcon };
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
      <section className="relative overflow-hidden min-h-[600px] lg:min-h-[700px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/hero.avif" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/80 via-transparent to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24 w-full">
          <div className="max-w-xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b]/80 backdrop-blur-sm border border-[#27272a] rounded-full mb-6">
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
              <Link to="/pc-builder" className="inline-flex items-center gap-2 px-6 py-3 bg-[#18181b]/80 backdrop-blur-sm text-white font-medium rounded-lg border border-[#27272a] hover:border-[#3b82f6] transition-all">
                <Cpu className="w-4 h-4" /> PC Builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories with Animated Icons */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-[#3b82f6] pl-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* CPU */}
            <Link to="/products?category=CPU" className="group bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18181b] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/10 transition-colors overflow-hidden mx-auto">
                <AnimatedIconMap.cpu size={80} isAnimated={true} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1 text-center">CPU</h3>
              <span className="text-[10px] text-[#71717a] font-mono block text-center">PROCESSORS</span>
            </Link>
            
            {/* Motherboard */}
            <Link to="/products?category=Motherboard" className="group bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18181b] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/10 transition-colors overflow-hidden mx-auto">
                <AnimatedIconMap.motherboard size={80} isAnimated={true} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1 text-center">Motherboard</h3>
              <span className="text-[10px] text-[#71717a] font-mono block text-center">MOTHERBOARDS</span>
            </Link>
            
            {/* GPU */}
            <Link to="/products?category=GPU" className="group bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18181b] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/10 transition-colors overflow-hidden mx-auto">
                <AnimatedIconMap.gpu size={80} isAnimated={true} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1 text-center">GPU</h3>
              <span className="text-[10px] text-[#71717a] font-mono block text-center">GRAPHICS CARDS</span>
            </Link>
            
            {/* Memory */}
            <Link to="/products?category=Memory" className="group bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18181b] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/10 transition-colors overflow-hidden mx-auto">
                <AnimatedIconMap.ram size={80} isAnimated={true} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1 text-center">Memory</h3>
              <span className="text-[10px] text-[#71717a] font-mono block text-center">RAM</span>
            </Link>
            
            {/* Storage */}
            <Link to="/products?category=Storage" className="group bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3b82f6] transition-all duration-300">
              <div className="w-20 h-20 bg-[#18181b] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/10 transition-colors overflow-hidden mx-auto">
                <AnimatedIconMap.storage size={80} isAnimated={true} />
              </div>
              <h3 className="text-sm font-medium text-white mb-1 text-center">Storage</h3>
              <span className="text-[10px] text-[#71717a] font-mono block text-center">SSD / HDD</span>
            </Link>
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
