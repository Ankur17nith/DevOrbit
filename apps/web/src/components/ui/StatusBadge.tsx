import React from 'react';

export type BadgeVariant = 
  | 'default'
  | 'violet'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'info';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  default: {
    container: 'bg-[#F0F1F3] text-[#686D79] border-black/5',
    dot: 'bg-[#858993]',
  },
  neutral: {
    container: 'bg-[#F0F1F3] text-[#686D79] border-black/5',
    dot: 'bg-[#858993]',
  },
  violet: {
    container: 'bg-[#F0EDFA] text-[#8B5CF6] border-[#8B5CF6]/20',
    dot: 'bg-[#8B5CF6]',
  },
  success: {
    container: 'bg-[#EBF7EE] text-[#1E8A38] border-green-200',
    dot: 'bg-[#1E8A38]',
  },
  warning: {
    container: 'bg-[#FFF4E5] text-[#B76E00] border-amber-200',
    dot: 'bg-[#B76E00]',
  },
  danger: {
    container: 'bg-[#FDE8E8] text-[#9B1C1C] border-red-200',
    dot: 'bg-[#9B1C1C]',
  },
  info: {
    container: 'bg-[#EBF5FB] text-[#1A5276] border-blue-200',
    dot: 'bg-[#1A5276]',
  },
};

export function StatusBadge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  const styles = variantStyles[variant] || variantStyles.default;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[9px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-medium tracking-wide uppercase border ${styles.container} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${styles.dot}`} />}
      <span>{children}</span>
    </span>
  );
}
