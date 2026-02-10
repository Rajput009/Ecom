import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0b] border-t border-[#27272a]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-center">
                <Cpu className="w-4.5 h-4.5 text-[#3b82f6]" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white leading-none block">ZULFIQAR</span>
                <span className="text-[8px] font-mono text-[#71717a] tracking-[0.2em] uppercase">COMPUTERS</span>
              </div>
            </Link>
            <p className="text-xs text-[#71717a] leading-relaxed mb-4 max-w-xs">
              Premium PC components and expert repair services. Building high-performance systems since 2010.
            </p>
            <div className="space-y-2 text-xs">
              <a href="tel:+923001234567" className="flex items-center gap-2 text-[#71717a] hover:text-[#3b82f6] transition-colors">
                <Phone className="w-3 h-3" />
                <span className="font-mono">+92 300 1234567</span>
              </a>
              <a href="mailto:info@zulfiqarpc.com" className="flex items-center gap-2 text-[#71717a] hover:text-[#3b82f6] transition-colors">
                <Mail className="w-3 h-3" />
                <span className="font-mono">info@zulfiqarpc.com</span>
              </a>
              <div className="flex items-center gap-2 text-[#71717a]">
                <MapPin className="w-3 h-3" />
                <span className="font-mono">Main Boulevard, Lahore</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'All Products', to: '/products' },
                { label: 'PC Builder', to: '/pc-builder' },
                { label: 'Graphics Cards', to: '/products?category=Graphics+Cards' },
                { label: 'Processors', to: '/products?category=Processors' },
                { label: 'Memory', to: '/products?category=Memory' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#71717a] hover:text-[#3b82f6] transition-colors font-mono">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-xs">
              {[
                { label: 'Mobile Repair', to: '/repair' },
                { label: 'PC Assembly', to: '#' },
                { label: 'Diagnostics', to: '#' },
                { label: 'Upgrades', to: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#71717a] hover:text-[#3b82f6] transition-colors font-mono">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs">
              {['Contact', 'FAQs', 'Shipping', 'Returns', 'Warranty'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#71717a] hover:text-[#3b82f6] transition-colors font-mono">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-[#52525b] font-mono">
            © {currentYear} Zulfiqar Computers. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy', 'Terms', 'Sitemap'].map((item) => (
              <a key={item} href="#" className="text-[10px] text-[#52525b] hover:text-[#71717a] transition-colors font-mono">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
