import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, Smartphone, Monitor, Tablet, CheckCircle, Clock,
  Shield, ArrowRight, ChevronDown, Phone, MapPin, Star,
  Zap, Droplets, Battery, Wifi, Camera, Volume2,
  CircuitBoard, Cpu, Send
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Footer } from '../components/Footer';
import { useApp } from '../context/AppContext';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { db } from '../services/database';
import { SEO } from '../components/SEO';
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
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState('mobile');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', device: '', issue: '', brand: '', serviceType: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    { q: 'How long does a typical screen repair take?', a: 'Most screen repairs are completed within 30-60 minutes. Walk-in repairs are welcome and usually done while you wait.' },
    { q: 'Do you offer warranty on repairs?', a: 'Yes! All repairs come with a 90-day warranty covering parts and labour. Screen replacements carry a 6-month warranty.' },
    { q: 'What brands do you service?', a: 'We service all major brands including Apple, Samsung, Google, OnePlus, Xiaomi, Huawei, and many more.' },
    { q: 'Can you recover data from a damaged phone?', a: 'In most cases, yes. We offer data recovery services even from severely damaged devices. Contact us for an assessment.' },
    { q: 'Do you use original parts?', a: 'We use OEM-quality parts that match original specifications. Premium genuine parts are available upon request at an additional cost.' },
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Zulfiqar Computers Repair Center",
    "image": "https://zulfiqar-computers.com/repair-center.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Boulevard",
      "addressLocality": "Lahore",
      "addressRegion": "Punjab",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.5204,
      "longitude": 74.3587
    },
    "url": "https://zulfiqar-computers.com/repair",
    "telephone": "+923001234567",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "21:00"
      }
    ]
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        navigate('/auth', { state: { from: { pathname: '/repair' } } });
        return;
      }

      const normalizedPhone = formData.phone.trim();
      let customer = await db.getCustomerByPhone(normalizedPhone);

      if (!customer) {
        customer = await db.addCustomer({
          name: formData.name.trim(),
          email: user.email || undefined,
          phone: normalizedPhone,
          address: '',
        });
      }

      const repair = await addRepairRequest({
        customer_id: customer.id,
        device_brand: formData.brand,
        device_model: formData.device,
        device_type: activeDevice as DeviceType,
        issue: formData.issue,
        service_type: formData.serviceType || 'General Repair',
        status: 'received',
      });

      setSubmittedId(repair.repair_id);
      setFormSubmitted(true);
    } catch (error) {
      setSubmitError('Unable to submit repair request. Please sign in and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      <SEO
        title="Professional iPhone, Laptop & PC Repair in Lahore"
        description="Expert repair services for iPhone, Samsung, MacBook, and Gaming PCs. Genuine parts, 90-day warranty, and 30-minute express service."
        schema={localBusinessSchema}
      />

      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#111113] via-[#0a0a0b] to-[#18181b]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-full mb-6">
              <Wrench className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-widest">REPAIR_SYSTEM_ONLINE</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Expert Device
              <span className="block text-[#3b82f6]">Repair Center</span>
            </h1>

            <p className="text-lg text-[#a1a1aa] mb-8 max-w-xl mx-auto leading-relaxed">
              Fast, reliable repair services for iPhone, MacBook, and Gaming Hardware. Certified technicians using genuine OEM parts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#book-repair" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] uppercase text-xs tracking-widest">
                Book a Repair <ArrowRight className="w-5 h-5" />
              </a>
              <a href="tel:+923001234567" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#18181b] border border-[#27272a] text-white font-bold rounded-xl hover:border-[#3b82f6] transition-all uppercase text-xs tracking-widest">
                <Phone className="w-5 h-5 text-[#3b82f6]" /> Call Hotline
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            {[
              { value: '10K+', label: 'UNITS_RESTORED' },
              { value: '30min', label: 'AVG_TAT' },
              { value: '90 Days', label: 'WARRANTY_SECURED' },
              { value: '4.9★', label: 'USER_RATING' },
            ].map(stat => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-[#111113] border border-[#27272a]">
                <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                <p className="text-[10px] text-[#71717a] mt-1 font-mono uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Services */}
      <section className="py-20 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-[10px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.4em] mb-3">Service Matrix</h2>
            <p className="text-3xl font-bold text-white">Advanced Diagnostics</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            {deviceCategories.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveDevice(id)} className={cn("flex flex-col items-center gap-4 p-6 rounded-2xl border transition-all duration-300", activeDevice === id ? "bg-[#3b82f6]/10 border-[#3b82f6] text-white" : "bg-[#111113] border-[#27272a] text-[#71717a] hover:border-[#3b82f6]/50")}>
                <Icon className={cn("w-8 h-8", activeDevice === id ? "text-[#3b82f6]" : "text-[#71717a]")} />
                <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobileRepairs.map((service) => (
              <div key={service.id} className="group bg-[#111113] border border-[#27272a] rounded-2xl p-6 hover:border-[#3b82f6] transition-all">
                <div className="w-12 h-12 bg-[#18181b] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#3b82f6]/20 transition-colors">
                  <service.icon className="w-6 h-6 text-[#71717a] group-hover:text-[#3b82f6]" />
                </div>
                <h3 className="font-bold text-white mb-2">{service.name}</h3>
                <p className="text-sm text-[#71717a] mb-6 leading-relaxed">{service.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-[#27272a]">
                  <span className="font-mono font-bold text-[#3b82f6]">{service.price}</span>
                  <span className="text-[10px] font-mono text-[#71717a] uppercase">{service.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking form section */}
      <section id="book-repair" className="py-20 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-[#111113] border border-[#27272a] rounded-3xl p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/5 rounded-full blur-3xl" />
              {formSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#22c55e] mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">REQUEST_LOGGED</h3>
                  <p className="text-[#71717a] mb-6 font-mono text-xs">REPAIR_ID: {submittedId}</p>
                  <button onClick={() => setFormSubmitted(false)} className="text-[#3b82f6] font-bold uppercase tracking-widest text-[10px] hover:underline">New Request</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-8">Service Intake Form</h2>
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-sm font-mono">{submitError}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="FULL_NAME" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                    <input type="tel" placeholder="PHONE_ID" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="BRAND" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                    <input type="text" placeholder="MODEL" required value={formData.device} onChange={(e) => setFormData({ ...formData, device: e.target.value })} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                  </div>
                  <textarea placeholder="DESCRIBE_SYSTEM_GLITCH..." rows={4} required value={formData.issue} onChange={(e) => setFormData({ ...formData, issue: e.target.value })} className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs resize-none" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 font-bold rounded-2xl transition-all uppercase text-xs tracking-[0.2em]",
                      isSubmitting
                        ? "bg-[#27272a] text-[#71717a] cursor-not-allowed"
                        : "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                    )}
                  >
                    {isSubmitting ? 'Submitting...' : 'Deploy Repair Request'}
                  </button>
                </form>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div>
                <h2 className="text-[10px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.4em] mb-4">Core Advantage</h2>
                <h3 className="text-3xl font-bold text-white mb-4">Why Enthusiasts Choose Us</h3>
                <p className="text-[#a1a1aa] leading-relaxed">Pakistan's leading certified repair center for high-end technology. From motherboard microsoldering to premium screen replacements.</p>
              </div>
              <div className="grid gap-4">
                {[
                  { icon: Zap, title: 'EXPRESS_SVC', desc: 'Repairs while you wait' },
                  { icon: Shield, title: 'DATA_SAFETY', desc: 'Secure data handling' },
                  { icon: CircuitBoard, title: 'OEM_PARTS', desc: 'Genuine components only' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 bg-[#111113] border border-[#27272a] rounded-2xl group hover:border-[#3b82f6]/50 transition-all">
                    <div className="w-12 h-12 bg-[#18181b] rounded-xl flex items-center justify-center border border-[#27272a] group-hover:border-[#3b82f6]/30"><item.icon className="w-6 h-6 text-[#3b82f6]" /></div>
                    <div><h4 className="font-bold text-white text-xs uppercase tracking-widest mb-1">{item.title}</h4><p className="text-xs text-[#71717a]">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
