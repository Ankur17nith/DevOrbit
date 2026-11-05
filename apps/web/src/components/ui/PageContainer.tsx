import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'standard' | 'full' | 'narrow';
}

export function PageContainer({
  children,
  className = '',
  maxWidth = 'standard',
}: PageContainerProps) {
  const maxClass = 
    maxWidth === 'full' 
      ? 'max-w-none' 
      : maxWidth === 'narrow' 
        ? 'max-w-4xl' 
        : 'max-w-[1280px]';

  return (
    <div className={`w-full ${maxClass} mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-150 ${className}`}>
      {children}
    </div>
  );
}
