import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-white border border-black/7 p-4 sm:p-5 shadow-none transition-all ${
        hoverEffect ? 'hover:border-black/15 hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 pb-3 border-b border-black/7 ${className}`}>
      <div>
        <h3 className="text-xs sm:text-[11px] font-semibold text-[#0B0D12] leading-snug">{title}</h3>
        {subtitle && <p className="text-[10px] text-[#686D79] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`pt-3 ${className}`}>{children}</div>;
}
