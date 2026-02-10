import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, HardDrive, Monitor, Fan, MemoryStick, ShoppingCart, Wrench, Shield, Truck, Headphones } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { Footer } from '../components/Footer';

// Static data defined outside component to prevent recreating on every render
const categories = [
  { name: 'Graphics Cards', icon: Monitor, count: 24, specs: 'RTX 4090 • RX 7900' },
  { name: 'Processors', icon: Cpu, count: 18, specs: 'i9-14900K • Ryzen 9' },
  { name: 'Memory', icon: MemoryStick, count: 32, specs: 'DDR5 • Up to 128GB' },
  { name: 'Storage', icon: HardDrive, count: 45, specs: 'NVMe SSD • 8TB Max' },
  { name: 'Cooling', icon: Fan, count: 28, specs: 'Liquid • Air Cooling' },
  { name: 'Power', icon: Zap, count: 20, specs: '1000W • 80+ Platinum' },
] as const;

const features = [
  { icon: Truck, title: 'Fast Shipping', desc: 'Free delivery over $500' },
  { icon: Shield, title: 'Genuine Parts', desc: 'Authorized distributor' },
  { icon: Headphones, title: 'Tech Support', desc: 'Expert assistance 24/7' },
] as const;

export function HomePage() {
  // Memoize filtered products to prevent recalculation on every render
  const featuredProducts = useMemo(() => 
    products.filter(p => p.featured).slice(0, 4),
    []
  );
  
  const newArrivals = useMemo(() => 
    products.slice(0, 8),
    []
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-16">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 bg-circuit opacity-50 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
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
                Premium PC components for enthusiasts. From high-performance GPUs to custom cooling solutions.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Shop Components
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link
                  to="/pc-builder"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#18181b] text-white font-medium rounded-lg border border-[#27272a] hover:border-[#3b82f6] transition-all"
                >
                  <Cpu className="w-4 h-4" />
                  PC Builder
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-8 mt-12 pt-8 border-t border-[#27272a]">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">2000+</div>
                  <div className="text-xs text-[#71717a] font-mono uppercase">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">500+</div>
                  <div className="text-xs text-[#71717a] font-mono uppercase">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#3b82f6] font-mono">4.9</div>
                  <div className="text-xs text-[#71717a] font-mono uppercase">Rating</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Preview */}
            <div className="hidden lg:block relative">
              <div className="relative bg-[#111113] border border-[#27272a] rounded-2xl p-6 animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                  </div>
                  <span className="text-xs font-mono text-[#71717a]">PC_BUILDER.exe</span>
                </div>
                
                {/* Spec List */}
                <div className="space-y-4">
                  {[
                    { label: 'CPU', value: 'Intel Core i9-14900K', status: 'optimal' },
                    { label: 'GPU', value: 'NVIDIA RTX 4090', status: 'optimal' },
                    { label: 'RAM', value: '64GB DDR5-6000', status: 'optimal' },
                    { label: 'Storage', value: '2TB NVMe Gen4', status: 'optimal' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between py-3 border-b border-[#27272a] last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#71717a] w-16">{spec.label}</span>
                        <span className="text-sm text-white">{spec.value}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-xs font-mono text-[#22c55e] uppercase">{spec.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance Meter */}
                <div className="mt-6 pt-6 border-t border-[#27272a]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#71717a]">PERFORMANCE SCORE</span>
                    <span className="text-lg font-bold text-[#3b82f6] font-mono">98/100</span>
                  </div>
                  <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-gradient-to-r from-[#3b82f6] to-[#22c55e] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 animate-pulse">
                <span className="text-xs font-mono text-[#22c55e]">● IN STOCK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">Browse</span>
              <h2 className="text-2xl font-bold text-white mt-1">Categories</h2>
            </div>
            <Link
              to="/products"
              className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative bg-[#111113] border border-[#27272a] rounded-xl p-4 hover:border-[#3b82f6] transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-10 h-10 bg-[#18181b] rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#3b82f6]/10 transition-colors">
                  <cat.icon className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">{cat.name}</h3>
                <p className="text-[10px] font-mono text-[#71717a]">{cat.specs}</p>
                <div className="mt-3 pt-3 border-t border-[#27272a] flex items-center justify-between">
                  <span className="text-xs text-[#a1a1aa]">{cat.count} items</span>
                  <ArrowRight className="w-3 h-3 text-[#71717a] group-hover:text-[#3b82f6] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">Featured</span>
              <h2 className="text-2xl font-bold text-white mt-1">Top Components</h2>
            </div>
            <Link
              to="/products"
              className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="relative py-12 border-t border-[#27272a] bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#71717a]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services CTA */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* PC Builder CTA */}
            <div className="group relative bg-[#111113] border border-[#27272a] rounded-2xl p-8 overflow-hidden hover:border-[#3b82f6] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">PC Builder</h3>
                <p className="text-[#a1a1aa] mb-6 text-sm">
                  Build your dream PC with our interactive tool. Check compatibility and estimate power requirements in real-time.
                </p>
                <Link
                  to="/pc-builder"
                  className="inline-flex items-center gap-2 text-[#3b82f6] font-medium hover:text-[#60a5fa] transition-colors"
                >
                  Start Building
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Repair CTA */}
            <div className="group relative bg-[#111113] border border-[#27272a] rounded-2xl p-8 overflow-hidden hover:border-[#22c55e] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Repair Services</h3>
                <p className="text-[#a1a1aa] mb-6 text-sm">
                  Expert repair for all devices. Screen replacement, battery service, and hardware diagnostics available.
                </p>
                <Link
                  to="/repair"
                  className="inline-flex items-center gap-2 text-[#22c55e] font-medium hover:text-[#4ade80] transition-colors"
                >
                  Book Service
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="relative py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">New Arrivals</span>
              <h2 className="text-2xl font-bold text-white mt-1">Latest Stock</h2>
            </div>
            <Link
              to="/products"
              className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product, i) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative py-16 border-t border-[#27272a] bg-[#111113]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-6">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse" />
            <span className="text-xs font-mono text-[#a1a1aa]">NEWSLETTER</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-[#a1a1aa] mb-8">
            Get notified about new arrivals, restocks, and exclusive deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#3b82f6] font-mono text-sm"
            />
            <button className="px-6 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
