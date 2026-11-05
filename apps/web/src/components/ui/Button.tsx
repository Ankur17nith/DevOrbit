import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm shadow-[#8B5CF6]/25 border border-[#8B5CF6]',
  secondary: 'bg-[#181C26] hover:bg-[#202431] text-[#F8FAFC] border border-[#1F2430] hover:border-[#8B5CF6]/40 shadow-sm',
  ghost: 'bg-transparent hover:bg-[#181C26] text-[#C5C8D0] hover:text-[#F8FAFC] border border-transparent',
  danger: 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30',
  outline: 'bg-transparent hover:bg-[#181C26] text-[#F8FAFC] border border-[#1F2430] hover:border-[#2E364A]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="size-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
