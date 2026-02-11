import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0b] border-t border-[#27272a] relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group" aria-label="Zulfiqar Computers Home">
              <div className="w-10 h-10 bg-[#18181b] border border-[#27272a] rounded-xl flex items-center justify-center group-hover:border-[#3b82f6] transition-colors">
                <Cpu className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white uppercase leading-none block">ZULFIQAR</span>
                <span className="text-[8px] font-mono text-[#71717a] tracking-[0.3em] uppercase mt-1">COMPUTERS</span>
              </div>
            </Link>
            <p className="text-xs text-[#a1a1aa] leading-relaxed mb-8 max-w-[240px]">
              Pakistan's premier destination for high-performance hardware and expert technical restoration since 2010.
            </p>
            <div className="space-y-3">
              <a href="tel:+923001234567" className="flex items-center gap-3 text-[#71717a] hover:text-[#3b82f6] transition-colors group">
                <div className="p-2 bg-[#18181b] rounded-lg group-hover:bg-[#3b82f6]/10"><Phone className="w-3.5 h-3.5" /></div>
                <span className="font-mono text-[10px] uppercase tracking-wider">+92 300 1234567</span>
              </a>
              <a href="mailto:info@zulfiqarpc.com" className="flex items-center gap-3 text-[#71717a] hover:text-[#3b82f6] transition-colors group">
                <div className="p-2 bg-[#18181b] rounded-lg group-hover:bg-[#3b82f6]/10"><Mail className="w-3.5 h-3.5" /></div>
                <span className="font-mono text-[10px] uppercase tracking-wider">info@zulfiqarcpu.com</span>
              </a>
              <div className="flex items-center gap-3 text-[#71717a] group">
                <div className="p-2 bg-[#18181b] rounded-lg"><MapPin className="w-3.5 h-3.5" /></div>
                <span className="font-mono text-[10px] uppercase tracking-wider">Main Boulevard, Lahore</span>
              </div>
            </div>
          </div>

          <nav aria-label="Quick Links Catalog">
            <h4 className="text-[10px] font-mono font-bold text-white mb-6 uppercase tracking-[0.2em] border-l-2 border-[#3b82f6] pl-3">Catalog</h4>
            <ul className="space-y-3">
              {[
                { label: 'ALL_PRODUCTS', to: '/products' },
                { label: 'PC_BUILDER', to: '/pc-builder' },
                { label: 'GRAPHICS_UNITS', to: '/products?category=Graphics Cards' },
                { label: 'PROCESSING_UNITS', to: '/products?category=Processors' },
                { label: 'MEMORY_MODULES', to: '/products?category=Memory' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#71717a] hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest block py-1">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Repair Services">
            <h4 className="text-[10px] font-mono font-bold text-white mb-6 uppercase tracking-[0.2em] border-l-2 border-[#22c55e] pl-3">Services</h4>
            <ul className="space-y-3">
              {[
                { label: 'MOBILE_REPAIR', to: '/repair' },
                { label: 'CUSTOM_ASSEMBLY', to: '/pc-builder' },
                { label: 'SYSTEM_DIAGNOSTICS', to: '/repair' },
                { label: 'HARDWARE_UPGRADES', to: '/products' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[#71717a] hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest block py-1">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div aria-label="Support Information">
            <h4 className="text-[10px] font-mono font-bold text-white mb-6 uppercase tracking-[0.2em] border-l-2 border-[#71717a] pl-3">Support</h4>
            <ul className="space-y-3">
              {['CONTACT_US', 'FAQ_INDEX', 'SHIPPING_LOGISTICS', 'WARRANTY_TERMS'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-[#71717a] hover:text-white transition-all font-mono text-[10px] uppercase tracking-widest block py-1">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#27272a] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[9px] text-[#52525b] font-mono uppercase tracking-[0.1em]">
            © {currentYear} Zulfiqar Computers. SYSTEM_STATUS: OPERATIONAL
          </p>
          <div className="flex items-center gap-6">
            <Link to="/admin/login" className="text-[9px] text-[#52525b] hover:text-[#3b82f6] transition-colors font-mono uppercase">Admin_Access</Link>
            {['Privacy_Policy', 'Service_Terms', 'Sitemap_Index'].map((item) => (
              <a key={item} href="#" className="text-[9px] text-[#52525b] hover:text-white transition-colors font-mono uppercase">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
