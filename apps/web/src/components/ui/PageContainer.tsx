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
        ? 'max-w-5xl' 
        : 'max-w-[1440px]';

  return (
    <div className={`w-full ${maxClass} mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200 ${className}`}>
      {children}
    </div>
  );
}
