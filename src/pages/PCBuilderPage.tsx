import { useState, useMemo } from 'react';
import {
  Cpu, Monitor, HardDrive, Zap, Box, Fan, CircuitBoard, MemoryStick,
  Check, AlertTriangle, ShoppingCart, RotateCcw, ChevronDown,
  Sparkles, Gauge, ThermometerSun, Wifi, Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePCComponents } from '../hooks/useProducts';
import { PCComponent, PCBuild } from '../types';
import { cn } from '../utils/cn';
import { SEO } from '../components/SEO';
import { Footer } from '../components/Footer';

const componentTypes = [
  { type: 'cpu', label: 'Processor (CPU)', icon: Cpu, required: true, color: 'blue' },
  { type: 'gpu', label: 'Graphics Card (GPU)', icon: Monitor, required: true, color: 'red' },
  { type: 'motherboard', label: 'Motherboard', icon: CircuitBoard, required: true, color: 'green' },
  { type: 'ram', label: 'Memory (RAM)', icon: MemoryStick, required: true, color: 'purple' },
  { type: 'storage', label: 'Storage (SSD/HDD)', icon: HardDrive, required: true, color: 'orange' },
  { type: 'psu', label: 'Power Supply (PSU)', icon: Zap, required: true, color: 'yellow' },
  { type: 'case', label: 'Case', icon: Box, required: false, color: 'cyan' },
  { type: 'cooler', label: 'CPU Cooler', icon: Fan, required: false, color: 'pink' },
] as const;

type ComponentType = typeof componentTypes[number]['type'];

const colorClasses = {
  blue: { bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-blue-500/50', text: 'text-blue-400' },
  red: { bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-red-500/50', text: 'text-red-400' },
  green: { bg: 'bg-green-500', border: 'border-green-400', glow: 'shadow-green-500/50', text: 'text-green-400' },
  purple: { bg: 'bg-purple-500', border: 'border-purple-400', glow: 'shadow-purple-500/50', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-500', border: 'border-orange-400', glow: 'shadow-orange-500/50', text: 'text-orange-400' },
  yellow: { bg: 'bg-yellow-500', border: 'border-yellow-400', glow: 'shadow-yellow-500/50', text: 'text-yellow-400' },
  cyan: { bg: 'bg-cyan-500', border: 'border-cyan-400', glow: 'shadow-cyan-500/50', text: 'text-cyan-400' },
  pink: { bg: 'bg-pink-500', border: 'border-pink-400', glow: 'shadow-pink-500/50', text: 'text-pink-400' },
} as const;

export function PCBuilderPage() {
  const { pcBuild, setPcBuild, addToCart, categories } = useApp();
  const { components, isLoading } = usePCComponents();
  const [activeType, setActiveType] = useState<ComponentType | null>(null);
  const [rgbEnabled, setRgbEnabled] = useState(true);

  const totalPrice = useMemo(() => {
    return Object.values(pcBuild).reduce((sum, comp) => sum + (comp?.price || 0), 0);
  }, [pcBuild]);

  const totalWattage = useMemo(() => {
    return Object.values(pcBuild).reduce((sum, comp) => {
      if (comp?.type === 'psu') return sum;
      return sum + (comp?.wattage || 0);
    }, 0);
  }, [pcBuild]);

  const psuWattage = (pcBuild as any).psu?.wattage || 0;
  const wattagePercentage = psuWattage > 0 ? Math.min((totalWattage / psuWattage) * 100, 100) : 0;

  const hasAllRequired = componentTypes
    .filter(c => c.required)
    .every(c => pcBuild[c.type as keyof PCBuild]);

  const selectComponent = (component: PCComponent) => {
    setPcBuild(prev => ({ ...prev, [component.type]: component }));
    setActiveType(null);
  };

  const removeComponent = (type: ComponentType) => {
    setPcBuild(prev => {
      const newBuild = { ...prev };
      delete newBuild[type as keyof PCBuild];
      return newBuild;
    });
  };

  const resetBuild = () => setPcBuild({});

  const performanceScore = useMemo(() => {
    let score = 0;
    if (pcBuild.cpu) score += 25;
    if (pcBuild.gpu) score += 35;
    if (pcBuild.ram) score += 15;
    if (pcBuild.storage) score += 10;
    if (pcBuild.motherboard) score += 10;
    if (pcBuild.cooler) score += 5;
    return score;
  }, [pcBuild]);

  if (isLoading && components.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#27272a] border-t-[#3b82f6] rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">SYNC_COMPONENTS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-16">
      <SEO
        title="Interactive Custom PC Builder & Compatibility Checker"
        description="Build your dream gaming PC with our interactive compatibility checker. Real-time wattage calculation and performance scoring for enthusiasts."
      />

      <div className="relative overflow-hidden border-b border-[#27272a] bg-[#111113]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-[#27272a]", rgbEnabled ? "animate-rgb-flow text-white border-white/20" : "bg-[#18181b] text-[#3b82f6]")}>
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Custom PC Builder</h1>
                  <p className="text-[#a1a1aa] font-mono text-xs uppercase tracking-widest mt-1">Status: Rig_Architecture_Active</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setRgbEnabled(!rgbEnabled)} className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all", rgbEnabled ? "bg-white text-black shadow-lg" : "bg-[#18181b] text-white border border-[#27272a]")}>
                <Sparkles className="w-4 h-4" /> RGB {rgbEnabled ? 'ON' : 'OFF'}
              </button>
              <button onClick={resetBuild} className="px-6 py-3 bg-[#18181b] text-[#ef4444] border border-[#ef4444]/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#ef4444]/10 transition-all">
                <RotateCcw className="w-4 h-4" /> Purge Build
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {componentTypes.map(({ type, label, icon: Icon, required, color }) => {
              const selected = pcBuild[type as keyof PCBuild];
              const isActive = activeType === type;
              const colors = (colorClasses as any)[color];
              return (
                <div key={type} className={cn("rounded-2xl border transition-all duration-300", selected ? "bg-[#111113] border-[#27272a]" : "bg-[#111113] border-[#27272a] opacity-80", isActive && "border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.1)]")}>
                  <button onClick={() => setActiveType(isActive ? null : type)} className="w-full flex items-center justify-between p-5">
                    <div className="flex items-center gap-5">
                      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center transition-all border", selected ? cn(colors.bg, "border-white/20 shadow-lg") : "bg-[#18181b] border-[#27272a]")}>
                        <Icon className={cn("w-7 h-7", selected ? "text-white" : "text-[#71717a]")} />
                      </div>
                      <div className="text-left">
                        <h3 className="text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-widest mb-1">{label}</h3>
                        {selected ? <p className="text-sm font-bold text-white line-clamp-1">{selected.name}</p> : <p className="text-xs text-[#3f3f46] font-mono">SELECT_UNIT</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {selected && <div className="text-right"><p className="font-mono font-bold text-white text-sm">${selected.price}</p><button onClick={(e) => { e.stopPropagation(); removeComponent(type); }} className="text-[9px] text-[#ef4444] font-mono hover:underline uppercase tracking-widest">Remove</button></div>}
                      <ChevronDown className={cn("w-4 h-4 text-[#71717a] transition-transform", isActive && "rotate-180")} />
                    </div>
                  </button>
                  {isActive && (
                    <div className="border-t border-[#27272a] p-4 bg-[#0a0a0b] animate-slide-down">
                      <div className="grid gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {components.filter(c => c.type === type).map(comp => (
                          <button key={comp.id} onClick={() => selectComponent(comp)} className="flex items-center gap-4 p-4 rounded-xl bg-[#111113] border border-[#27272a] hover:border-[#3b82f6] transition-all text-left">
                            <div className="w-16 h-16 bg-[#18181b] rounded-lg overflow-hidden shrink-0"><img src={comp.image} alt={comp.name} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 min-w-0"><h4 className="font-bold text-white text-sm truncate">{comp.name}</h4><p className="text-[10px] text-[#71717a] line-clamp-1 font-mono mt-1">{comp.specs.join(' | ')}</p></div>
                            <div className="text-right font-mono text-sm font-bold text-[#3b82f6]">${comp.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111113] border border-[#27272a] rounded-3xl p-8 relative overflow-hidden h-full">
              <div className="absolute inset-0 bg-circuit opacity-10" />
              <h3 className="text-[10px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.4em] mb-12 flex items-center gap-2">
                <Monitor className="w-4 h-4" /> Rig_Visualizer
              </h3>
              <div className="relative aspect-[3/4] max-w-xs mx-auto">
                <div className={cn("w-full h-full border-2 rounded-3xl p-4 transition-all", pcBuild.case ? "border-[#3b82f6]/50 bg-black/40" : "border-[#27272a] border-dashed")}>
                  {/* Visualization components... */}
                  <div className="h-full flex flex-col gap-4">
                    <div className={cn("h-16 rounded-xl border border-dashed border-[#27272a] flex items-center justify-center", pcBuild.psu && "border-solid border-yellow-500/50 bg-yellow-500/10")}>
                      {pcBuild.psu ? <Zap className="text-yellow-500 w-6 h-6" /> : <span className="text-[10px] font-mono text-[#27272a]">POWER_BAY</span>}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className={cn("rounded-xl border border-dashed border-[#27272a] flex items-center justify-center", pcBuild.cpu && "border-solid border-blue-500/50 bg-blue-500/10")}>
                        {pcBuild.cpu ? <Cpu className="text-blue-500 w-10 h-10" /> : <Cpu className="text-[#27272a] w-8 h-8" />}
                      </div>
                      <div className={cn("rounded-xl border border-dashed border-[#27272a] flex items-center justify-center", pcBuild.gpu && "border-solid border-red-500/50 bg-red-500/10")}>
                        {pcBuild.gpu ? <Monitor className="text-red-500 w-10 h-10" /> : <Monitor className="text-[#27272a] w-8 h-8" />}
                      </div>
                    </div>
                    <div className="h-24 grid grid-cols-3 gap-2">
                      {[0, 1, 2].map(i => <div key={i} className={cn("rounded-full border border-dashed border-[#27272a] flex items-center justify-center", pcBuild.case && "border-solid border-cyan-500/50 bg-cyan-500/10")}>
                        <Fan className={cn("w-6 h-6", pcBuild.case ? "text-cyan-500" : "text-[#27272a]")} />
                      </div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111113] border border-[#27272a] rounded-3xl p-6 sticky top-24">
              <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-8 border-b border-[#27272a] pb-4">Build Info</h3>
              <div className="space-y-6 mb-12">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#71717a] uppercase mb-2"><span>Performance</span><span>{performanceScore}%</span></div>
                  <div className="h-1.5 bg-[#18181b] rounded-full overflow-hidden"><div className="h-full bg-[#3b82f6] transition-all" style={{ width: `${performanceScore}%` }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#71717a] uppercase mb-2"><span>Power_Load</span><span>{totalWattage}W</span></div>
                  <div className="h-1.5 bg-[#18181b] rounded-full overflow-hidden"><div className={cn("h-full transition-all", wattagePercentage > 85 ? "bg-[#ef4444]" : "bg-[#22c55e]")} style={{ width: `${wattagePercentage}%` }} /></div>
                </div>
              </div>
              <div className="flex justify-between items-end mb-8"><span className="text-[10px] font-mono text-[#71717a] uppercase">Subtotal</span><span className="text-2xl font-bold text-white font-mono">${totalPrice.toLocaleString()}</span></div>
              <button disabled={!hasAllRequired} className={cn("w-full py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all", hasAllRequired ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-blue-500/20" : "bg-[#18181b] text-[#27272a] border border-[#27272a] cursor-not-allowed")}>
                Complete Build
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
