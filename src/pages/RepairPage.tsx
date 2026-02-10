import { useState } from 'react';
import {
  Wrench, Smartphone, Monitor, Tablet, CheckCircle, Clock,
  Shield, ArrowRight, ChevronDown, Phone, MapPin, Star,
  Zap, Droplets, Battery, Wifi, Camera, Volume2,
  CircuitBoard, Cpu, Send
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import type { DeviceType } from '../types';

interface RepairService {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  icon: React.ElementType;
  popular?: boolean;
}

const deviceCategories = [
  { id: 'mobile', label: 'Mobile Phones', icon: Smartphone, count: 24 },
  { id: 'tablet', label: 'Tablets / iPad', icon: Tablet, count: 12 },
  { id: 'laptop', label: 'Laptops', icon: Monitor, count: 18 },
  { id: 'desktop', label: 'Desktop PCs', icon: Cpu, count: 15 },
];

const mobileRepairs: RepairService[] = [
  { id: '1', name: 'Screen Replacement', description: 'Cracked or broken screen? We replace with OEM-quality displays.', price: 'From $49', duration: '30-60 min', icon: Smartphone, popular: true },
  { id: '2', name: 'Battery Replacement', description: 'Phone dying fast? Get a brand new battery installed.', price: 'From $29', duration: '20-30 min', icon: Battery, popular: true },
  { id: '3', name: 'Water Damage Repair', description: 'Dropped in water? We clean, dry & restore your device.', price: 'From $59', duration: '24-48 hrs', icon: Droplets },
  { id: '4', name: 'Charging Port Fix', description: 'Not charging? We repair or replace the charging connector.', price: 'From $25', duration: '30-45 min', icon: Zap },
  { id: '5', name: 'Camera Repair', description: 'Blurry photos? We fix front & rear camera modules.', price: 'From $35', duration: '30-45 min', icon: Camera },
  { id: '6', name: 'Speaker / Mic Fix', description: 'Can\'t hear or be heard? Audio component replacement.', price: 'From $20', duration: '20-30 min', icon: Volume2 },
  { id: '7', name: 'WiFi / Bluetooth', description: 'Connectivity issues? Antenna & chip-level repair.', price: 'From $30', duration: '30-60 min', icon: Wifi },
  { id: '8', name: 'Motherboard Repair', description: 'Advanced chip-level & micro-soldering repair services.', price: 'From $79', duration: '1-3 days', icon: CircuitBoard },
];

const brands = [
  'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo',
  'Realme', 'Sony', 'LG', 'Motorola'
];

export function RepairPage() {
  const { addRepairRequest } = useApp();
  const [activeDevice, setActiveDevice] = useState('mobile');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', device: '', issue: '', brand: '', serviceType: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>('');

  const faqs = [
    { q: 'How long does a typical screen repair take?', a: 'Most screen repairs are completed within 30-60 minutes. Walk-in repairs are welcome and usually done while you wait.' },
    { q: 'Do you offer warranty on repairs?', a: 'Yes! All repairs come with a 90-day warranty covering parts and labour. Screen replacements carry a 6-month warranty.' },
    { q: 'What brands do you service?', a: 'We service all major brands including Apple, Samsung, Google, OnePlus, Xiaomi, Huawei, and many more.' },
    { q: 'Can you recover data from a damaged phone?', a: 'In most cases, yes. We offer data recovery services even from severely damaged devices. Contact us for an assessment.' },
    { q: 'Do you use original parts?', a: 'We use OEM-quality parts that match original specifications. Premium genuine parts are available upon request at an additional cost.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create customer ID from phone (temporary solution)
    const customerId = `cust-${formData.phone.replace(/\D/g, '')}`;
    
    // Create the repair request with new schema
    const repair = addRepairRequest({
      customer_id: customerId,
      device_brand: formData.brand,
      device_model: formData.device,
      device_type: activeDevice as DeviceType,
      issue: formData.issue,
      service_type: formData.serviceType || 'General Repair',
    });
    
    setSubmittedId(repair.repair_id);
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111113] via-[#0a0a0b] to-[#18181b]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#22c55e]/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-6">
              <Wrench className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-xs font-mono text-[#a1a1aa]">REPAIR_SERVICES_ACTIVE</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Expert Device
              <span className="block text-[#3b82f6]">Repair Center</span>
            </h1>
            
            <p className="text-lg text-[#a1a1aa] mb-8 max-w-xl mx-auto leading-relaxed">
              Fast, reliable repair services for all your devices. Walk-in or book online — most repairs done while you wait.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#book-repair"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3b82f6] text-white font-semibold rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
              >
                Book a Repair
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+923001234567"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#27272a] text-white font-semibold rounded-lg hover:bg-[#18181b] transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { value: '10K+', label: 'Devices Repaired' },
              { value: '30min', label: 'Avg. Repair Time' },
              { value: '90 Days', label: 'Warranty' },
              { value: '4.9★', label: 'Rating' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-[#111113] border border-[#27272a]">
                <p className="text-2xl md:text-3xl font-bold text-white font-mono">{stat.value}</p>
                <p className="text-xs text-[#71717a] mt-1 font-mono uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Device Categories */}
      <section className="py-12 md:py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Select Device</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">What Needs Fixing?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {deviceCategories.map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveDevice(id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-5 md:p-6 rounded-xl border transition-all duration-300",
                  activeDevice === id
                    ? "bg-[#3b82f6]/10 border-[#3b82f6] text-white"
                    : "bg-[#111113] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]"
                )}
              >
                <Icon className={cn("w-7 h-7", activeDevice === id ? "text-[#3b82f6]" : "text-[#71717a]")} />
                <div className="text-center">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs mt-0.5 font-mono text-[#71717a]">{count} services</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Repair Services Grid */}
      <section className="py-12 md:py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Available Services</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Repair Services</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileRepairs.map((service, i) => (
              <div
                key={service.id}
                className="group relative bg-[#111113] border border-[#27272a] rounded-xl p-5 hover:border-[#3b82f6] transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {service.popular && (
                  <span className="absolute -top-2.5 right-4 px-3 py-1 bg-[#3b82f6] text-white text-[10px] font-bold rounded-full font-mono">
                    POPULAR
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-[#18181b] group-hover:bg-[#3b82f6]/10 flex items-center justify-center mb-4 transition-colors border border-[#27272a] group-hover:border-[#3b82f6]/30">
                  <service.icon className="w-6 h-6 text-[#71717a] group-hover:text-[#3b82f6] transition-colors" />
                </div>
                <h3 className="font-bold text-white mb-1.5">{service.name}</h3>
                <p className="text-sm text-[#71717a] mb-4 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                  <span className="font-bold text-[#3b82f6] font-mono">{service.price}</span>
                  <div className="flex items-center gap-1 text-xs text-[#71717a] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {service.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 border-t border-[#27272a] bg-[#111113]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Process</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#27272a] to-transparent" />

            {[
              { step: '01', title: 'Submit Request', desc: 'Fill out our form or call us with your device details.', icon: Send },
              { step: '02', title: 'Free Diagnosis', desc: 'Bring your device in for a free checkup & quote.', icon: Wrench },
              { step: '03', title: 'Expert Repair', desc: 'Our technicians fix your device with quality parts.', icon: Cpu },
              { step: '04', title: 'Pickup & Go', desc: 'Collect your device with warranty documentation.', icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-20 h-20 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto mb-4 relative z-10 group hover:border-[#3b82f6] transition-colors">
                  <item.icon className="w-8 h-8 text-[#71717a] group-hover:text-[#3b82f6] transition-colors" />
                </div>
                <span className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider font-mono">Step {item.step}</span>
                <h3 className="font-bold text-white mt-1 mb-1">{item.title}</h3>
                <p className="text-sm text-[#71717a]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands We Service */}
      <section className="py-12 md:py-16 overflow-hidden border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 text-center mb-8">
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Supported</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Brands We Service</h2>
        </div>
        <div className="relative">
          <div className="flex gap-6 animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <div key={i} className="flex-shrink-0 px-8 py-4 bg-[#111113] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors">
                <span className="text-lg font-bold text-[#71717a]">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form + Why Choose Us */}
      <section id="book-repair" className="py-12 md:py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 md:p-8">
              {formSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-[#22c55e]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                  <p className="text-[#71717a] mb-2">We'll contact you within 30 minutes to confirm your appointment.</p>
                  <p className="text-sm font-mono text-[#3b82f6] mb-6">Repair ID: {submittedId}</p>
                  <button 
                    onClick={() => setFormSubmitted(false)} 
                    className="text-[#3b82f6] font-semibold hover:text-[#60a5fa] transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Form</span>
                    <h2 className="text-2xl font-bold text-white">Book a Repair</h2>
                    <p className="text-[#71717a] mt-1 text-sm">Fill in the details and we'll get back to you ASAP.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2">Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white text-sm placeholder:text-[#52525b]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2">Phone</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white text-sm placeholder:text-[#52525b]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2">Brand</label>
                        <select
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white text-sm appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#18181b]">Select Brand</option>
                          {brands.map(b => <option key={b} value={b} className="bg-[#18181b]">{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2">Model</label>
                        <input
                          type="text"
                          value={formData.device}
                          onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                          placeholder="e.g. iPhone 15 Pro"
                          className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white text-sm placeholder:text-[#52525b]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2">Issue Description</label>
                      <textarea
                        rows={3}
                        required
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        placeholder="Tell us what's wrong with your device..."
                        className="w-full px-4 py-3 bg-[#0a0a0b] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#3b82f6] text-white text-sm resize-none placeholder:text-[#52525b]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#3b82f6] text-white font-semibold rounded-lg hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                    >
                      <Send className="w-5 h-5" />
                      Submit Repair Request
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Why Choose Us */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">Benefits</span>
                <h2 className="text-2xl font-bold text-white">Why Choose Us?</h2>
                <p className="text-[#71717a] mt-1 text-sm">Trusted by thousands of customers in Lahore</p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Zap, title: 'Same Day Repair', desc: 'Most repairs completed while you wait — no appointment needed.', color: 'blue' },
                  { icon: Shield, title: '90-Day Warranty', desc: 'All repairs backed by a comprehensive warranty on parts & labor.', color: 'green' },
                  { icon: Star, title: 'Certified Technicians', desc: 'Our team has 10+ years of experience with all device brands.', color: 'purple' },
                  { icon: MapPin, title: 'Walk-in Welcome', desc: 'Visit our shop on Main Boulevard, Lahore. Open 7 days a week.', color: 'cyan' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-[#111113] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-all group">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      item.color === 'blue' && "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]",
                      item.color === 'green' && "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]",
                      item.color === 'purple' && "bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]",
                      item.color === 'cyan' && "bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]",
                    )}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-[#71717a] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 border-t border-[#27272a]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider mb-2 block">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#111113] border border-[#27272a] rounded-xl overflow-hidden transition-all hover:border-[#3f3f46]">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-[#71717a] transition-transform duration-300 shrink-0",
                    expandedFaq === i && "rotate-180"
                  )} />
                </button>
                {expandedFaq === i && (
                  <div className="px-5 pb-5 -mt-1 animate-fade-in">
                    <p className="text-sm text-[#a1a1aa] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111113] via-[#18181b] to-[#111113] border border-[#27272a] p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22c55e]/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Need Urgent Repair?</h2>
                <p className="text-[#a1a1aa]">Walk in or call us — we'll fix your device today.</p>
              </div>
              <div className="flex gap-3">
                <a href="tel:+923001234567" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-semibold rounded-lg hover:bg-[#2563eb] transition-colors">
                  <Phone className="w-5 h-5" />
                  +92 300 1234567
                </a>
                <a href="#book-repair" className="inline-flex items-center gap-2 px-6 py-3 border border-[#27272a] text-white font-semibold rounded-lg hover:bg-[#18181b] transition-colors">
                  Book Online
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
