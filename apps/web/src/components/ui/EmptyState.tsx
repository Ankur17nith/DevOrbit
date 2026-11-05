import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`rounded-2xl bg-[#12151D] border border-[#1F2430] p-10 flex flex-col items-center justify-center text-center ${className}`}>
      <div className="size-12 rounded-2xl bg-[#181C26] border border-[#1F2430] flex items-center justify-center text-[#8B5CF6] mb-3.5 shadow-inner">
        <Icon className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
      <p className="text-xs text-[#686D79] max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
