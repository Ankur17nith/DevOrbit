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
      className={`rounded-2xl bg-[#12151D] border border-[#1F2430] p-5 shadow-sm transition-all ${
        hoverEffect ? 'hover:border-[#8B5CF6]/40 hover:bg-[#151923] cursor-pointer' : ''
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
    <div className={`flex items-start justify-between gap-3 pb-3 border-b border-[#1F2430] ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-[#F8FAFC] leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-[#686D79] mt-0.5">{subtitle}</p>}
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

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 pt-3 border-t border-[#1F2430] flex items-center justify-between text-xs text-[#686D79] ${className}`}>
      {children}
    </div>
  );
}
