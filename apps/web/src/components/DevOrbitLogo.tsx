import React from 'react';

interface DevOrbitMarkProps {
  className?: string;
  size?: number | string;
  dotColor?: string;
  variant?: 'dark' | 'light';
}

export function DevOrbitMark({ className = 'h-7 w-7', dotColor = '#8B5CF6', variant = 'dark' }: DevOrbitMarkProps) {
  const isLight = variant === 'light';
  const mainColor = isLight ? '#0E121B' : '#F8FAFC';
  const outlineColor = isLight ? '#FFFFFF' : '#0B0D12';

  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="DevOrbit Mark"
    >
      <defs>
        <mask id={`brand-orbit-cut-${variant}`}>
          <rect width="96" height="96" fill="white" />
          <path d="M14 64C30 45 57 37 82 47" stroke="black" strokeWidth="7" strokeLinecap="round" />
        </mask>
      </defs>
      <path
        d="M21 14H47C70.5 14 86 27.2 86 48C86 68.8 70.5 82 47 82H21V14ZM34 26V70H47C63.2 70 73 61.9 73 48C73 34.1 63.2 26 47 26H34Z"
        fill={mainColor}
        fillRule="evenodd"
        clipRule="evenodd"
        mask={`url(#brand-orbit-cut-${variant})`}
      />
      <path d="M15 64C31 45 57 37 82 47" stroke={mainColor} strokeWidth="4" strokeLinecap="round" />
      <circle cx="77.5" cy="45.6" r="6.5" fill={dotColor} stroke={outlineColor} strokeWidth="2.5" />
    </svg>
  );
}

interface DevOrbitLogoProps {
  className?: string;
  markClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  variant?: 'dark' | 'light';
}

export function DevOrbitLogo({ className = '', markClassName, size = 'md', showBadge = true, variant = 'dark' }: DevOrbitLogoProps) {
  const markSize = size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-9 w-9' : 'h-7 w-7';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <DevOrbitMark className={markClassName || markSize} variant={variant} />
      <div className="flex items-center gap-1.5">
        <span className={`font-display font-bold tracking-tight ${textSize} ${isLight ? 'text-[#0E121B]' : 'text-[#F8FAFC]'}`}>
          Dev<span className={isLight ? 'text-[#686D79]' : 'text-[#C5C8D0]'}>Orbit</span>
        </span>
        {showBadge && (
          <span className={`hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono font-medium rounded ${
            isLight 
              ? 'text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30' 
              : 'text-[#A78BFA] bg-[#8B5CF6]/15 border border-[#8B5CF6]/30'
          }`}>
            v0.1.0
          </span>
        )}
      </div>
    </div>
  );
}
