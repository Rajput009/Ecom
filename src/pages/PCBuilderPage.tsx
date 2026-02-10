import { useState, useMemo } from 'react';
import { 
  Cpu, Monitor, HardDrive, Zap, Box, Fan, CircuitBoard, MemoryStick, 
  Check, AlertTriangle, ShoppingCart, RotateCcw, ChevronDown,
  Sparkles, Gauge, ThermometerSun, Wifi, Volume2
} from 'lucide-react';
import { pcComponents } from '../data/products';
import { useApp } from '../context/AppContext';
import { PCComponent, PCBuild } from '../types';
import { cn } from '../utils/cn';

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
};

export function PCBuilderPage() {
  const { pcBuild, setPcBuild, addToCart } = useApp();
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

  const psuWattage = pcBuild.psu?.wattage || 0;
  const wattageMargin = psuWattage - totalWattage;
  const isPsuAdequate = wattageMargin >= 100;
  const wattagePercentage = psuWattage > 0 ? Math.min((totalWattage / psuWattage) * 100, 100) : 0;

  const componentCount = Object.values(pcBuild).filter(Boolean).length;
  const hasAllRequired = componentTypes
    .filter(c => c.required)
    .every(c => pcBuild[c.type as keyof PCBuild]);

  const getComponentsByType = (type: ComponentType) => {
    return pcComponents.filter(c => c.type === type);
  };

  const selectComponent = (component: PCComponent) => {
    setPcBuild(prev => ({
      ...prev,
      [component.type]: component
    }));
    setActiveType(null);
  };

  const removeComponent = (type: ComponentType) => {
    setPcBuild(prev => {
      const newBuild = { ...prev };
      delete newBuild[type as keyof PCBuild];
      return newBuild;
    });
  };

  const resetBuild = () => {
    setPcBuild({});
  };

  const addBuildToCart = () => {
    Object.values(pcBuild).forEach(comp => {
      if (comp) {
        addToCart({
          id: comp.id,
          name: comp.name,
          category: comp.type.toUpperCase(),
          price: comp.price,
          image: comp.image,
          description: comp.specs.join(', '),
          specs: comp.specs,
          stock: 10,
          rating: 4.5,
          reviews: 100
        });
      }
    });
  };

  // Performance score calculation
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  rgbEnabled ? "animate-rgb-flow" : "bg-gradient-to-br from-blue-600 to-purple-600"
                )}>
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">PC Builder</h1>
                  <p className="text-slate-400">Build your ultimate gaming machine</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRgbEnabled(!rgbEnabled)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                  rgbEnabled 
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25" 
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                )}
              >
                <Sparkles className="w-4 h-4" />
                RGB {rgbEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={resetBuild}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 backdrop-blur text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-600/50 transition-all border border-slate-600"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Component Selection - Left Panel */}
          <div className="lg:col-span-2 space-y-3">
            {componentTypes.map(({ type, label, icon: Icon, required, color }) => {
              const selected = pcBuild[type as keyof PCBuild];
              const isActive = activeType === type;
              const colors = colorClasses[color];

              return (
                <div 
                  key={type} 
                  className={cn(
                    "rounded-2xl overflow-hidden transition-all duration-300",
                    selected ? "bg-slate-800/80 border-2" : "bg-slate-800/50 border border-slate-700/50",
                    selected && colors.border,
                    isActive && "ring-2 ring-white/20"
                  )}
                >
                  <button
                    onClick={() => setActiveType(isActive ? null : type)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        selected 
                          ? cn(colors.bg, "shadow-lg", colors.glow) 
                          : "bg-slate-700/50 border border-slate-600"
                      )}>
                        <Icon className={cn("w-6 h-6", selected ? "text-white" : "text-slate-400")} />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{label}</h3>
                          {required && !selected && (
                            <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-medium">
                              Required
                            </span>
                          )}
                          {selected && (
                            <Check className={cn("w-4 h-4", colors.text)} />
                          )}
                        </div>
                        {selected ? (
                          <p className="text-sm text-slate-400 line-clamp-1">{selected.name}</p>
                        ) : (
                          <p className="text-sm text-slate-500">Click to select</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {selected && (
                        <div className="text-right">
                          <p className="font-bold text-white">${selected.price}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeComponent(type);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform",
                        isActive ? "rotate-180 bg-white/10" : "bg-slate-700/50"
                      )}>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </button>

                  {/* Component Options */}
                  {isActive && (
                    <div className="border-t border-slate-700/50 p-3 bg-slate-900/50 animate-fade-in-up">
                      <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                        {getComponentsByType(type).map(comp => (
                          <button
                            key={comp.id}
                            onClick={() => selectComponent(comp)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left group",
                              selected?.id === comp.id
                                ? cn("border-2", colors.border, "bg-slate-800")
                                : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                            )}
                          >
                            <div className="relative">
                              <img
                                src={comp.image}
                                alt={comp.name}
                                className="w-14 h-14 object-cover rounded-lg"
                              />
                              {selected?.id === comp.id && (
                                <div className={cn(
                                  "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                                  colors.bg
                                )}>
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                                {comp.name}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-1">{comp.specs.join(' • ')}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {comp.wattage > 0 && comp.type !== 'psu' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                                    {comp.wattage}W
                                  </span>
                                )}
                                {comp.type === 'psu' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                                    {comp.wattage}W Capacity
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">${comp.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PC Visualizer - Center */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* 3D PC Case Visualization */}
              <div className={cn(
                "relative rounded-3xl overflow-hidden",
                rgbEnabled ? "animate-pulse-glow" : ""
              )}>
                {/* Background glow effect */}
                <div className={cn(
                  "absolute inset-0 opacity-30",
                  rgbEnabled 
                    ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-rgb-flow bg-[length:400%_400%]" 
                    : "bg-gradient-to-br from-slate-700 to-slate-800"
                )} />
                
                <div className="relative p-6 bg-slate-900/80 backdrop-blur">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-400" />
                      Live Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      {rgbEnabled && (
                        <div className="flex gap-1">
                          {['bg-red-500', 'bg-green-500', 'bg-blue-500'].map((c, i) => (
                            <div key={i} className={cn("w-2 h-2 rounded-full animate-pulse", c)} style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PC Case Visual */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                    {/* Case Frame */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl border-4 transition-colors",
                      pcBuild.case ? "border-cyan-500/50 bg-slate-900" : "border-slate-700 bg-slate-900/50"
                    )}>
                      {/* Glass Panel Effect */}
                      <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-white/5 to-transparent" />
                      
                      {/* RGB Strip - Top */}
                      {rgbEnabled && pcBuild.case && (
                        <div className="absolute top-0 left-4 right-4 h-1 rounded-full animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                      )}

                      {/* Internal Layout */}
                      <div className="absolute inset-4 flex flex-col gap-3">
                        {/* Top Section - PSU (if top-mounted) */}
                        <div className={cn(
                          "h-14 rounded-xl flex items-center justify-center gap-2 transition-all relative overflow-hidden",
                          pcBuild.psu 
                            ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/50" 
                            : "bg-slate-800/50 border border-dashed border-slate-700"
                        )}>
                          {pcBuild.psu ? (
                            <>
                              <Zap className="w-5 h-5 text-yellow-400" />
                              <span className="text-xs font-medium text-yellow-400">
                                {pcBuild.psu.wattage}W PSU
                              </span>
                              {rgbEnabled && (
                                <div className="absolute inset-0 animate-shimmer" />
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-slate-600">PSU</span>
                          )}
                        </div>

                        {/* Middle Section - Main Components */}
                        <div className="flex-1 flex gap-3">
                          {/* Left Column - Motherboard Area */}
                          <div className="flex-1 flex flex-col gap-2">
                            {/* CPU + Cooler Area */}
                            <div className={cn(
                              "h-20 rounded-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden transition-all",
                              pcBuild.cpu 
                                ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/50" 
                                : "bg-slate-800/50 border border-dashed border-slate-700"
                            )}>
                              {pcBuild.cpu ? (
                                <>
                                  <div className="relative">
                                    <Cpu className="w-8 h-8 text-blue-400" />
                                    {pcBuild.cooler && (
                                      <div className="absolute -top-1 -right-1">
                                        <Fan className={cn(
                                          "w-4 h-4 text-pink-400",
                                          rgbEnabled && "animate-spin"
                                        )} style={{ animationDuration: '3s' }} />
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-medium text-blue-400 text-center line-clamp-1 px-2">
                                    {pcBuild.cpu.name.split(' ').slice(0, 3).join(' ')}
                                  </span>
                                  {rgbEnabled && (
                                    <div className="absolute inset-0 animate-shimmer" />
                                  )}
                                </>
                              ) : (
                                <>
                                  <Cpu className="w-6 h-6 text-slate-600" />
                                  <span className="text-[10px] text-slate-600">CPU</span>
                                </>
                              )}
                            </div>

                            {/* RAM Slots */}
                            <div className={cn(
                              "h-12 rounded-xl flex items-center justify-center gap-1 transition-all relative overflow-hidden",
                              pcBuild.ram 
                                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50" 
                                : "bg-slate-800/50 border border-dashed border-slate-700"
                            )}>
                              {pcBuild.ram ? (
                                <>
                                  <div className="flex gap-0.5">
                                    {[0, 1, 2, 3].map(i => (
                                      <div 
                                        key={i} 
                                        className={cn(
                                          "w-2 h-8 rounded-sm",
                                          i < 2 
                                            ? rgbEnabled 
                                              ? "animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500" 
                                              : "bg-purple-500" 
                                            : "bg-slate-700"
                                        )}
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                      />
                                    ))}
                                  </div>
                                  <MemoryStick className="w-4 h-4 text-purple-400 ml-1" />
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-600">RAM</span>
                              )}
                            </div>

                            {/* Motherboard */}
                            <div className={cn(
                              "flex-1 rounded-xl flex items-center justify-center relative overflow-hidden transition-all",
                              pcBuild.motherboard 
                                ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50" 
                                : "bg-slate-800/50 border border-dashed border-slate-700"
                            )}>
                              {pcBuild.motherboard ? (
                                <>
                                  <div className="flex flex-col items-center">
                                    <CircuitBoard className="w-10 h-10 text-green-400" />
                                    <span className="text-[10px] font-medium text-green-400 mt-1 text-center line-clamp-2 px-2">
                                      {pcBuild.motherboard.name.split(' ').slice(0, 3).join(' ')}
                                    </span>
                                  </div>
                                  {rgbEnabled && (
                                    <>
                                      <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                                      <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '1s' }} />
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <CircuitBoard className="w-8 h-8 text-slate-600" />
                                  <span className="text-[10px] text-slate-600 absolute bottom-2">Motherboard</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right Column - GPU & Storage */}
                          <div className="w-24 flex flex-col gap-2">
                            {/* GPU - Large Card */}
                            <div className={cn(
                              "flex-1 rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all",
                              pcBuild.gpu 
                                ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/50" 
                                : "bg-slate-800/50 border border-dashed border-slate-700"
                            )}>
                              {pcBuild.gpu ? (
                                <>
                                  <Monitor className="w-8 h-8 text-red-400" />
                                  <span className="text-[10px] font-medium text-red-400 mt-1 text-center line-clamp-2 px-1">
                                    {pcBuild.gpu.name.split(' ').slice(0, 2).join(' ')}
                                  </span>
                                  {/* GPU Fans */}
                                  <div className="flex gap-1 mt-1">
                                    {[0, 1, 2].map(i => (
                                      <div 
                                        key={i} 
                                        className={cn(
                                          "w-4 h-4 rounded-full border-2 border-red-400/50 flex items-center justify-center",
                                          rgbEnabled && "animate-spin"
                                        )}
                                        style={{ animationDuration: '2s', animationDelay: `${i * 0.1}s` }}
                                      >
                                        <div className="w-1 h-1 rounded-full bg-red-400" />
                                      </div>
                                    ))}
                                  </div>
                                  {rgbEnabled && (
                                    <div className="absolute inset-0 animate-shimmer" />
                                  )}
                                </>
                              ) : (
                                <>
                                  <Monitor className="w-6 h-6 text-slate-600" />
                                  <span className="text-[10px] text-slate-600 mt-1">GPU</span>
                                </>
                              )}
                            </div>

                            {/* Storage */}
                            <div className={cn(
                              "h-16 rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all",
                              pcBuild.storage 
                                ? "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/50" 
                                : "bg-slate-800/50 border border-dashed border-slate-700"
                            )}>
                              {pcBuild.storage ? (
                                <>
                                  <HardDrive className="w-5 h-5 text-orange-400" />
                                  <span className="text-[10px] font-medium text-orange-400 mt-0.5">
                                    SSD
                                  </span>
                                  {rgbEnabled && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                                  )}
                                </>
                              ) : (
                                <>
                                  <HardDrive className="w-4 h-4 text-slate-600" />
                                  <span className="text-[10px] text-slate-600">SSD</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom - Case Fans */}
                        <div className="flex justify-center gap-2">
                          {[0, 1, 2].map(i => (
                            <div 
                              key={i}
                              className={cn(
                                "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                                pcBuild.case ? "border-cyan-500/50" : "border-slate-700",
                                pcBuild.case && rgbEnabled && "animate-spin"
                              )}
                              style={{ animationDuration: '4s', animationDelay: `${i * 0.3}s` }}
                            >
                              <Fan className={cn(
                                "w-4 h-4",
                                pcBuild.case ? "text-cyan-400" : "text-slate-600"
                              )} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* RGB Strip - Bottom */}
                      {rgbEnabled && pcBuild.case && (
                        <div className="absolute bottom-0 left-4 right-4 h-1 rounded-full animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500" />
                      )}
                    </div>

                    {/* Case Label */}
                    {pcBuild.case && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 rounded-full text-[10px] font-bold text-white shadow-lg shadow-cyan-500/50">
                        {pcBuild.case.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Power Consumption */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-slate-400">Power</span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                        wattagePercentage > 90 ? "bg-red-500" : wattagePercentage > 70 ? "bg-yellow-500" : "bg-green-500"
                      )}
                      style={{ width: `${wattagePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-bold">{totalWattage}W</span>
                    <span className="text-slate-500">/ {psuWattage || '???'}W</span>
                  </div>
                  {pcBuild.psu && (
                    <div className={cn(
                      "flex items-center gap-1 mt-2 text-[10px]",
                      isPsuAdequate ? "text-green-400" : "text-red-400"
                    )}>
                      {isPsuAdequate ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {isPsuAdequate ? `+${wattageMargin}W headroom` : 'Insufficient!'}
                    </div>
                  )}
                </div>

                {/* Performance Score */}
                <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-medium text-slate-400">Performance</span>
                  </div>
                  <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className={cn(
                        "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                        rgbEnabled 
                          ? "animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                          : "bg-blue-500"
                      )}
                      style={{ width: `${performanceScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white font-bold">{performanceScore}%</span>
                    <span className="text-slate-500">Score</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Build Summary - Right Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Summary Card */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  Build Summary
                </h3>

                <div className="space-y-2 mb-4">
                  {Object.entries(pcBuild).map(([type, comp]) => {
                    if (!comp) return null;
                    const typeInfo = componentTypes.find(t => t.type === type);
                    const colors = typeInfo ? colorClasses[typeInfo.color] : colorClasses.blue;
                    return (
                      <div key={type} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/50">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
                          <span className="text-slate-400 capitalize">{type}</span>
                        </div>
                        <span className="font-medium text-white">${comp.price}</span>
                      </div>
                    );
                  })}

                  {componentCount === 0 && (
                    <p className="text-slate-500 text-sm text-center py-8">
                      Select components to build your PC
                    </p>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-400">Total</span>
                  <span className="text-2xl font-bold text-white">${totalPrice.toLocaleString()}</span>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">Build Progress</span>
                    <span className="text-white font-medium">{componentCount}/{componentTypes.length}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        rgbEnabled 
                          ? "animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500"
                      )}
                      style={{ width: `${(componentCount / componentTypes.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className={cn(
                  "flex items-center gap-2 p-3 rounded-xl text-sm mb-4",
                  hasAllRequired 
                    ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                    : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                )}>
                  {hasAllRequired ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Ready to build!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      <span>Select required parts</span>
                    </>
                  )}
                </div>

                <button
                  onClick={addBuildToCart}
                  disabled={!hasAllRequired}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-4 font-bold rounded-xl transition-all",
                    hasAllRequired
                      ? rgbEnabled 
                        ? "animate-rgb-flow bg-[length:400%_400%] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add Build to Cart
                </button>
              </div>

              {/* Quick Info */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <ThermometerSun className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Cooling</p>
                    <p className="text-xs font-medium text-white">{pcBuild.cooler ? 'Good' : 'Stock'}</p>
                  </div>
                  <div>
                    <Wifi className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">WiFi</p>
                    <p className="text-xs font-medium text-white">{pcBuild.motherboard ? 'Yes' : '-'}</p>
                  </div>
                  <div>
                    <Volume2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500">Noise</p>
                    <p className="text-xs font-medium text-white">{pcBuild.cooler ? 'Low' : 'Med'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
