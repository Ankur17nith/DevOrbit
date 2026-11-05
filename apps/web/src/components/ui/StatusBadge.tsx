import React from 'react';

export type BadgeVariant = 'violet' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'default';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
  violet: {
    bg: 'bg-[#8B5CF6]/15',
    text: 'text-[#A78BFA]',
    border: 'border-[#8B5CF6]/30',
    dotColor: 'bg-[#8B5CF6]',
  },
  success: {
    bg: 'bg-[#22C55E]/15',
    text: 'text-[#22C55E]',
    border: 'border-[#22C55E]/30',
    dotColor: 'bg-[#22C55E]',
  },
  warning: {
    bg: 'bg-[#F59E0B]/15',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/30',
    dotColor: 'bg-[#F59E0B]',
  },
  danger: {
    bg: 'bg-[#EF4444]/15',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/30',
    dotColor: 'bg-[#EF4444]',
  },
  info: {
    bg: 'bg-[#60A5FA]/15',
    text: 'text-[#60A5FA]',
    border: 'border-[#60A5FA]/30',
    dotColor: 'bg-[#60A5FA]',
  },
  neutral: {
    bg: 'bg-[#181C26]',
    text: 'text-[#C5C8D0]',
    border: 'border-[#1F2430]',
    dotColor: 'bg-[#686D79]',
  },
  default: {
    bg: 'bg-[#181C26]',
    text: 'text-[#C5C8D0]',
    border: 'border-[#1F2430]',
    dotColor: 'bg-[#686D79]',
  },
};

export function StatusBadge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}: StatusBadgeProps) {
  const styles = variantStyles[variant] || variantStyles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${styles.dotColor}`} />}
      {children}
    </span>
  );
}
