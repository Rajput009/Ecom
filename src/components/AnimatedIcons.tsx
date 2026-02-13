// Optimized Animated Industrial Tech Icons
// Lightweight SVG icons with CSS animations for performance

import React from 'react';

export interface AnimatedIconProps {
  size?: number;
  className?: string;
  isAnimated?: boolean;
}

// Shared theme colors
const THEME = {
  bgSecondary: '#111113',
  bgTertiary: '#18181b',
  border: '#27272a',
  blue: '#3b82f6',
  copper: '#b87333',
  copperDark: '#8b5a2b',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
};

// Optimized CPU Icon
export const AnimatedCPU: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="8" width="32" height="32" rx="2" fill={THEME.bgTertiary} stroke={THEME.border} strokeWidth="1"/>
    <rect x="14" y="14" width="20" height="20" rx="1" fill={THEME.bgSecondary} stroke={THEME.border}/>
    <rect x="18" y="18" width="12" height="12" fill={THEME.blue} opacity="0.8">
      {isAnimated && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>}
    </rect>
    {/* Pins */}
    {[12, 24, 36].map(x => [12, 36].map(y => (
      <rect key={`p-${x}-${y}`} x={x-2} y={y-2} width="4" height="4" fill={THEME.copperDark} opacity="0.6"/>
    )))}
  </svg>
);

// Optimized GPU Icon
export const AnimatedGPU: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="2" y="14" width="44" height="20" rx="2" fill={THEME.bgTertiary} stroke={THEME.border}/>
    {/* Fans */}
    {[14, 34].map(cx => (
      <g key={cx}>
        <circle cx={cx} cy="24" r="7" fill={THEME.bgSecondary} stroke={THEME.border}/>
        <g style={isAnimated ? {transformOrigin: `${cx}px 24px`, animation: 'spin 3s linear infinite'} : undefined}>
          {[0, 90, 180, 270].map(deg => (
            <path key={deg} d={`M${cx} 24 C${cx+3} 20, ${cx+5} 22, ${cx} 24`} fill={THEME.textSecondary} transform={`rotate(${deg} ${cx} 24)`}/>
          ))}
        </g>
      </g>
    ))}
    {/* Power LED */}
    <circle cx="42" cy="18" r="1.5" fill={THEME.blue}>
      {isAnimated && <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>}
    </circle>
  </svg>
);

// Optimized RAM Icon
export const AnimatedRAM: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="2" y="18" width="44" height="12" rx="1" fill={THEME.bgSecondary} stroke={THEME.border}/>
    {/* Heat spreader with RGB effect */}
    <rect x="4" y="16" width="40" height="3" rx="0.5" fill={THEME.blue}>
      {isAnimated && <animate attributeName="fill" values="#3b82f6;#9333ea;#3b82f6" dur="3s" repeatCount="indefinite"/>}
    </rect>
    {/* Chips */}
    {[8, 16, 24, 32, 40].map(x => (
      <rect key={x} x={x} y="20" width="5" height="6" rx="0.5" fill={THEME.bgTertiary} stroke={THEME.border} strokeWidth="0.5"/>
    ))}
    {/* Notch */}
    <rect x="22" y="30" width="4" height="2" fill={THEME.bgSecondary}/>
  </svg>
);

// Optimized SSD Icon
export const AnimatedSSD: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="16" width="40" height="16" rx="1" fill={THEME.bgTertiary} stroke={THEME.border}/>
    {/* Controller */}
    <rect x="32" y="20" width="6" height="8" rx="0.5" fill={THEME.bgSecondary} stroke={THEME.blue} strokeWidth="0.5"/>
    {/* Memory chips */}
    {[8, 16, 24].map((x, i) => (
      <g key={x}>
        <rect x={x} y="19" width="6" height="10" rx="0.5" fill={THEME.bgSecondary} stroke={THEME.border} strokeWidth="0.5"/>
        {isAnimated && (
          <rect x={x+1} y={20} width="1" height="1" fill={THEME.blue}>
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite"/>
          </rect>
        )}
      </g>
    ))}
    {/* Connector */}
    <path d="M42 18 H44 M42 20 H44 M42 22 H44 M42 24 H44" stroke={THEME.copper} strokeWidth="1"/>
  </svg>
);

// Optimized Motherboard Icon
export const AnimatedMotherboard: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="4" width="40" height="40" rx="2" fill={THEME.bgSecondary} stroke={THEME.border} strokeWidth="1.5"/>
    {/* CPU Socket */}
    <rect x="14" y="12" width="12" height="12" fill={THEME.bgTertiary} stroke={THEME.border}/>
    {/* RAM Slots */}
    {[32, 36, 40].map((x, i) => (
      <g key={x}>
        <rect x={x} y="10" width="2" height="20" rx="0.5" fill={THEME.bgTertiary} stroke={THEME.blue} strokeWidth="0.5"/>
        {isAnimated && (
          <rect x={x} y="12" width="2" height="1" fill={THEME.blue} opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2s" begin={`${i * 0.2}s`} repeatCount="indefinite"/>
          </rect>
        )}
      </g>
    ))}
    {/* PCIe Slots */}
    <rect x="8" y="32" width="28" height="3" fill={THEME.bgTertiary} stroke={THEME.blue} strokeWidth="0.5"/>
    <rect x="8" y="38" width="28" height="2" fill={THEME.bgTertiary} stroke={THEME.border} strokeWidth="0.5"/>
    {/* Chipset */}
    <rect x="32" y="32" width="10" height="10" rx="1" fill={THEME.bgTertiary} stroke={THEME.border}/>
  </svg>
);

// Optimized PSU Icon
export const AnimatedPSU: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="8" width="40" height="32" rx="2" fill={THEME.bgSecondary} stroke={THEME.border}/>
    {/* Fan */}
    <circle cx="24" cy="24" r="12" fill={THEME.bgTertiary} stroke={THEME.border}/>
    <g style={isAnimated ? {transformOrigin: '24px 24px', animation: 'spin 4s linear infinite'} : undefined}>
      <path d="M24 24 L24 12 M24 24 L36 24 M24 24 L24 36 M24 24 L12 24" stroke={THEME.textSecondary} strokeWidth="3" opacity="0.5"/>
      <circle cx="24" cy="24" r="2" fill={THEME.blue}/>
    </g>
    {/* Label */}
    <text x="10" y="38" fill={THEME.textTertiary} fontSize="4" fontFamily="monospace" fontWeight="bold">PSU</text>
  </svg>
);

// Optimized Fan Icon
export const AnimatedFan: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="4" width="40" height="40" rx="4" fill={THEME.bgSecondary} stroke={THEME.border} strokeWidth="1.5"/>
    <circle cx="24" cy="24" r="18" fill={THEME.bgTertiary} stroke={THEME.border}/>
    <g style={isAnimated ? {transformOrigin: '24px 24px', animation: 'spin 1.5s linear infinite'} : undefined}>
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <path key={deg} d="M24 24 C30 18, 32 24, 24 30" fill={THEME.textSecondary} transform={`rotate(${deg} 24 24)`}/>
      ))}
      <circle cx="24" cy="24" r="4" fill={THEME.bgSecondary} stroke={THEME.blue}/>
      <circle cx="24" cy="24" r="2" fill={THEME.blue}/>
    </g>
  </svg>
);

// Optimized Case Icon
export const AnimatedCase: React.FC<AnimatedIconProps> = ({ size = 48, isAnimated = true }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="32" height="40" rx="2" fill={THEME.bgSecondary} stroke={THEME.border} strokeWidth="1.5"/>
    {/* Side panel window */}
    <rect x="10" y="8" width="26" height="28" rx="1" fill={THEME.bgTertiary} stroke={THEME.blue} strokeWidth="0.5" opacity="0.4"/>
    {/* RGB strip */}
    {isAnimated && (
      <path d="M12 8 V36" stroke={THEME.blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
      </path>
    )}
    {/* Front I/O */}
    <circle cx="38" cy="10" r="1" fill={THEME.blue}/>
    <rect x="36" y="14" width="2" height="0.5" fill={THEME.textTertiary}/>
    {/* Feet */}
    <rect x="12" y="44" width="6" height="2" fill={THEME.bgTertiary} stroke={THEME.border}/>
    <rect x="30" y="44" width="6" height="2" fill={THEME.bgTertiary} stroke={THEME.border}/>
  </svg>
);

// Icon mapping for component types
export const AnimatedIconMap: Record<string, React.FC<AnimatedIconProps>> = {
  cpu: AnimatedCPU,
  gpu: AnimatedGPU,
  motherboard: AnimatedMotherboard,
  ram: AnimatedRAM,
  storage: AnimatedSSD,
  psu: AnimatedPSU,
  case: AnimatedCase,
  cooler: AnimatedFan,
};
