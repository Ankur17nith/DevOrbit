import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ElementType | React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm border border-[#8B5CF6] font-semibold',
  dark: 'bg-[#0B0D12] hover:bg-black text-white shadow-sm border border-black/10 font-medium',
  secondary: 'bg-white hover:bg-gray-50 text-[#0B0D12] border border-black/8 shadow-none font-medium',
  outline: 'bg-white hover:bg-gray-50 text-[#0B0D12] border border-black/9 shadow-none font-medium',
  ghost: 'bg-transparent hover:bg-black/5 text-[#686D79] hover:text-[#0B0D12] border border-transparent',
  danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-medium',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-[10px] rounded-md gap-1.5',
  md: 'px-3 py-1.5 text-xs rounded-md gap-2',
  lg: 'px-4 py-2 text-xs font-semibold rounded-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const renderIcon = () => {
    if (loading) return <Loader2 className="size-3.5 animate-spin shrink-0" />;
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as React.ElementType;
    return <IconComponent className="size-3.5 shrink-0" />;
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans transition-all active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {renderIcon()}
      <span>{children}</span>
    </button>
  );
}
